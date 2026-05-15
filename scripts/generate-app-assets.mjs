import sharp from 'sharp';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const BG = '#0a0a0a';
const FG = '#7c3aed';

const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="${FG}" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-style="italic" font-size="${size * 0.7}">E</text>
</svg>`;

const splashSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="${FG}" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-style="italic" font-size="${size * 0.18}">E</text>
</svg>`;

await sharp(Buffer.from(iconSvg(1024))).png().toFile(`${projectRoot}/assets/icon-only.png`);
await sharp(Buffer.from(splashSvg(2732))).png().toFile(`${projectRoot}/assets/splash.png`);
await sharp(Buffer.from(splashSvg(2732))).png().toFile(`${projectRoot}/assets/splash-dark.png`);

console.log('Assets generados en assets/');
