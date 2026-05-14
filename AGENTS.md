# AGENTS.md

## Cursor Cloud specific instructions

This is a React Native (Expo SDK 54) salary converter app with TypeScript, Zustand, and AsyncStorage.

### Stack
- Expo SDK 54, React Native 0.81, TypeScript strict, Zustand, React Navigation

### Commands
- **Install**: `npm install`
- **TypeScript check**: `npx tsc --noEmit`
- **Start dev server**: `npx expo start --host lan --port 8086`
- **Start web**: `npx expo start --web --port 8086`

### Testing preferences
- Do **not** run manual UI/UX testing (including computer-use sessions, screenshots, or walkthrough videos) unless the user explicitly asks for it.
- Default to non-UI checks (for example `npx tsc --noEmit`) when validation is needed and the change does not explicitly require manual UI verification.

### CI/CD
- Push to `main` triggers deploy to VM via SSH (`.github/workflows/deploy.yml`)
- Tags `*_Store`, `*_Android`, `*_iOS` trigger store builds
- VM deploy uses pm2 with `npm start -- --host lan --port 8086 -c`
- Expo server runs on **port 8086** on the VM

### Gotchas
- Expo web requires `unstable_transformImportMeta: true` in `babel.config.js` to fix `import.meta` error
- `--non-interactive` flag is NOT supported by Expo CLI — use `CI=1` env var instead
- VM may hit `ENOSPC` (inotify watchers limit) — fix with `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
- `pm2 start npx` does not work reliably — use `pm2 start npm --name salaire -- start -- --host lan --port 8086 -c` instead
- `babel-preset-expo` must be pinned to `~54.0.10` for SDK 54 compatibility
