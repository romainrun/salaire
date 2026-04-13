# Ads and feature toggle (prod vs test)

This project is production-first by default:

- ads are enabled
- top A/B home banner is enabled
- normal feature locking remains active

For QA builds, you can disable ads and unlock gated features using one boolean env variable.

## Toggle variables

- `EXPO_PUBLIC_GITHUB_DISABLE_ADS=true|false`
- `EXPO_PUBLIC_GITLAB_DISABLE_ADS=true|false`

If either variable is `true`, the app runs in test mode:

- all ads disabled
- premium ad-free treated as active
- gated features treated as unlocked

If both variables are `false` (or missing), app runs in production mode.

## Recommended CI usage

- GitHub Actions: set `EXPO_PUBLIC_GITHUB_DISABLE_ADS=false` for production.
- GitLab CI: set `EXPO_PUBLIC_GITLAB_DISABLE_ADS=false` for production.

Use `true` only for internal review builds.
