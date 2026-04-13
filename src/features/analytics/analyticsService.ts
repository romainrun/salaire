type RawAnalyticsValue = string | number | boolean | null | undefined;
type RawAnalyticsParams = Record<string, RawAnalyticsValue>;
type AnalyticsParamValue = string | number;

interface AnalyticsModule {
  logEvent: (name: string, params?: Record<string, AnalyticsParamValue>) => Promise<void>;
}

const MAX_EVENT_NAME_LENGTH = 40;
const MAX_PARAM_KEY_LENGTH = 40;

function normalizeEventName(name: string): string {
  const normalized = name.replace(/[^a-zA-Z0-9_]/g, '_');
  return normalized.slice(0, MAX_EVENT_NAME_LENGTH);
}

function normalizeParams(params?: RawAnalyticsParams): Record<string, AnalyticsParamValue> {
  if (!params) return {};
  const normalized: Record<string, AnalyticsParamValue> = {};
  for (const [key, rawValue] of Object.entries(params)) {
    if (rawValue === null || rawValue === undefined) continue;
    const normalizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, MAX_PARAM_KEY_LENGTH);
    if (!normalizedKey) continue;
    if (typeof rawValue === 'boolean') {
      normalized[normalizedKey] = rawValue ? 1 : 0;
      continue;
    }
    if (typeof rawValue === 'number') {
      if (Number.isNaN(rawValue) || !Number.isFinite(rawValue)) continue;
      normalized[normalizedKey] = rawValue;
      continue;
    }
    normalized[normalizedKey] = rawValue.slice(0, 100);
  }
  return normalized;
}

class FirebaseAnalyticsService {
  private module: AnalyticsModule | null = null;
  private initPromise: Promise<void> | null = null;

  initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      try {
        // Lazy load avoids crashes if native module is unavailable in some builds.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const analyticsFactory = require('@react-native-firebase/analytics').default as () => AnalyticsModule;
        this.module = analyticsFactory();
        await this.module.logEvent('analytics_ready');
      } catch (error) {
        this.module = null;
        console.warn('[analytics] unavailable, analytics disabled', error);
      }
    })();
    return this.initPromise;
  }

  trackEvent(name: string, params?: RawAnalyticsParams): void {
    void this.initialize().then(async () => {
      if (!this.module) return;
      try {
        await this.module.logEvent(normalizeEventName(name), normalizeParams(params));
      } catch (error) {
        console.warn('[analytics] logEvent failed', { name, error });
      }
    });
  }
}

export const analyticsService = new FirebaseAnalyticsService();
