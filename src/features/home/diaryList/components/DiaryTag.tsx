import { Badge } from "@/components/ui/badge";
import { tagBgMap } from "@/constants/tagColors";
import type { Tag } from "@/types/diary/diary";

type DiaryTagProps = {
  tag: Tag;
};

export const DiaryTag = (props: DiaryTagProps) => {
  const { tag } = props;
  const color = tagBgMap[tag.color] ?? "bg-muted-foreground";
  return <Badge className={color}># {tag.name}</Badge>;
};
