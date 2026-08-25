import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const PROJECT_ID = "demo-memoir-ai-account-deletion-rules";
const OWNER_UID = "rules-owner";
const OTHER_UID = "rules-other";
const RETENTION_MILLISECONDS = 5 * 365.25 * 24 * 60 * 60 * 1000;

const testEnvironment = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    host: "127.0.0.1",
    port: 8080,
    rules: readFileSync("firebase/firestore.rules", "utf8"),
  },
  storage: {
    host: "127.0.0.1",
    port: 9199,
    rules: readFileSync("firebase/storage.rules", "utf8"),
  },
});

const acceptancePath = `users/${OWNER_UID}/legalAcceptances/v1`;

const acceptance = {
  uid: OWNER_UID,
  requiredConsentVersion: "v1",
  documentVersions: {
    terms: "terms-v1",
    privacy: "privacy-v1",
    aiDataUse: "ai-v1",
  },
  confirmedAdult: true,
  acceptanceMethod: "single-checkbox",
  locale: "ja-JP",
  acceptedAt: firebase.firestore.Timestamp.now(),
};

try {
  await testEnvironment.clearFirestore();
  await testEnvironment.clearStorage();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc(acceptancePath).set(acceptance);
    await context
      .storage()
      .ref(`users/${OWNER_UID}/diaries/diary-1/images/orphan.webp`)
      .putString("orphan-image", "raw", { contentType: "image/webp" });
  });

  const owner = testEnvironment.authenticatedContext(OWNER_UID);
  const other = testEnvironment.authenticatedContext(OTHER_UID);
  const unauthenticated = testEnvironment.unauthenticatedContext();
  const retentionExpiresAt = firebase.firestore.Timestamp.fromMillis(
    Date.now() + RETENTION_MILLISECONDS,
  );

  await assertSucceeds(
    owner.firestore().collection(`users/${OWNER_UID}/legalAcceptances`).get(),
  );
  await assertFails(other.firestore().doc(acceptancePath).get());
  await assertFails(unauthenticated.firestore().doc(acceptancePath).get());
  await assertSucceeds(
    owner.firestore().doc(acceptancePath).update({
      accountDeletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      retentionExpiresAt,
    }),
  );
  await assertFails(
    owner
      .firestore()
      .doc(acceptancePath)
      .update({
        documentVersions: {
          ...acceptance.documentVersions,
          privacy: "tampered",
        },
      }),
  );
  await assertFails(
    owner
      .firestore()
      .doc(acceptancePath)
      .update({
        retentionExpiresAt: firebase.firestore.Timestamp.fromMillis(
          Date.now() + RETENTION_MILLISECONDS * 2,
        ),
      }),
  );

  const ownerFolder = owner.storage().ref(`users/${OWNER_UID}`);
  const otherFolder = other.storage().ref(`users/${OWNER_UID}`);
  const ownerImage = owner
    .storage()
    .ref(`users/${OWNER_UID}/diaries/diary-1/images/orphan.webp`);

  await assertSucceeds(ownerFolder.listAll());
  await assertFails(otherFolder.listAll());
  await assertFails(
    unauthenticated.storage().ref(`users/${OWNER_UID}`).listAll(),
  );
  await assertFails(other.storage().ref(ownerImage.fullPath).delete());
  await assertSucceeds(ownerImage.delete());

  console.log("Account deletion Firestore/Storage Rules tests passed.");
} finally {
  await testEnvironment.cleanup();
}
