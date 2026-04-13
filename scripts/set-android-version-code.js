const fs = require('node:fs');
const path = require('node:path');

function getTimestampVersionCode() {
  // Android versionCode must be <= 2100000000 and strictly increasing.
  // Keep a timestamp-based code with second precision:
  // 1_000_000_000 + seconds elapsed since 2024-01-01 UTC.
  const BASE_EPOCH_SECONDS = Date.UTC(2024, 0, 1, 0, 0, 0) / 1000;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return 1_000_000_000 + (nowSeconds - BASE_EPOCH_SECONDS);
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
