const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

function injectUseModularHeaders(podfileContent) {
  if (podfileContent.includes('use_modular_headers!')) {
    return podfileContent;
  }

  const firstTargetPattern = /^\s*target\s+['"][^'"]+['"]\s+do/m;
  const targetMatch = podfileContent.match(firstTargetPattern);

  if (!targetMatch) {
    throw new Error('Unable to locate the first target block in Podfile.');
  }

  return podfileContent.replace(
    firstTargetPattern,
    `use_modular_headers!\n\n${targetMatch[0]}`
  );
}

function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        return modConfig;
      }

      const podfileContent = fs.readFileSync(podfilePath, 'utf8');
      const updatedPodfileContent = injectUseModularHeaders(podfileContent);

      if (updatedPodfileContent !== podfileContent) {
        fs.writeFileSync(podfilePath, updatedPodfileContent, 'utf8');
      }

      return modConfig;
    },
  ]);
}

module.exports = withModularHeaders;
module.exports.injectUseModularHeaders = injectUseModularHeaders;
