import { diaryTitleModel } from "@/firebase/models/createDiarySchema";
import { metadataSchema } from "@/lib/diaryMetadata";
export { mergeDiaryTags } from "@/lib/diaryMetadata";
import type { ActiveUserMemoryContext } from "@/types/memory";

export class DiaryMetadataClient {
  static async generate(
    content: string,
    selectedTags: string[],
    memoryContext: ActiveUserMemoryContext | null,
  ) {
    const result = await diaryTitleModel.generateContent(
      JSON.stringify({ diaryContent: content, selectedTags, memoryContext }),
    );
    return metadataSchema.parse(JSON.parse(result.response.text()));
  }
}
