const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');

// Create a simple blue icon with a white symbol using pure SVG
const createIconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2563eb"/>
  <g fill="white">
    <circle cx="220" cy="220" r="80" fill="none" stroke="white" stroke-width="40"/>
    <rect x="280" y="280" width="120" height="40" rx="20" transform="rotate(45 340 300)"/>
  </g>
</svg>`;

async function generateIcons() {
  console.log('Generating PNG icons...');

  for (const size of sizes) {
    const svgBuffer = Buffer.from(createIconSvg(512));
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      console.log(`  ✓ Created: icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`  ✗ Failed: icon-${size}x${size}.png - ${err.message}`);
    }
  }

  // Create apple-touch-icon.png
  try {
    const svgBuffer = Buffer.from(createIconSvg(512));
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('  ✓ Created: apple-touch-icon.png');
  } catch (err) {
    console.error(`  ✗ Failed: apple-touch-icon.png - ${err.message}`);
  }

  // Create favicon.ico (32x32 PNG as fallback)
  try {
    const svgBuffer = Buffer.from(createIconSvg(512));
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('  ✓ Created: favicon.png');
  } catch (err) {
    console.error(`  ✗ Failed: favicon.png - ${err.message}`);
  }

  console.log('\nDone!');
}

generateIcons();
