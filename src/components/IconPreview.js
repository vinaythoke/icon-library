import { useRef, useEffect, useState } from 'react';

export default function IconPreview({ icon, onClose }) {
  const modalRef = useRef();
  const [selectedColor, setSelectedColor] = useState('default');
  const [previewSrc, setPreviewSrc] = useState(icon.svg);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [iconAliases, setIconAliases] = useState([]);
  const keywordsInitialLimit = 4;

  // Define brand colors
  const brandColors = {
    default: null, // No color modification
    red: '#FF5350', // Sarvārth Red
    blue: '#45D1F4', // Sarvārth Blue
    grey: '#808080'  // Sarvārth Grey
  };

  // Load aliases for this icon
  useEffect(() => {
    async function loadAliases() {
      try {
        const iconKey = `${icon.category}/${icon.subcategory ? icon.subcategory + '/' : ''}${icon.name}`.replace(/\\/g, '/');
        const response = await fetch('/api/icons/aliases?iconKey=' + encodeURIComponent(iconKey));
        if (response.ok) {
          const data = await response.json();
          setIconAliases(data.aliases || []);
        }
      } catch (error) {
        console.error('Error loading aliases:', error);
      }
    }
    
    loadAliases();
  }, [icon]);

  // Handle clicking outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Function to create a consistent SVG wrapper with fixed dimensions (for preview only)
  const createSvgWrapper = (svgContent, colorHex = null) => {
    // If we have a color, apply it to the SVG
    let modifiedSvg = svgContent;
    if (colorHex) {
      modifiedSvg = modifiedSvg
        // Replace stroke attributes
        .replace(/stroke="[^"]*"/g, `stroke="${colorHex}"`)
        .replace(/stroke='[^']*'/g, `stroke='${colorHex}'`)
        // Replace stroke in style attributes
        .replace(/style="([^"]*)stroke:[^;]*;([^"]*)"/g, `style="$1stroke:${colorHex};$2"`)
        .replace(/style='([^']*)stroke:[^;]*;([^']*)'/g, `style='$1stroke:${colorHex};$2'`);
    }

    // Create a wrapper SVG with fixed dimensions that will center the content
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(50,50) scale(0.8)">
          ${modifiedSvg}
        </g>
      </svg>
    `;
  };

  // Handle color change
  const handleColorChange = async (color) => {
    setSelectedColor(color);
    setIsLoadingPreview(true);
    
    try {
      // Fetch the original SVG content
      const svgResponse = await fetch(icon.svg);
      if (!svgResponse.ok) throw new Error('Failed to fetch SVG');
      
      const svgText = await svgResponse.text();
      
      if (color === 'default') {
        // Create a data URL with the original SVG wrapped for consistency
        const wrappedSvg = createSvgWrapper(svgText);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrappedSvg)}`;
        setPreviewSrc(dataUrl);
      } else {
        // Create a data URL with the colored SVG wrapped for consistency
        const wrappedSvg = createSvgWrapper(svgText, brandColors[color]);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrappedSvg)}`;
        setPreviewSrc(dataUrl);
      }
    } catch (error) {
      console.error('Error processing SVG:', error);
      // If there's an error, fall back to the API method
      if (color === 'default') {
        setPreviewSrc(icon.svg);
      } else {
        try {
          const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              iconPath: icon.svg,
              color: color,
            }),
          });
          
          if (!response.ok) throw new Error('Failed to get colored preview');
          
          const svgBlob = await response.blob();
          const url = URL.createObjectURL(svgBlob);
          setPreviewSrc(url);
        } catch (apiError) {
          console.error('Error with API fallback:', apiError);
          setPreviewSrc(icon.svg);
        }
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Initialize with wrapped SVG on first load
  useEffect(() => {
    // Initial load - fetch and wrap the SVG
    const initSvg = async () => {
      try {
        const svgResponse = await fetch(icon.svg);
        if (svgResponse.ok) {
          const svgText = await svgResponse.text();
          const wrappedSvg = createSvgWrapper(svgText);
          const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrappedSvg)}`;
          setPreviewSrc(dataUrl);
        }
      } catch (error) {
        console.error('Error initializing SVG:', error);
        // Fallback to original source
        setPreviewSrc(icon.svg);
      }
    };
    
    initSvg();
  }, [icon.svg]);

  // Standard download helper function for PNG
  const downloadIcon = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Apply color to SVG content without any extra wrappers (for download only)
  const applyColorToSvg = async (svgContent, colorHex) => {
    if (!colorHex) return svgContent;
    
    return svgContent
      // Replace stroke attributes
      .replace(/stroke="[^"]*"/g, `stroke="${colorHex}"`)
      .replace(/stroke='[^']*'/g, `stroke='${colorHex}'`)
      // Replace stroke in style attributes
      .replace(/style="([^"]*)stroke:[^;]*;([^"]*)"/g, `style="$1stroke:${colorHex};$2"`)
      .replace(/style='([^']*)stroke:[^;]*;([^']*)'/g, `style='$1stroke:${colorHex};$2'`)
      // For path elements without stroke
      .replace(/<path([^>]*)>/g, (match, attributes) => {
        if (!attributes.includes('stroke=')) {
          return `<path${attributes} stroke="${colorHex}">`;
        }
        return match;
      })
      // Only replace fill if there's no stroke attribute already
      .replace(/<([^>]*)fill="[^"]*"([^>]*)>/g, (match, before, after) => {
        if (!match.includes('stroke=')) {
          return `<${before}fill="${colorHex}"${after}>`;
        }
        return match;
      })
      .replace(/<([^>]*)fill='[^']*'([^>]*)>/g, (match, before, after) => {
        if (!match.includes('stroke=')) {
          return `<${before}fill='${colorHex}'${after}>`;
        }
        return match;
      });
  };

  // Download SVG with color
  const downloadSvgWithColor = async () => {
    try {
      if (selectedColor === 'default') {
        // If default color, just download the original SVG
        downloadIcon(icon.svg, `${icon.name}.svg`);
        return;
      }

      // Try directly fetching and modifying the SVG for a clean download
      try {
        const svgResponse = await fetch(icon.svg);
        if (svgResponse.ok) {
          const svgText = await svgResponse.text();
          // Apply color but no wrapper or transformations
          const coloredSvg = await applyColorToSvg(svgText, brandColors[selectedColor]);
          // Create a clean Blob with just the colored SVG
          const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(svgBlob);
          
          // Generate filename with color
          const filename = `${icon.name}-${selectedColor}.svg`;
          
          // Trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Clean up the object URL
          URL.revokeObjectURL(url);
          return;
        }
      } catch (directError) {
        console.error('Error with direct SVG modification:', directError);
        // Fall back to API method if direct modification fails
      }

      // Fallback to API method if direct approach fails
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iconPath: icon.svg,
          color: selectedColor,
          download: true,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to download colored SVG');
      
      const svgBlob = await response.blob();
      const url = URL.createObjectURL(svgBlob);
      
      // Generate filename with color
      const filename = `${icon.name}-${selectedColor}.svg`;
      
      // Trigger download
      downloadIcon(url, filename);
      
      // Clean up the object URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading colored SVG:', error);
      alert('Failed to download the colored SVG. Please try again.');
    }
  };

  // Format path for display
  const formatPath = () => {
    if (!icon.subcategory) return icon.category;
    return `${icon.category} › ${icon.subcategory.split('/').join(' › ')}`;
  };

  // Get all keywords including aliases
  const getAllKeywords = () => {
    const baseKeywords = icon.keywords || [];
    return [...new Set([...baseKeywords, ...iconAliases])];
  };

  // Get displayed keywords based on showAllKeywords state
  const getDisplayedKeywords = () => {
    const allKeywords = getAllKeywords();
    if (showAllKeywords || allKeywords.length <= keywordsInitialLimit) {
      return allKeywords;
    }
    return allKeywords.slice(0, keywordsInitialLimit);
  };

  // Toggle showing all keywords
  const toggleKeywordsDisplay = () => {
    setShowAllKeywords(!showAllKeywords);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto my-4 relative"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Sticky header with close button */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
          <h3 className="text-lg font-medium truncate">{icon.displayName || icon.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 flex-shrink-0 ml-2"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Icon preview */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-lg">
              {/* Colored icon preview */}
              <div className="mb-4 flex items-center justify-center w-full">
                {isLoadingPreview ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                ) : (
                  <div className="icon-frame w-full max-w-[200px] md:max-w-[250px] aspect-square overflow-hidden">
                    <iframe 
                      src={previewSrc} 
                      title={icon.name}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                      loading="eager"
                    />
                  </div>
                )}
              </div>
              
              {/* Color selection buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <div className="text-sm font-medium text-gray-700 w-full text-center mb-2 md:mb-0 md:w-auto">Colors:</div>
                <button 
                  onClick={() => handleColorChange('default')}
                  className={`w-10 h-10 rounded-full border ${selectedColor === 'default' ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}`}
                  style={{ background: '#000' }}
                  title="Default (Black)"
                >
                  <span className="sr-only">Default</span>
                </button>
                <button 
                  onClick={() => handleColorChange('red')}
                  className={`w-10 h-10 rounded-full border ${selectedColor === 'red' ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}`}
                  style={{ background: brandColors.red }}
                  title="Sarvārth Red"
                >
                  <span className="sr-only">Sarvārth Red</span>
                </button>
                <button 
                  onClick={() => handleColorChange('blue')}
                  className={`w-10 h-10 rounded-full border ${selectedColor === 'blue' ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}`}
                  style={{ background: brandColors.blue }}
                  title="Sarvārth Blue"
                >
                  <span className="sr-only">Sarvārth Blue</span>
                </button>
                <button 
                  onClick={() => handleColorChange('grey')}
                  className={`w-10 h-10 rounded-full border ${selectedColor === 'grey' ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}`}
                  style={{ background: brandColors.grey }}
                  title="Sarvārth Grey"
                >
                  <span className="sr-only">Sarvārth Grey</span>
                </button>
              </div>
            </div>

            {/* Icon information and download options */}
            <div className="flex-1">
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-1">Info</h4>
                <div className="grid grid-cols-[1fr,2fr] sm:grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Path:</div>
                  <div className="capitalize break-words">{formatPath()}</div>
                  <div className="text-gray-500">Filename:</div>
                  <div className="break-words">{icon.name}</div>
                  <div className="text-gray-500">Keywords:</div>
                  <div className="text-gray-700 break-words">
                    <div className="flex flex-wrap gap-1">
                      {getDisplayedKeywords().map((keyword, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    {getAllKeywords().length > keywordsInitialLimit && (
                      <button
                        onClick={toggleKeywordsDisplay}
                        className="text-blue-500 hover:text-blue-700 text-xs mt-2 focus:outline-none"
                      >
                        {showAllKeywords ? 'Show less' : `Show ${getAllKeywords().length - keywordsInitialLimit} more...`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Download Options</h4>
                
                {/* SVG download */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SVG 
                      {selectedColor !== 'default' && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({selectedColor === 'red' ? 'Sarvārth Red' : 
                             selectedColor === 'blue' ? 'Sarvārth Blue' : 
                             'Sarvārth Grey'})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={downloadSvgWithColor}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Download
                    </button>
                  </div>
                </div>

                {/* PNG downloads */}
                {icon.png.length > 0 && (
                  <div>
                    <span className="text-sm font-medium block mb-2">PNG</span>
                    <div className="space-y-2">
                      {icon.png.map((pngVariant, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{pngVariant.size}</span>
                          <button
                            onClick={() => downloadIcon(pngVariant.path, `${icon.name}-${pngVariant.size}.png`)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sticky footer with close button for mobile */}
        <div className="sticky bottom-0 bg-gray-50 p-4 border-t md:hidden rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-500 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 