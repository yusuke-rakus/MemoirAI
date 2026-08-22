import type { FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

type AppCheckEnvironment = {
  isDev: boolean;
  isTest: boolean;
  siteKey?: string;
};

type AppCheckDebugGlobal = typeof globalThis & {
  FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
};

export const initializeFirebaseAppCheck = (
  app: FirebaseApp,
  environment: AppCheckEnvironment,
  debugGlobal: AppCheckDebugGlobal = globalThis,
) => {
  if (environment.isTest) return null;

  const siteKey = environment.siteKey?.trim();
  if (!siteKey) {
    throw new Error("VITE_RECAPTCHA_ENTERPRISE_SITE_KEY is required");
  }

  if (environment.isDev) {
    debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  return initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
};
