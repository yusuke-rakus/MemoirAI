import { v4 as uuidv4 } from "uuid";

export function generateDiaryId() {
  return `diary-${uuidv4()}`;
}
