import { LoadingScreen } from "@/components/shared/common/LoadingScreen";
import { AppTooltip } from "@/components/shared/common/AppTooltip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Heart, LoaderCircle, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { DiaryTag } from "../../createDiary/components/DiaryTag";
import { DiaryImageGrid } from "../../diaries/components/DiaryImageGrid";
import { useSharedDiary } from "../hooks/useSharedDiary";
import { useSharedDiaryFavorite } from "../hooks/useSharedDiaryFavorite";

type SharedDiaryViewProps = {
  authenticatedUserId?: string | null;
};

export const SharedDiaryView = ({
  authenticatedUserId,
}: SharedDiaryViewProps) => {
  const { diary, sharedDiaryId, isLoading } = useSharedDiary();
  const favorite = useSharedDiaryFavorite({
    uid: authenticatedUserId,
    sharedDiaryId: diary ? sharedDiaryId : null,
  });
  const favoriteActionLabel = favorite.isFavorite
    ? "お気に入りから削除"
    : "お気に入りに追加";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!diary) {
    return (
      <div className="py-10">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>共有された日記が見つかりません</EmptyTitle>
            <EmptyDescription>
              リンクが無効か、共有が停止されている可能性があります。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to={PATHS.login.path}>ログインページへ</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 pt-8 pb-10">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {diary.displayName
            ? `${diary.displayName}さんの日記`
            : "共有された日記"}
        </p>
        <h2 className="text-3xl font-bold">
          {format(diary.date.toDate(), "M月d日")}
        </h2>
      </div>
      <Card
        className={cn(
          "overflow-hidden",
          diary.images && diary.images.length > 0 ? "pt-0 pb-3" : "py-3",
        )}
      >
        {diary.images && diary.images.length > 0 && (
          <CardContent className="px-0 pb-0">
            <DiaryImageGrid images={diary.images} />
          </CardContent>
        )}
        <CardContent className="flex flex-col gap-3">
          <CardHeader className="px-0">
            <CardTitle>{diary.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <p className="whitespace-pre-wrap text-foreground/80">
              {diary.content}
            </p>
          </CardContent>
          {(diary.tags.length >= 1 || authenticatedUserId) && (
            <CardFooter className="flex flex-wrap gap-2 p-0">
              {diary.tags.length >= 1 && (
                <>
                  <Tag className="h-4 w-4 text-ring" />
                  {diary.tags.map((tag, i) => (
                    <DiaryTag key={i} tag={tag} />
                  ))}
                </>
              )}
              {authenticatedUserId && (
                <AppTooltip description={favoriteActionLabel}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto rounded-full"
                    aria-label={favoriteActionLabel}
                    aria-pressed={favorite.isFavorite}
                    aria-busy={favorite.isLoading || favorite.isMutating}
                    disabled={
                      favorite.isLoading ||
                      favorite.isMutating ||
                      !favorite.isAvailable
                    }
                    onClick={() => void favorite.toggleFavorite()}
                  >
                    {favorite.isLoading || favorite.isMutating ? (
                      <LoaderCircle className="animate-spin text-muted-foreground" />
                    ) : (
                      <Heart
                        className={cn(
                          favorite.isFavorite
                            ? "fill-favorite text-favorite"
                            : "text-muted-foreground",
                        )}
                      />
                    )}
                  </Button>
                </AppTooltip>
              )}
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
