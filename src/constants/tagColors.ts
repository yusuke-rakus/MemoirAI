export const tagColors = [
  "amber",
  "lime",
  "sky",
  "indigo",
  "violet",
  "pink",
  "default",
];
export type TagColor = (typeof tagColors)[number];
export const DefaultTagColor: TagColor = "default";

export const tagBgMap: Record<string, string> = {
  amber: "bg-tag-amber",
  lime: "bg-tag-lime",
  sky: "bg-tag-sky",
  indigo: "bg-tag-indigo",
  violet: "bg-tag-violet",
  pink: "bg-tag-pink",
  default: "bg-ring",
};
