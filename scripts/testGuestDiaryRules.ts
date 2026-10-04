import "firebase/compat/firestore";
import "firebase/compat/storage";

import { readFileSync } from "node:fs";
import { createConnection } from "node:net";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

const firestorePort = Number(process.env.GUEST_TEST_FIRESTORE_PORT ?? 8080);
const storagePort = Number(process.env.GUEST_TEST_STORAGE_PORT ?? 9199);

const storageAvailable = await new Promise<boolean>((resolve) => {
  const socket = createConnection({ host: "127.0.0.1", port: storagePort });
  socket.setTimeout(1000);
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => resolve(false));
  socket.once("timeout", () => {
    socket.destroy();
    resolve(false);
  });
});

const environment = await initializeTestEnvironment({
  projectId: "demo-memoir-ai-guest-diary-rules",
  firestore: {
    host: "127.0.0.1",
    port: firestorePort,
    rules: readFileSync("firebase/firestore.rules", "utf8"),
  },
  ...(storageAvailable
    ? {
        storage: {
          host: "127.0.0.1",
          port: storagePort,
          rules: readFileSync("firebase/storage.rules", "utf8"),
        },
      }
    : {}),
});

try {
  const owner = environment.authenticatedContext("guest-import-owner");
  const other = environment.authenticatedContext("guest-import-other");
  const guest = environment.unauthenticatedContext();
  const path = "users/guest-import-owner/diaries/guest-import-diary";
  const data = {
    id: "guest-import-diary",
    uid: "guest-import-owner",
    content: "ゲスト引き継ぎ検証",
    title: "検証",
    tags: [],
    images: [],
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await assertFails(guest.firestore().doc(path).set(data));
  await assertFails(other.firestore().doc(path).set(data));
  const reference = owner.firestore().doc(path);
  const importOnce = () =>
    owner.firestore().runTransaction(async (transaction) => {
      const existing = await transaction.get(reference);
      if (!existing.exists) transaction.set(reference, data);
    });
  await assertSucceeds(importOnce());
  await assertSucceeds(reference.update({ content: "登録後に編集した本文" }));
  await assertSucceeds(importOnce());
  const saved = await assertSucceeds(reference.get());
  if (saved.data()?.content !== "登録後に編集した本文")
    throw new Error("Retry overwrote the existing diary.");
  await assertFails(other.firestore().doc(path).get());
  await assertFails(guest.firestore().doc(path).get());
  console.log(
    "Firestore: owner import, idempotent retry, non-owner and unauthenticated denial passed.",
  );

  if (storageAvailable) {
    const imagePath =
      "users/guest-import-owner/diaries/guest-import-diary/images/generated.png";
    await assertSucceeds(
      owner
        .storage()
        .ref(imagePath)
        .putString("test image", "raw", { contentType: "image/png" }),
    );
    await assertSucceeds(owner.storage().ref(imagePath).getMetadata());
    await assertFails(other.storage().ref(imagePath).getMetadata());
    await assertFails(guest.storage().ref(imagePath).getMetadata());
    await assertFails(
      other
        .storage()
        .ref(imagePath)
        .putString("test image", "raw", { contentType: "image/png" }),
    );
    await assertFails(
      guest
        .storage()
        .ref(imagePath)
        .putString("test image", "raw", { contentType: "image/png" }),
    );
    console.log(
      "Storage: owner image access, non-owner and unauthenticated denial passed.",
    );
  } else {
    console.log(
      `Storage: skipped (Emulator is not listening on port ${storagePort}).`,
    );
  }
} finally {
  await environment.clearFirestore();
  if (storageAvailable) await environment.clearStorage();
  await environment.cleanup();
}
