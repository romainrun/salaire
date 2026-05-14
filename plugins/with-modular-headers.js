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

function injectAllowNonModularIncludes(podfileContent) {
  if (
    podfileContent.includes(
      "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"
    )
  ) {
    return podfileContent;
  }

  const buildSettingSnippet =
    "  installer.pods_project.targets.each do |target|\n" +
    "    target.build_configurations.each do |config|\n" +
    "      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'\n" +
    "    end\n" +
    "  end\n";

  const postInstallPattern = /post_install do \|installer\|/;

  if (postInstallPattern.test(podfileContent)) {
    return podfileContent.replace(
      postInstallPattern,
      `post_install do |installer|\n${buildSettingSnippet}`
    );
  }

  return `${podfileContent}\npost_install do |installer|\n${buildSettingSnippet}end\n`;
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
      const withModularHeaders = injectUseModularHeaders(podfileContent);
      const updatedPodfileContent = injectAllowNonModularIncludes(
        withModularHeaders
      );

      if (updatedPodfileContent !== podfileContent) {
        fs.writeFileSync(podfilePath, updatedPodfileContent, 'utf8');
      }

      return modConfig;
    },
  ]);
}

module.exports = withModularHeaders;
module.exports.injectUseModularHeaders = injectUseModularHeaders;
module.exports.injectAllowNonModularIncludes = injectAllowNonModularIncludes;
