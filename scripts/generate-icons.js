const fs = require('fs');
const path = require('path');

// SVG icon template with ServicesArtisans branding
const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="#2563eb"/>
  <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${size / 512 * 0.7})">
    <path d="M256 80c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176S353.2 80 256 80zm0 320c-79.4 0-144-64.6-144-144s64.6-144 144-144 144 64.6 144 144-64.6 144-144 144z" fill="white"/>
    <path d="M256 160c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96zm0 160c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z" fill="white"/>
    <circle cx="256" cy="256" r="32" fill="white"/>
    <path d="M380 340l40 40-20 20-40-40" fill="white" stroke="white" stroke-width="16" stroke-linecap="round"/>
  </g>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (PNG generation would require sharp or canvas)
sizes.forEach(size => {
  const svgContent = createSvgIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created: ${filename}`);
});

// Also create apple-touch-icon
const appleTouchIcon = createSvgIcon(180);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.svg'), appleTouchIcon);
console.log('Created: apple-touch-icon.svg');

// Create favicon.ico placeholder (SVG version)
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), createSvgIcon(32));
console.log('Created: favicon.svg');

console.log('\nDone! Note: For production, convert SVGs to PNGs using sharp or an online tool.');
