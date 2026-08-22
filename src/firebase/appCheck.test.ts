import type { FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initializeFirebaseAppCheck } from "./appCheck";

vi.mock("firebase/app-check", () => ({
  initializeAppCheck: vi.fn(() => ({ name: "app-check" })),
  ReCaptchaEnterpriseProvider: vi.fn(function (this: object, siteKey: string) {
    Object.assign(this, { siteKey });
  }),
}));

const app = { name: "test-app" } as FirebaseApp;
const initializeAppCheckMock = vi.mocked(initializeAppCheck);
const ProviderMock = vi.mocked(ReCaptchaEnterpriseProvider);

beforeEach(() => {
  initializeAppCheckMock.mockClear();
  ProviderMock.mockClear();
});

describe("initializeFirebaseAppCheck", () => {
  it("テスト環境ではattestationを初期化しない", () => {
    expect(
      initializeFirebaseAppCheck(app, {
        isDev: false,
        isTest: true,
        siteKey: undefined,
      }),
    ).toBeNull();
    expect(initializeAppCheckMock).not.toHaveBeenCalled();
  });

  it("開発環境ではdebug tokenモードを有効にしてEnterprise providerを使う", () => {
    const debugGlobal = {} as typeof globalThis & {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
    };

    initializeFirebaseAppCheck(
      app,
      { isDev: true, isTest: false, siteKey: "site-key" },
      debugGlobal,
    );

    expect(debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN).toBe(true);
    expect(ProviderMock).toHaveBeenCalledWith("site-key");
    expect(initializeAppCheckMock).toHaveBeenCalledWith(app, {
      provider: expect.any(ReCaptchaEnterpriseProvider),
      isTokenAutoRefreshEnabled: true,
    });
  });

  it("本番環境ではdebug tokenを設定せずに初期化する", () => {
    const debugGlobal = {} as typeof globalThis & {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
    };

    initializeFirebaseAppCheck(
      app,
      { isDev: false, isTest: false, siteKey: "site-key" },
      debugGlobal,
    );

    expect(debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN).toBeUndefined();
    expect(initializeAppCheckMock).toHaveBeenCalledOnce();
  });

  it("site keyが未設定なら起動を止める", () => {
    expect(() =>
      initializeFirebaseAppCheck(app, {
        isDev: false,
        isTest: false,
        siteKey: " ",
      }),
    ).toThrow("VITE_RECAPTCHA_ENTERPRISE_SITE_KEY is required");
  });
});
