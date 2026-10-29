// Simple icon generator using SVG
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const outputDir = path.join(__dirname, 'public', 'icons');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function generateSVGIcon(size) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)" rx="80"/>
  
  <!-- Dog -->
  <g fill="rgba(255,255,255,0.95)">
    <!-- Dog body -->
    <circle cx="218" cy="280" r="62"/>
    <!-- Dog head -->
    <circle cx="230" cy="220" r="50"/>
    <!-- Dog ear left -->
    <ellipse cx="192" cy="190" rx="20" ry="37" transform="rotate(-17 192 190)"/>
    <!-- Dog ear right -->
    <ellipse cx="268" cy="190" rx="20" ry="37" transform="rotate(17 268 190)"/>
  </g>
  
  <!-- Cat -->
  <g fill="rgba(255,255,255,0.95)">
    <!-- Cat body -->
    <circle cx="290" cy="280" r="55"/>
    <!-- Cat head -->
    <circle cx="300" cy="225" r="45"/>
    <!-- Cat ear left -->
<polygon points="270,185 255,145 285,195"/>
    <!-- Cat ear right -->
    <polygon points="330,185 345,145 315,195"/>
  </g>
  
  <!-- Location pin -->
  <g>
    <circle cx="320" cy="170" r="20" fill="white" stroke="#3b82f6" stroke-width="5"/>
    <line x1="320" y1="190" x2="320" y2="230" stroke="white" stroke-width="7" stroke-linecap="round"/>
  </g>
  
  <!-- Heart accent -->
  <path d="M 360 250 C 360 245, 355 240, 350 240 C 347 240, 345 241, 343 243 C 341 241, 339 240, 336 240 C 331 240, 326 245, 326 250 C 326 256, 343 268, 343 268 C 343 268, 360 256, 360 250 Z" fill="rgba(255,255,255,0.7)"/>
</svg>`;

    return svg;
}

console.log('🎨 Generating PWA icon SVGs...\n');

// Generate SVG template
const svgContent = generateSVGIcon(512);
const svgPath = path.join(outputDir, 'icon-template.svg');
fs.writeFileSync(svgPath, svgContent);
console.log('✅ Generated: icon-template.svg\n');

// Create a simple script to convert SVG to PNG
const conversionScript = `
# PWA Icon Generator - SVG to PNG Conversion
# You'll need to install sharp: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const svgPath = path.join(__dirname, 'public', 'icons', 'icon-template.svg');
const outputDir = path.join(__dirname, 'public', 'icons');

async function generatePNGs() {
    console.log('🎨 Converting SVG to PNG icons...\\n');
    
    for (const size of sizes) {
        try {
            await sharp(svgPath)
                .resize(size, size)
                .png()
                .toFile(path.join(outputDir, \`icon-\${size}x\${size}.png\`));
            console.log(\`✅ Generated: icon-\${size}x\${size}.png\`);
        } catch (error) {
            console.error(\`❌ Error generating \${size}x\${size}:\`, error.message);
        }
    }
    
    console.log('\\n✨ All PNG icons generated successfully!');
}

generatePNGs();
`;

fs.writeFileSync(path.join(__dirname, 'convert-icons.js'), conversionScript);
console.log('📝 Created conversion script: convert-icons.js\n');
console.log('📌 To generate PNG icons, run:');
console.log('   npm install sharp');
console.log('   node convert-icons.js\n');
