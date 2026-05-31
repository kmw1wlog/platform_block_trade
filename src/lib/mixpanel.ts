import mixpanel from "mixpanel-browser";
import type { AnalyticsEvent } from "./types";

const token = "3b18770397406dc6cf4e603ad4b35d07";
const consentKey = "siktalk.analyticsConsent";

let initialized = false;

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  mixpanel.init(token, {
    persistence: "localStorage",
    track_pageview: true,
    opt_out_tracking_by_default: true,
  });
  initialized = true;
  if (hasAnalyticsConsent()) {
    mixpanel.opt_in_tracking();
  }
}

export function grantAnalyticsConsent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(consentKey, "true");
  ensureInit();
  mixpanel.opt_in_tracking();
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(consentKey) === "true";
}

export function trackMixpanel(event: AnalyticsEvent["type"], payload: Record<string, unknown>): void {
  ensureInit();
  if (!hasAnalyticsConsent()) return;
  mixpanel.track(event, payload);
}
