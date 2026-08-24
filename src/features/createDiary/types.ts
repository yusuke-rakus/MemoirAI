export type DiarySaveMode = "standard" | "illustrated";

export type DiaryCreationStepStatus = "pending" | "active" | "complete";

export type DiaryCreationProgress = {
  saveMode: DiarySaveMode;
  metadata: DiaryCreationStepStatus;
  illustration: DiaryCreationStepStatus | null;
  persistence: DiaryCreationStepStatus;
};
