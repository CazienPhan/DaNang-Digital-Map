// Copies shared/poiTypeMapping.json into backend/src/config and
// frontend/src/features/map/config so each project can import it locally
// (each deploys from its own subfolder, so a true cross-folder import at
// runtime isn't possible). Edit the source file, then run this script.
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(repoRoot, 'shared', 'poiTypeMapping.json');

const targets = [
  path.join(repoRoot, 'backend', 'src', 'config', 'poiTypeMapping.json'),
  path.join(repoRoot, 'frontend', 'src', 'features', 'map', 'config', 'poiTypeMapping.json'),
];

const contents = fs.readFileSync(sourcePath, 'utf8');

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  console.log(`Synced -> ${path.relative(repoRoot, target)}`);
}
