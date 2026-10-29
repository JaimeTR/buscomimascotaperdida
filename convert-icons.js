const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const svgPath = path.join(__dirname, 'public', 'icons', 'icon-template.svg');
const outputDir = path.join(__dirname, 'public', 'icons');

async function generatePNGs() {
    console.log('🎨 Converting SVG to PNG icons...\n');

    for (const size of sizes) {
        try {
            await sharp(svgPath)
                .resize(size, size)
                .png()
                .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
            console.log(`✅ Generated: icon-${size}x${size}.png`);
        } catch (error) {
            console.error(`❌ Error generating ${size}x${size}:`, error.message);
        }
    }

    console.log('\n✨ All PNG icons generated successfully!');
    console.log('\n📂 Icons saved in: public/icons/\n');
}

generatePNGs();
