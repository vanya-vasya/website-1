const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '../public/logos/zinvero-icon.png');
const outputDir = path.join(__dirname, '../public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('Generating favicons from zinvero-icon.png...\n');

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (multi-size ICO file)
  // Note: Sharp doesn't support ICO directly, so we'll use the 32x32 PNG and rename it
  // For a proper ICO, you'd need a specialized tool, but browsers will fall back to PNG
  const faviconPath = path.join(outputDir, 'favicon.ico');
  
  await sharp(sourceIcon)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(faviconPath);
  
  console.log(`✓ Generated favicon.ico (32x32 as PNG format)`);
  
  console.log('\n✅ All favicons generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});

