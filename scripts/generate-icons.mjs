import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
    console.log('Generating PWA icons...');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read the SVG file
    const svgBuffer = fs.readFileSync(inputSvg);

    // Generate each size
    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✓ Generated ${size}x${size} icon`);
    }

    // Generate Apple Touch Icon (180x180)
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✓ Generated Apple Touch Icon (180x180)');

    // Generate favicon (32x32)
    await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon (32x32)');

    // Generate favicon (16x16)
    await sharp(svgBuffer)
        .resize(16, 16)
        .png()
        .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✓ Generated favicon (16x16)');

    console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);

