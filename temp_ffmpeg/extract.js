const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const videoPath = path.join(__dirname, '..', 'images', 'hero_bg_v2.mp4');
const outDir = path.join(__dirname, '..', 'images', 'frames');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Extracting frames for the new video...');
// Using qscale:v 4 to balance quality and size, 1920w
execSync(`"${ffmpeg}" -i "${videoPath}" -vf "scale=1920:-1" -qscale:v 4 "${path.join(outDir, 'frame_%04d.jpg')}"`);
console.log('Extraction complete.');
