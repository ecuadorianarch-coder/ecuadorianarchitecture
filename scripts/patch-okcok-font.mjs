import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const fontPath = path.resolve('src/assets/fonts/OKCOK.ttf');
const backupPath = path.resolve('src/assets/fonts/OKCOK.original.ttf');
const cssPath = path.resolve('src/styles/globals.css');

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(fontPath, backupPath);
  console.log('✓ Backup created at:', backupPath);
}

const buf = fs.readFileSync(backupPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const acute = font.glyphs.get(101);
const tilde = font.glyphs.get(109);
const dieresis = font.glyphs.get(97);
const exclam = font.charToGlyph('!');
const question = font.charToGlyph('?');

function cloneCommands(cmds) {
  return cmds.map(c => ({ ...c }));
}

function offsetCommands(cmds, dx, dy) {
  return cmds.map(c => {
    const nc = { ...c };
    if (nc.x !== undefined) nc.x += dx;
    if (nc.y !== undefined) nc.y += dy;
    if (nc.x1 !== undefined) nc.x1 += dx;
    if (nc.y1 !== undefined) nc.y1 += dy;
    if (nc.x2 !== undefined) nc.x2 += dx;
    if (nc.y2 !== undefined) nc.y2 += dy;
    return nc;
  });
}

function makeCombined(baseChar, accentGlyph, targetCx, targetBottomY, name, unicode) {
  const base = font.charToGlyph(baseChar);
  const p = new opentype.Path();
  p.commands = cloneCommands(base.path.commands);

  const abb = accentGlyph.getBoundingBox();
  const accentCx = (abb.x1 + abb.x2) / 2;
  const dx = targetCx - accentCx;
  const dy = targetBottomY - abb.y1;

  const accentCmds = offsetCommands(accentGlyph.path.commands, dx, dy);
  p.commands.push(...accentCmds);

  return new opentype.Glyph({
    name,
    unicode,
    advanceWidth: base.advanceWidth,
    path: p,
  });
}

// Special case for lowercase 'í': use stem contour only (no dot) + acute accent
function makeIacuteLower() {
  const iGlyph = font.charToGlyph('i');
  let contours = [];
  let current = [];
  for (const c of iGlyph.path.commands) {
    current.push(c);
    if (c.type === 'Z') {
      contours.push(current);
      current = [];
    }
  }
  // Contour 2 is the stem (minY: 170, maxY: 1386)
  const stemContour = contours[2] || contours[0];
  const p = new opentype.Path();
  p.commands = cloneCommands(stemContour);

  const abb = acute.getBoundingBox();
  const accentCx = (abb.x1 + abb.x2) / 2;
  const targetCx = 276;
  const targetBottomY = 1450;
  const dx = targetCx - accentCx;
  const dy = targetBottomY - abb.y1;

  const accentCmds = offsetCommands(acute.path.commands, dx, dy);
  p.commands.push(...accentCmds);

  return new opentype.Glyph({
    name: 'iacute',
    unicode: 0x00ED,
    advanceWidth: iGlyph.advanceWidth,
    path: p,
  });
}

// Inverted punctuation via 180° rotation
function makeInverted(baseGlyph, shiftY, name, unicode) {
  const bb = baseGlyph.getBoundingBox();
  const cx = (bb.x1 + bb.x2) / 2;
  const cy = (bb.y1 + bb.y2) / 2;

  const p = new opentype.Path();
  for (const c of baseGlyph.path.commands) {
    const nc = { ...c };
    if (nc.x !== undefined) nc.x = 2 * cx - nc.x;
    if (nc.y !== undefined) nc.y = 2 * cy - nc.y - shiftY;
    if (nc.x1 !== undefined) nc.x1 = 2 * cx - nc.x1;
    if (nc.y1 !== undefined) nc.y1 = 2 * cy - nc.y1 - shiftY;
    p.commands.push(nc);
  }

  return new opentype.Glyph({
    name,
    unicode,
    advanceWidth: baseGlyph.advanceWidth,
    path: p,
  });
}

const glyphsToAdd = [
  // Uppercase Spanish Accented & Diacritics
  { base: 'A', accent: acute, cx: 640, bottomY: 1980, name: 'Aacute', unicode: 0x00C1 },
  { base: 'E', accent: acute, cx: 650, bottomY: 1720, name: 'Eacute', unicode: 0x00C9 },
  { base: 'I', accent: acute, cx: 313, bottomY: 1780, name: 'Iacute', unicode: 0x00CD },
  { base: 'O', accent: acute, cx: 680, bottomY: 1840, name: 'Oacute', unicode: 0x00D3 },
  { base: 'U', accent: acute, cx: 720, bottomY: 1880, name: 'Uacute', unicode: 0x00DA },
  { base: 'U', accent: dieresis, cx: 720, bottomY: 1880, name: 'Udieresis', unicode: 0x00DC },
  { base: 'N', accent: tilde, cx: 720, bottomY: 1930, name: 'Ntilde', unicode: 0x00D1 },

  // Lowercase Spanish Accented & Diacritics
  { base: 'a', accent: acute, cx: 740, bottomY: 1770, name: 'aacute', unicode: 0x00E1 },
  { base: 'e', accent: acute, cx: 570, bottomY: 1520, name: 'eacute', unicode: 0x00E9 },
  { base: 'o', accent: acute, cx: 590, bottomY: 1640, name: 'oacute', unicode: 0x00F3 },
  { base: 'u', accent: acute, cx: 680, bottomY: 1520, name: 'uacute', unicode: 0x00FA },
  { base: 'u', accent: dieresis, cx: 680, bottomY: 1520, name: 'udieresis', unicode: 0x00FC },
  { base: 'n', accent: tilde, cx: 640, bottomY: 1400, name: 'ntilde', unicode: 0x00F1 },
];

for (const cfg of glyphsToAdd) {
  const g = makeCombined(cfg.base, cfg.accent, cfg.cx, cfg.bottomY, cfg.name, cfg.unicode);
  g.index = font.glyphs.length;
  font.glyphs.push(font.glyphs.length, g);
}

// Add lowercase í
const iacuteGlyph = makeIacuteLower();
iacuteGlyph.index = font.glyphs.length;
font.glyphs.push(font.glyphs.length, iacuteGlyph);

// Add Spanish inverted punctuation ¡ and ¿
const invExclam = makeInverted(exclam, 300, 'exclamdown', 0x00A1);
invExclam.index = font.glyphs.length;
font.glyphs.push(font.glyphs.length, invExclam);

const invQuestion = makeInverted(question, 350, 'questiondown', 0x00BF);
invQuestion.index = font.glyphs.length;
font.glyphs.push(font.glyphs.length, invQuestion);

// Harmonize vertical font metrics to prevent any browser from clipping descenders
font.ascender = 2196;
font.descender = -448;
if (font.tables.os2) {
  font.tables.os2.sTypoAscender = 2196;
  font.tables.os2.sTypoDescender = -448;
  font.tables.os2.sTypoLineGap = 100;
  font.tables.os2.usWinAscent = 2196;
  font.tables.os2.usWinDescent = 448;
}
if (font.tables.hhea) {
  font.tables.hhea.ascender = 2196;
  font.tables.hhea.descender = -448;
  font.tables.hhea.lineGap = 100;
}

console.log('✓ Added all Spanish glyphs. Total glyphs now:', font.glyphs.length);

// Generate new TTF buffer
const newFontBuffer = Buffer.from(font.toArrayBuffer());
fs.writeFileSync(fontPath, newFontBuffer);
console.log('✓ Written updated TTF to:', fontPath, `(${newFontBuffer.length} bytes)`);

// Update base64 data URI in globals.css
const base64Font = newFontBuffer.toString('base64');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Replace @font-face for OKCOK with updated base64
const updatedCss = cssContent.replace(
  /@font-face\s*\{\s*font-family:\s*['"]OKCOK['"];\s*src:\s*url\([^)]+\)\s*format\(['"]truetype['"]\);/s,
  `@font-face {\n  font-family: 'OKCOK';\n  src: url(data:font/truetype;charset=utf-8;base64,${base64Font}) format('truetype');`
);

fs.writeFileSync(cssPath, updatedCss, 'utf8');
console.log('✓ Updated OKCOK base64 in src/styles/globals.css');
