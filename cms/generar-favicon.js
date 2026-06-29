const sharp = require('sharp');
const path = require('path');

const SIZE = 180;   // grande para apple-touch-icon también
const RADIUS = 40;  // bordes redondeados

const mask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="white"/>
  </svg>`
);

async function main() {
  const base = await sharp('C:/Users/agust/Downloads/Isotipo W _ avi_n.png')
    .resize(SIZE, SIZE, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  // Aplicar máscara redondeada
  const rounded = await sharp(base)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // favicon 64x64
  await sharp(rounded)
    .resize(64, 64)
    .png()
    .toFile(path.join(__dirname, '../img/favicon.png'));

  // apple-touch-icon 180x180
  await sharp(rounded)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../img/apple-touch-icon.png'));

  console.log('Favicon y apple-touch-icon generados OK');
}

main().catch(console.error);
