import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/types/diary/diary";

type DiaryTagProps = {
  tag: Tag;
};
export const DiaryTag = (props: DiaryTagProps) => {
  const { tag } = props;
  return <Badge className={tag.color}># {tag.name}</Badge>;
};
