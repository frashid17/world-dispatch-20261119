// Entrypoint for make.fun news-image-20261119 (Node 22, standard library only).
// Reads the pre-rendered front-page newspaper image for Thursday 19 November 2026,
// validates its image header and size cap, and writes it deterministically to /output/entry.png.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1048576; // 1 MiB gate cap
const MAX_DIMENSION = 1024; // 1024x1024 px gate cap

interface ImageCheck {
  format: 'png' | 'jpeg';
  width: number;
  height: number;
}

function inspectImage(buf: Buffer): ImageCheck {
  if (buf.length < 24) {
    throw new Error('Image file is truncated');
  }

  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;

  if (isPng) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { format: 'png', width, height };
  }

  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (isJpeg) {
    const hasEoi = buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9;
    if (!hasEoi) {
      throw new Error('JPEG image is missing its EOI end marker');
    }
    let offset = 2;
    while (offset + 4 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { format: 'jpeg', width, height };
      }
      const segmentLength = buf.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }
    throw new Error('JPEG image is missing a SOF dimension header');
  }

  throw new Error('Invalid image format: expected PNG or JPEG header bytes');
}

function main(): void {
  const rootDir = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(rootDir, 'entry.png');
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const targetPath = join(outputDir, 'entry.png');

  const imageBytes = readFileSync(sourcePath);

  if (imageBytes.length === 0 || imageBytes.length > MAX_BYTES) {
    throw new Error(`Invalid image size: ${imageBytes.length} bytes (max ${MAX_BYTES})`);
  }

  const meta = inspectImage(imageBytes);
  if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION || meta.width === 0 || meta.height === 0) {
    throw new Error(`Invalid image dimensions: ${meta.width}x${meta.height} (max ${MAX_DIMENSION}x${MAX_DIMENSION})`);
  }

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(targetPath, imageBytes);
}

main();
