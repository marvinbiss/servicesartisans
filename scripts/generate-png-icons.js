const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Source = canonical brand SVG. Any rebrand change icon.svg once, re-run this script.
const sourceSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generateIcons() {
  console.log('Generating PNG icons from public/icon.svg...');

  for (const size of sizes) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    try {
      await sharp(sourceSvg).resize(size, size).png().toFile(out);
      console.log(`  ✓ icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`  ✗ icon-${size}x${size}.png — ${err.message}`);
    }
  }

  try {
    await sharp(sourceSvg).resize(180, 180).png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('  ✓ apple-touch-icon.png');
  } catch (err) {
    console.error(`  ✗ apple-touch-icon.png — ${err.message}`);
  }

  try {
    await sharp(sourceSvg).resize(32, 32).png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('  ✓ favicon.png');
  } catch (err) {
    console.error(`  ✗ favicon.png — ${err.message}`);
  }

  // favicon.ico — multi-size (16/32/48) pour Google SERP + browsers historiques
  try {
    const icoSizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
      icoSizes.map((s) => sharp(sourceSvg).resize(s, s).png().toBuffer())
    );
    // Minimal ICO writer: header + dir entries + PNG payloads
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type = icon
    header.writeUInt16LE(icoSizes.length, 4);

    const dirEntries = [];
    let offset = 6 + 16 * icoSizes.length;
    for (let i = 0; i < icoSizes.length; i++) {
      const s = icoSizes[i];
      const buf = pngBuffers[i];
      const entry = Buffer.alloc(16);
      entry.writeUInt8(s === 256 ? 0 : s, 0);
      entry.writeUInt8(s === 256 ? 0 : s, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(buf.length, 8);
      entry.writeUInt32LE(offset, 12);
      dirEntries.push(entry);
      offset += buf.length;
    }
    const ico = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
    console.log('  ✓ favicon.ico (16/32/48)');
  } catch (err) {
    console.error(`  ✗ favicon.ico — ${err.message}`);
  }

  console.log('\nDone!');
}

generateIcons();
