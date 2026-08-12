import { generateKeyPairSync } from "node:crypto";
import { cert, deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import developmentSeedDataJson from "./seedData.json";

const EMULATORS = {
  auth: {
    host: "127.0.0.1:9099",
    url: "http://127.0.0.1:9099",
    label: "Auth Emulator",
  },
  firestore: {
    host: "127.0.0.1:8080",
    url: "http://127.0.0.1:8080",
    label: "Firestore Emulator",
  },
  storage: {
    host: "127.0.0.1:9199",
    url: "http://127.0.0.1:9199",
    label: "Storage Emulator",
  },
} as const;

process.env.FIREBASE_AUTH_EMULATOR_HOST = EMULATORS.auth.host;
process.env.FIRESTORE_EMULATOR_HOST = EMULATORS.firestore.host;
process.env.FIREBASE_STORAGE_EMULATOR_HOST = EMULATORS.storage.host;

const tagColorSchema = z.enum([
  "amber",
  "lime",
  "sky",
  "indigo",
  "violet",
  "pink",
  "default",
]);

const diarySchema = z.object({
  id: z.string().min(1),
  monthOffset: z.union([z.literal(-1), z.literal(0)]),
  day: z.number().int().min(1).max(28),
  hour: z.number().int().min(0).max(23),
  title: z
    .string()
    .regex(/^\p{Extended_Pictographic}/u, "タイトルは絵文字で始めてください。"),
  content: z.string().min(1),
  tags: z
    .array(
      z.object({
        name: z.string().min(1),
        color: tagColorSchema,
      }),
    )
    .min(1, "タグを1件以上設定してください。"),
});

const memoryFactSchema = z.object({
  value: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

const profileFactSchema = memoryFactSchema.extend({
  id: z.string().min(1),
  key: z.enum([
    "displayName",
    "ageRange",
    "gender",
    "occupation",
    "location",
    "familyStatus",
  ]),
});

const preferenceSchema = memoryFactSchema.extend({
  id: z.string().min(1),
});

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  relationshipToUser: memoryFactSchema.optional(),
  attributes: z.array(memoryFactSchema),
  relationshipNotes: z.array(memoryFactSchema),
});

const memorySchema = z.object({
  profileFacts: z.array(profileFactSchema).max(6),
  preferences: z.array(preferenceSchema).max(100),
  people: z.array(personSchema).max(100),
});

const userSeedSchema = z.object({
  uid: z.string().min(1).max(128),
  email: z.string().email(),
  displayName: z.string().min(1),
  appearance: z.object({
    theme: z.enum(["light", "dark", "system"]),
    primaryColor: z.enum([
      "default",
      "blue",
      "green",
      "yellow",
      "red",
      "purple",
    ]),
  }),
  memory: memorySchema,
  diaries: z.array(diarySchema).max(499),
});

const seedDataSchema = z
  .object({
    users: z.array(userSeedSchema).min(1).max(1_000),
  })
  .superRefine(({ users }, context) => {
    const userIds = new Set<string>();
    const userEmails = new Set<string>();

    users.forEach((user, userIndex) => {
      const normalizedEmail = user.email.toLocaleLowerCase();
      if (userIds.has(user.uid)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `ユーザーUIDが重複しています: ${user.uid}`,
          path: ["users", userIndex, "uid"],
        });
      }
      if (userEmails.has(normalizedEmail)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `メールアドレスが重複しています: ${user.email}`,
          path: ["users", userIndex, "email"],
        });
      }
      userIds.add(user.uid);
      userEmails.add(normalizedEmail);

      const diaryIds = new Set<string>();
      user.diaries.forEach((diary, diaryIndex) => {
        if (diaryIds.has(diary.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `日記IDが重複しています: ${diary.id}`,
            path: ["users", userIndex, "diaries", diaryIndex, "id"],
          });
        }
        diaryIds.add(diary.id);
      });

      const profileKeys = new Set<string>();
      user.memory.profileFacts.forEach((fact, factIndex) => {
        if (profileKeys.has(fact.key)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `プロフィールメモリのキーが重複しています: ${fact.key}`,
            path: [
              "users",
              userIndex,
              "memory",
              "profileFacts",
              factIndex,
              "key",
            ],
          });
        }
        profileKeys.add(fact.key);
      });

      const validateMemoryIds = (
        items: Array<{ id: string }>,
        collectionName: "people" | "preferences" | "profileFacts",
      ) => {
        const ids = new Set<string>();
        items.forEach((item, itemIndex) => {
          if (ids.has(item.id)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `メモリIDが重複しています: ${item.id}`,
              path: [
                "users",
                userIndex,
                "memory",
                collectionName,
                itemIndex,
                "id",
              ],
            });
          }
          ids.add(item.id);
        });
      };

      validateMemoryIds(user.memory.profileFacts, "profileFacts");
      validateMemoryIds(user.memory.preferences, "preferences");
      validateMemoryIds(user.memory.people, "people");
    });
  });

const seedData = seedDataSchema.parse(developmentSeedDataJson);
type SeedDiary = (typeof seedData.users)[number]["diaries"][number];

const assertRequiredEnvironment = () => {
  const projectId = process.env.VITE_PROJECT_ID;
  const storageBucket = process.env.VITE_STORAGE_BUCKET;

  if (!projectId || !storageBucket) {
    throw new Error(
      ".env.development に VITE_PROJECT_ID と VITE_STORAGE_BUCKET を設定してください。",
    );
  }

  return { projectId, storageBucket };
};

const assertEmulatorAvailable = async ({
  label,
  url,
}: (typeof EMULATORS)[keyof typeof EMULATORS]) => {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2_000) });
  } catch {
    throw new Error(
      `${label} に接続できません。docker compose up -d を実行してください。`,
    );
  }
};

type StorageObjectList = {
  items?: Array<{ name?: string }>;
  nextPageToken?: string;
};

const deleteStoragePrefix = async (storageBucket: string, prefix: string) => {
  let pageToken: string | undefined;
  const objectNames: string[] = [];

  do {
    const searchParams = new URLSearchParams({ prefix });
    if (pageToken) searchParams.set("pageToken", pageToken);

    const listResponse = await fetch(
      `${EMULATORS.storage.url}/storage/v1/b/${encodeURIComponent(storageBucket)}/o?${searchParams}`,
    );
    if (!listResponse.ok) {
      throw new Error(
        "Storage Emulator のファイル一覧を取得できませんでした。",
      );
    }

    const objectList = (await listResponse.json()) as StorageObjectList;
    objectNames.push(
      ...(objectList.items ?? [])
        .map((item) => item.name)
        .filter((name): name is string => Boolean(name)),
    );

    pageToken = objectList.nextPageToken;
  } while (pageToken);

  await Promise.all(
    objectNames.map(async (name) => {
      const deleteResponse = await fetch(
        `${EMULATORS.storage.url}/storage/v1/b/${encodeURIComponent(storageBucket)}/o/${encodeURIComponent(name)}`,
        { method: "DELETE" },
      );
      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        throw new Error(
          `Storage Emulator のファイルを削除できませんでした: ${name}`,
        );
      }
    }),
  );
};

const createDiaryDate = (diary: SeedDiary) => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth() + diary.monthOffset,
    diary.day,
    diary.hour,
    0,
    0,
    0,
  );
};

const isAuthUserNotFound = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "auth/user-not-found";

const createEmulatorCredential = (projectId: string) => {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2_048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });

  return cert({
    projectId,
    clientEmail: "firebase-emulator@localhost",
    privateKey,
  });
};

const getGoogleProviderUid = (uid: string) => uid;

const main = async () => {
  const { projectId, storageBucket } = assertRequiredEnvironment();
  const { users } = seedData;

  await Promise.all(Object.values(EMULATORS).map(assertEmulatorAvailable));

  const app = initializeApp({
    projectId,
    storageBucket,
    credential: createEmulatorCredential(projectId),
  });
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    await Promise.all(
      users.flatMap((user) => [
        db.recursiveDelete(db.doc(`users/${user.uid}`)),
        deleteStoragePrefix(storageBucket, `users/${user.uid}/`),
      ]),
    );
    await Promise.all(
      users.map((user) =>
        auth.deleteUser(user.uid).catch((error: unknown) => {
          if (!isAuthUserNotFound(error)) throw error;
        }),
      ),
    );

    const importResult = await auth.importUsers(
      users.map((user) => ({
        uid: user.uid,
        email: user.email,
        emailVerified: true,
        displayName: user.displayName,
        providerData: [
          {
            uid: getGoogleProviderUid(user.uid),
            email: user.email,
            displayName: user.displayName,
            providerId: "google.com",
          },
        ],
      })),
    );
    if (importResult.failureCount > 0) {
      const errors = importResult.errors
        .map(({ index, error }) => {
          const uid = users[index]?.uid ?? `index:${index}`;
          return `${uid}: ${error.message}`;
        })
        .join(", ");
      throw new Error(`Authユーザーのインポートに失敗しました: ${errors}`);
    }

    const now = Timestamp.now();
    await Promise.all(
      users.map(async (user) => {
        const batch = db.batch();
        batch.set(db.doc(`users/${user.uid}/settings/appearance`), {
          uid: user.uid,
          ...user.appearance,
          createdAt: now,
          updatedAt: now,
        });

        user.diaries.forEach((diary) => {
          const date = Timestamp.fromDate(createDiaryDate(diary));
          batch.set(db.doc(`users/${user.uid}/diaries/${diary.id}`), {
            id: diary.id,
            uid: user.uid,
            date,
            title: diary.title,
            content: diary.content,
            tags: diary.tags.map((tag) => ({ ...tag })),
            createdAt: date,
          });
        });

        await batch.commit();

        const memoryBatch = db.batch();
        user.memory.profileFacts.forEach((fact) => {
          memoryBatch.set(
            db.doc(`users/${user.uid}/settings/memory/profileFacts/${fact.id}`),
            fact,
          );
        });
        user.memory.preferences.forEach((preference) => {
          memoryBatch.set(
            db.doc(
              `users/${user.uid}/settings/memory/preferences/${preference.id}`,
            ),
            preference,
          );
        });
        user.memory.people.forEach((person) => {
          memoryBatch.set(
            db.doc(`users/${user.uid}/settings/memory/people/${person.id}`),
            person,
          );
        });
        await memoryBatch.commit();
      }),
    );

    const verificationResults = await Promise.all(
      users.map(async (user) => {
        const [
          createdUser,
          settingsSnapshot,
          diariesSnapshot,
          profileFactsSnapshot,
          preferencesSnapshot,
          peopleSnapshot,
        ] = await Promise.all([
          auth.getUser(user.uid),
          db.doc(`users/${user.uid}/settings/appearance`).get(),
          db.collection(`users/${user.uid}/diaries`).get(),
          db.collection(`users/${user.uid}/settings/memory/profileFacts`).get(),
          db.collection(`users/${user.uid}/settings/memory/preferences`).get(),
          db.collection(`users/${user.uid}/settings/memory/people`).get(),
        ]);
        const googleProvider = createdUser.providerData.find(
          (provider) => provider.providerId === "google.com",
        );

        if (
          createdUser.email !== user.email ||
          createdUser.passwordHash ||
          googleProvider?.uid !== getGoogleProviderUid(user.uid) ||
          !settingsSnapshot.exists ||
          diariesSnapshot.size !== user.diaries.length ||
          profileFactsSnapshot.size !== user.memory.profileFacts.length ||
          preferencesSnapshot.size !== user.memory.preferences.length ||
          peopleSnapshot.size !== user.memory.people.length
        ) {
          throw new Error(`投入後のデータ検証に失敗しました: ${user.uid}`);
        }

        return {
          user,
          diaryCount: diariesSnapshot.size,
          memoryCount:
            profileFactsSnapshot.size +
            preferencesSnapshot.size +
            peopleSnapshot.size,
        };
      }),
    );

    console.info("Firebase Emulator へのテストデータ投入が完了しました。");
    verificationResults.forEach(({ user, diaryCount, memoryCount }) => {
      console.info(`表示名: ${user.displayName}`);
      console.info(`UID: ${user.uid}`);
      console.info(`メールアドレス: ${user.email}`);
      console.info(`日記件数: ${diaryCount}`);
      console.info(`メモリ件数: ${memoryCount}`);
    });
  } finally {
    await deleteApp(app);
  }
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`シードに失敗しました: ${message}`);
  process.exitCode = 1;
});
