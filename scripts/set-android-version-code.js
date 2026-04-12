const fs = require('node:fs');
const path = require('node:path');

function getTimestampVersionCode() {
  const now = new Date();
  const yy = String(now.getUTCFullYear() % 100).padStart(2, '0');
  const MM = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const HH = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  return Number(`${yy}${MM}${dd}${HH}${mm}`);
}

function main() {
  const appJsonPath = path.resolve(process.cwd(), 'app.json');
  const raw = fs.readFileSync(appJsonPath, 'utf8');
  const json = JSON.parse(raw);

  if (!json.expo) {
    throw new Error('app.json missing expo root key');
  }
  if (!json.expo.android) {
    json.expo.android = {};
  }

  const versionCode = getTimestampVersionCode();
  json.expo.android.versionCode = versionCode;

  fs.writeFileSync(appJsonPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[version-code] android.versionCode=${versionCode}`);
}

main();
