import { v4 as uuidv4 } from "uuid";

export function generateDiaryId() {
  return `diary-${uuidv4()}`;
}

export function generateDiaryImageId() {
  return `diary-image-${uuidv4()}`;
}

export function generateShareId() {
  return `share-${uuidv4()}`;
}

export function generateMemoryFactId() {
  return `memory-fact-${uuidv4()}`;
}

export function generatePersonMemoryId() {
  return `person-memory-${uuidv4()}`;
}
