function asBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

const disableAdsFromGithub = asBooleanEnv(process.env.EXPO_PUBLIC_GITHUB_DISABLE_ADS);
const disableAdsFromGitlab = asBooleanEnv(process.env.EXPO_PUBLIC_GITLAB_DISABLE_ADS);

// Build-time override for QA/review builds.
export const ADS_DISABLED_OVERRIDE = disableAdsFromGithub || disableAdsFromGitlab;
export const ADS_ENABLED_IN_BUILD = !ADS_DISABLED_OVERRIDE;
export const FORCE_TOP_BANNER_AB_IN_PROD = ADS_ENABLED_IN_BUILD;
export const FORCE_ALL_FEATURES_UNLOCKED = ADS_DISABLED_OVERRIDE;
