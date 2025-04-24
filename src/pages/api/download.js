import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { iconPath, color, forDownload = false } = req.body;

    if (!iconPath) {
      return res.status(400).json({ error: 'Icon path is required' });
    }

    // Validate color format (should be a hex color)
    const validColors = {
      'red': '#FF5350',
      'blue': '#45D1F4',
      'grey': '#808080' // Sarvārth Grey color
    };

    const hexColor = validColors[color] || '#000000'; // Default to black

    // Get the actual file path on the server
    // We need to convert from the public URL path to the actual file path
    const filePath = path.join(process.cwd(), 'public', iconPath.replace(/^\//, ''));

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Icon not found' });
    }

    // Read the SVG file
    let svgContent = fs.readFileSync(filePath, 'utf8');

    // For download, just apply the color without any extra transformations or wrappers
    if (forDownload) {
      // Simple color replacement for line icons
      const coloredSvg = svgContent
        // Replace stroke attributes
        .replace(/stroke="[^"]*"/g, `stroke="${hexColor}"`)
        .replace(/stroke='[^']*'/g, `stroke='${hexColor}'`)
        // Replace stroke in style attributes
        .replace(/style="([^"]*)stroke:[^;]*;([^"]*)"/g, `style="$1stroke:${hexColor};$2"`)
        .replace(/style='([^']*)stroke:[^;]*;([^']*)'/g, `style='$1stroke:${hexColor};$2'`)
        // For path elements without stroke
        .replace(/<path([^>]*)>/g, (match, attributes) => {
          if (!attributes.includes('stroke=')) {
            return `<path${attributes} stroke="${hexColor}">`;
          }
          return match;
        })
        // Only replace fill if there's no stroke attribute already
        .replace(/<([^>]*)fill="[^"]*"([^>]*)>/g, (match, before, after) => {
          if (!match.includes('stroke=')) {
            return `<${before}fill="${hexColor}"${after}>`;
          }
          return match;
        })
        .replace(/<([^>]*)fill='[^']*'([^>]*)>/g, (match, before, after) => {
          if (!match.includes('stroke=')) {
            return `<${before}fill='${hexColor}'${after}>`;
          }
          return match;
        });

      // Set appropriate headers for SVG download
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', 'attachment; filename=icon.svg');
      
      // Send the modified SVG without any wrappers
      return res.status(200).send(coloredSvg);
    }
    
    // For preview in the UI, we use the existing approach with sizing/positioning
    // STEP 1: Increase the SVG size in multiple ways to ensure it works
    // Method 1: Add/modify width and height attributes
    const hasWidth = svgContent.match(/width="[^"]*"/);
    const hasHeight = svgContent.match(/height="[^"]*"/);
    
    if (hasWidth) {
      svgContent = svgContent.replace(/width="([^"]*)"/g, (match, value) => {
        // If value has a unit, keep it, otherwise default to pixels
        if (isNaN(parseFloat(value))) {
          // Has units or is not a number
          const numericPart = parseFloat(value);
          const unitPart = value.replace(/[\d.-]/g, '');
          return `width="${numericPart * 2}${unitPart}"`;
        } else {
          // Plain number
          return `width="${parseFloat(value) * 2}"`;
        }
      });
    } else {
      // No width attribute, add one with a default size
      svgContent = svgContent.replace(/<svg/, '<svg width="48"');
    }
    
    if (hasHeight) {
      svgContent = svgContent.replace(/height="([^"]*)"/g, (match, value) => {
        // If value has a unit, keep it, otherwise default to pixels
        if (isNaN(parseFloat(value))) {
          // Has units or is not a number
          const numericPart = parseFloat(value);
          const unitPart = value.replace(/[\d.-]/g, '');
          return `height="${numericPart * 2}${unitPart}"`;
        } else {
          // Plain number
          return `height="${parseFloat(value) * 2}"`;
        }
      });
    } else {
      // No height attribute, add one with a default size
      svgContent = svgContent.replace(/<svg/, '<svg height="48"');
    }
    
    // Method 2: Update viewBox if present
    const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
    if (viewBoxMatch) {
      const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(parseFloat);
      if (viewBoxValues.length === 4) {
        const newViewBox = `${viewBoxValues[0]} ${viewBoxValues[1]} ${viewBoxValues[2] * 2} ${viewBoxValues[3] * 2}`;
        svgContent = svgContent.replace(/viewBox="[^"]*"/, `viewBox="${newViewBox}"`);
      }
    }
    
    // Method 3: Add a scaling transform to the whole SVG
    // This ensures the icon will be larger even if other methods fail
    svgContent = svgContent.replace(/<svg([^>]*)>/, (match, attributes) => {
      if (attributes.includes('transform=')) {
        // If there's already a transform, we need to be careful
        return match.replace(/transform="([^"]*)"/, 'transform="$1 scale(2)"');
      } else {
        // No transform, add one
        return `<svg${attributes} transform="scale(2)">`;
      }
    });
    
    // Method 4: Add a style tag to ensure proper scaling
    svgContent = svgContent.replace(/<svg([^>]*)>/, (match, attributes) => {
      if (!attributes.includes('style=')) {
        return `<svg${attributes} style="transform-origin: center; transform: scale(2);">`;
      } else {
        return match.replace(/style="([^"]*)"/, 'style="$1; transform-origin: center; transform: scale(2);"');
      }
    });

    // STEP 2: Apply the color change
    // For line icons, we want to modify the stroke color instead of fill
    svgContent = svgContent
      // Replace stroke attributes (for line icons)
      .replace(/stroke="[^"]*"/g, `stroke="${hexColor}"`)
      .replace(/stroke='[^']*'/g, `stroke='${hexColor}'`)
      
      // Replace stroke in style attributes
      .replace(/style="([^"]*)stroke:[^;]*;([^"]*)"/g, `style="$1stroke:${hexColor};$2"`)
      .replace(/style='([^']*)stroke:[^;]*;([^']*)'/g, `style='$1stroke:${hexColor};$2'`)
      
      // For SVGs without explicit stroke, add it to the main SVG element
      .replace(/<svg ([^>]*)>/i, (match, attributes) => {
        if (!attributes.includes('stroke=')) {
          return `<svg ${attributes} stroke="${hexColor}">`;
        }
        return match;
      })
      
      // Handle path elements without stroke
      .replace(/<path([^>]*)>/g, (match, attributes) => {
        if (!attributes.includes('stroke=')) {
          return `<path${attributes} stroke="${hexColor}">`;
        }
        return match;
      })
      
      // Only replace fill if there's no stroke attribute already
      // This handles the case where some icons might be using fill instead of stroke
      .replace(/<([^>]*)fill="[^"]*"([^>]*)>/g, (match, before, after) => {
        if (!match.includes('stroke=')) {
          return `<${before}fill="${hexColor}"${after}>`;
        }
        return match;
      })
      .replace(/<([^>]*)fill='[^']*'([^>]*)>/g, (match, before, after) => {
        if (!match.includes('stroke=')) {
          return `<${before}fill='${hexColor}'${after}>`;
        }
        return match;
      });

    // Set appropriate headers for SVG download or display
    res.setHeader('Content-Type', 'image/svg+xml');
    if (req.headers['content-disposition']?.includes('attachment')) {
      res.setHeader('Content-Disposition', 'attachment; filename=icon.svg');
    }
    
    // Send the modified SVG
    res.status(200).send(svgContent);
  } catch (error) {
    console.error('Error processing SVG download:', error);
    res.status(500).json({ error: 'Failed to process SVG download' });
  }
} 