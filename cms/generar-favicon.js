const sharp = require('sharp');
const path = require('path');

const SIZE = 64;
const VERDE = '#1F4D3A';
const RADIUS = 14;

const svgBg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="${VERDE}"/>
</svg>`;

async function main() {
  const isotipo = await sharp('C:/Users/agust/Downloads/Isotipo W _ avi_n.png')
    .resize(42, 42, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(Buffer.from(svgBg))
    .composite([{ input: isotipo, gravity: 'center' }])
    .png()
    .toFile(path.join(__dirname, '../img/favicon.png'));

  console.log('Favicon generado OK');
}

main().catch(console.error);
