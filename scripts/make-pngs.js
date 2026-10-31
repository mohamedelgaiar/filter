import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // Simple CRC32 implementation
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // Generate RGBA raw scanlines (with filter byte 0 at start of each row)
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2;

  // Maskable safe zone margin check
  const contentScale = isMaskable ? 0.75 : 0.95;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Background gradient (Sky 600 -> Cyan 500)
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(2 + gradRatio * 4); // ~2 to 6
      let g = Math.round(132 + gradRatio * 50); // ~132 to 182
      let b = Math.round(199 + gradRatio * 13); // ~199 to 212
      let a = 255;

      // Distance from center
      const dx = (x - cx) / contentScale;
      const dy = (y - cy) / contentScale;

      // Draw stylized water droplet in the center
      // Droplet shape: upper triangle tapering to apex, lower circle
      const inLowerCircle = Math.sqrt(dx * dx + (dy - radius * 0.15) * (dy - radius * 0.15)) < radius * 0.42;
      const inUpperSpire = dy < radius * 0.15 && dy > -radius * 0.55 && Math.abs(dx) < (radius * 0.42) * ((radius * 0.15 - dy) / (radius * 0.7));

      if (inLowerCircle || inUpperSpire) {
        // White droplet with light blue wave lines
        const waveY = (dy - radius * 0.15) / (radius * 0.42);
        if (waveY > 0.05 && waveY < 0.25) {
          // Inner wave 1
          r = 2; g = 132; b = 199;
        } else if (waveY > 0.45 && waveY < 0.65) {
          // Inner wave 2
          r = 14; g = 165; b = 233;
        } else {
          // Pure droplet body
          r = 255; g = 255; b = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Header chunk (IHDR)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // Color type 6: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const compressedData = zlib.deflateSync(rawData);

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate all required PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

console.log('Successfully generated all PWA icons in /public!');
