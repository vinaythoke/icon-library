const fs = require('fs');
const path = require('path');

// Directory to save PWA icons
const PWA_ICONS_DIR = path.join(__dirname, '../public/icons/app');

// Make sure the directory exists
if (!fs.existsSync(PWA_ICONS_DIR)) {
  fs.mkdirSync(PWA_ICONS_DIR, { recursive: true });
}

// Simple SVG template for placeholder icons
// Creates a red square with the size in the middle
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FF5350" />
  <text x="50%" y="50%" font-family="Arial" font-size="${size / 4}" 
    fill="white" text-anchor="middle" dy=".3em">Icon</text>
</svg>
`;

// Create favicon SVGs
const createFaviconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FF5350" rx="${size / 4}" />
  <text x="50%" y="50%" font-family="Arial" font-size="${size / 2}" 
    fill="white" text-anchor="middle" dy=".3em">S</text>
</svg>
`;

// Icon sizes needed for PWA
const iconSizes = [192, 384, 512];
const faviconSizes = [16, 32];

// Generate each icon
console.log('Generating PWA icons...');

// Generate main PWA icons
iconSizes.forEach(size => {
  const svg = createIconSVG(size);
  fs.writeFileSync(path.join(PWA_ICONS_DIR, `icon-${size}x${size}.svg`), svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Generate apple touch icon (180x180)
const appleTouchIcon = createIconSVG(180);
fs.writeFileSync(path.join(PWA_ICONS_DIR, 'apple-icon-180.svg'), appleTouchIcon);
console.log('Created apple-icon-180.svg');

// Generate favicons
faviconSizes.forEach(size => {
  const svg = createFaviconSVG(size);
  fs.writeFileSync(path.join(PWA_ICONS_DIR, `favicon-${size}x${size}.svg`), svg);
  console.log(`Created favicon-${size}x${size}.svg`);
});

console.log('\nPlaceholder PWA icons created successfully! ✅');
console.log('NOTE: Replace these placeholder SVGs with actual PNG icons before production.');
console.log('For production, you should convert these SVGs to PNG files with the same names.');