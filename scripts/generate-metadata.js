/**
 * Icon Metadata Generator
 * 
 * This script scans the icon directories and generates metadata for each icon
 * including filenames, categories, subcategories, and keywords.
 * It supports a nested folder structure and alias keywords.
 */

const fs = require('fs');
const path = require('path');

// Icon directories
const SVG_DIR = path.join(process.cwd(), 'public', 'icons', 'svg');
const PNG_DIR = path.join(process.cwd(), 'public', 'icons', 'png');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'icon-metadata.json');
const ALIAS_FILE = path.join(process.cwd(), 'src', 'data', 'icon-aliases.json');

// Ensure output directories exist
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Main categories based on PRD
const MAIN_CATEGORIES = [
  'arrows', 'commerce', 'culture', 'education', 'entertainment',
  'essentials', 'office', 'social', 'technology', 'tools', 'travel'
];

// Load alias keywords if the file exists
let aliasMap = {};
try {
  if (fs.existsSync(ALIAS_FILE)) {
    aliasMap = JSON.parse(fs.readFileSync(ALIAS_FILE, 'utf8'));
    console.log(`Loaded alias keywords from ${ALIAS_FILE}`);
  } else {
    console.log(`No alias file found at ${ALIAS_FILE}. Only using auto-generated keywords.`);
    
    // Create an empty alias file if it doesn't exist
    fs.writeFileSync(ALIAS_FILE, JSON.stringify({
      // Example format:
      // "category/subcategory/icon-name": ["alias1", "alias2", "use-case"]
      "technology/laptop": ["computer", "business", "workstation", "device"],
      "social/twitter": ["tweet", "social media", "bird", "communication", "platform"]
    }, null, 2));
    console.log(`Created example alias file at ${ALIAS_FILE}`);
  }
} catch (error) {
  console.error('Error loading alias mapping:', error);
}

// Function to generate keywords from filename
function generateKeywords(filename) {
  // Remove extension and replace special chars with spaces
  const baseName = path.basename(filename, path.extname(filename))
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2'); // Split camelCase
  
  // Split into words, filter empty strings, and convert to lowercase
  const words = baseName.split(' ')
    .filter(word => word.trim().length > 0)
    .map(word => word.toLowerCase());
  
  return [...new Set(words)]; // Remove duplicates
}

// Function to get PNG variants
function getPngVariants(baseFilename, categoryPath) {
  const variants = [];
  const sizes = ['', '@2x', '@3x']; // Regular, 2x, 3x
  
  // Full path to the corresponding PNG directory
  const pngDir = path.join(PNG_DIR, categoryPath);
  
  // Create PNG directory if it doesn't exist
  if (!fs.existsSync(pngDir)) {
    fs.mkdirSync(pngDir, { recursive: true });
    return variants; // Return empty if directory was just created
  }
  
  sizes.forEach(size => {
    const variantFilename = `${baseFilename}${size}.png`;
    const variantPath = path.join(pngDir, variantFilename);
    
    if (fs.existsSync(variantPath)) {
      variants.push({
        path: `/icons/png/${categoryPath}/${variantFilename}`,
        size: size === '' ? '1x' : size
      });
    }
  });
  
  return variants;
}

// Recursive function to process icons in a directory and its subdirectories
function processIconsInDirectory(directory, relativePath = '', metadata = []) {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Creating directory: ${directory}`);
      fs.mkdirSync(directory, { recursive: true });
      return metadata;
    }

    const items = fs.readdirSync(directory);
    
    // Process all SVG files in this directory
    const svgFiles = items.filter(item => item.endsWith('.svg'));
    for (const svgFile of svgFiles) {
      const baseFilename = path.basename(svgFile, '.svg');
      const categoryPath = relativePath; // Relative path from SVG_DIR
      const pngVariants = getPngVariants(baseFilename, categoryPath);
      
      // Generate basic keywords from filename
      let keywords = generateKeywords(baseFilename);
      
      // Add alias keywords if available
      const aliasKey = categoryPath + '/' + baseFilename;
      if (aliasMap[aliasKey] && Array.isArray(aliasMap[aliasKey])) {
        keywords = [...keywords, ...aliasMap[aliasKey]];
      }
      
      // Extract main category and subcategory
      const pathParts = categoryPath.split(path.sep);
      const mainCategory = pathParts[0] || 'uncategorized';
      const subcategory = pathParts.slice(1).join('/') || null;
      
      metadata.push({
        id: `${categoryPath.replace(/\\/g, '-')}-${baseFilename}`,
        name: baseFilename,
        displayName: baseFilename.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        category: mainCategory,
        subcategory: subcategory,
        fullPath: categoryPath,
        keywords: [...new Set(keywords)], // Remove duplicates
        svg: `/icons/svg/${categoryPath}/${svgFile}`,
        png: pngVariants,
        dateAdded: new Date().toISOString()
      });
    }
    
    // Process subdirectories
    const subdirectories = items.filter(item => {
      const itemPath = path.join(directory, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    for (const subdir of subdirectories) {
      const subdirPath = path.join(directory, subdir);
      const newRelativePath = relativePath ? path.join(relativePath, subdir) : subdir;
      processIconsInDirectory(subdirPath, newRelativePath, metadata);
    }
    
    return metadata;
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
    return metadata;
  }
}

// Main function to generate metadata
async function generateMetadata() {
  let metadata = [];

  try {
    // Check if main directories exist
    if (!fs.existsSync(SVG_DIR)) {
      console.error(`SVG directory not found: ${SVG_DIR}`);
      console.log('Creating directory structure...');
      fs.mkdirSync(SVG_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(PNG_DIR)) {
      console.error(`PNG directory not found: ${PNG_DIR}`);
      console.log('Creating directory structure...');
      fs.mkdirSync(PNG_DIR, { recursive: true });
    }

    // Create main category directories if they don't exist
    for (const category of MAIN_CATEGORIES) {
      const categoryDirSvg = path.join(SVG_DIR, category);
      const categoryDirPng = path.join(PNG_DIR, category);
      
      if (!fs.existsSync(categoryDirSvg)) {
        fs.mkdirSync(categoryDirSvg, { recursive: true });
        console.log(`Created directory: ${categoryDirSvg}`);
      }
      
      if (!fs.existsSync(categoryDirPng)) {
        fs.mkdirSync(categoryDirPng, { recursive: true });
        console.log(`Created directory: ${categoryDirPng}`);
      }
    }

    // Process all icons recursively
    metadata = processIconsInDirectory(SVG_DIR);
    
    // Sort by category and name
    metadata.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      if (a.subcategory !== b.subcategory) {
        return (a.subcategory || '').localeCompare(b.subcategory || '');
      }
      return a.name.localeCompare(b.name);
    });

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Metadata generated successfully! Total icons: ${metadata.length}`);
    console.log(`Output file: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error generating metadata:', error);
    process.exit(1);
  }
}

// Run the generator
generateMetadata(); 