// Genera los íconos PWA y favicon de app a partir de public/logo.png
// Uso: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "fs/promises";

const SRC = "public/logo.png";
const OUT = "public/icons";
const BRAND_BG = "#F0C000"; // theme color Don Caleb

await mkdir(OUT, { recursive: true });

const base = sharp(SRC).flatten({ background: BRAND_BG });

const jobs = [
  { path: "public/icons/icon-192.png", size: 192 },
  { path: "public/icons/icon-512.png", size: 512 },
  { path: "public/icons/apple-touch-icon.png", size: 180 },
  { path: "app/icon.png", size: 192 },
];

// Íconos normales: logo contenido
for (const { path, size } of jobs) {
  const inner = Math.round(size * 0.88);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path);
  console.log(`✓ ${path}`);
}

// Maskable: logo más pequeño con margen de seguridad (zona segura ~80%)
{
  const size = 512;
  const inner = Math.round(size * 0.65);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`${OUT}/maskable-512.png`);
  console.log("✓ maskable-512.png");
}
