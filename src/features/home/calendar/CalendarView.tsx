import { Button } from "@/components/ui/button";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiaryClient } from "@/lib/service/diaryClient";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "./calendar";

export const CalendarView = () => {
  const { localUser } = useLocalUser();
  useDocumentTitle("カレンダー");
  const now = new Date();

  const handleCreate = async () => {
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      title: "BBQに行った🍖",
      content:
        "今日は友人たちと河原でBBQをした。炭を起こすのに苦戦したけど、焼きあがった肉は最高！子どもたちも走り回って楽しそうだった。天気も良くて、夏らしい1日だった。また近いうちにやりたいな。",
      tags: [
        { name: "タグ", color: "blue" },
        { name: "タグ", color: "blue" },
      ],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
    });
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(now.getFullYear(), now.getMonth(), 2),
      title: "水族館に行った🐟",
      content:
        "久しぶりに水族館へ。クラゲの展示が幻想的で、しばらく見入ってしまった。イルカショーも迫力満点で感動！思わずぬいぐるみを買ってしまった。癒しと発見のある良い時間だった。",
      tags: [{ name: "タグ", color: "blue" }],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 2),
    });
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(now.getFullYear(), now.getMonth(), 3),
      title: "ドライブをした🚗",
      content:
        "朝から車で海沿いをドライブ。天気がよくて、窓を開けて走ると気持ちよかった。途中の道の駅でソフトクリームを食べた。目的地はなかったけど、それが逆に楽しかった。たまにはこういう気ままな日もいい。。",
      tags: [{ name: "タグ", color: "blue" }],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 3),
    });
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(now.getFullYear(), now.getMonth(), 4),
      title: "風邪を引いた🤧",
      content:
        "喉が痛くて、だるさが抜けない。熱も少しあって、今日は一日中寝ていた。食欲もなくて、おかゆをちょっとだけ。予定を全部キャンセルすることになってしまった。早く治して元気になりたい。。",
      tags: [{ name: "タグ", color: "blue" }],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 4),
    });
  };

  const handleClickUpdate = async () => {
    await DiaryClient.update({
      id: "fdbe7481-51b2-469f-bb3e-7b4e71f089c8",
      uid: "jqx2tIHhQlwq8isFoMBF6ccbdoMM",
      title: "日記を更新しました",
      content: "更新しました",
      createdAt: new Date(),
    });
  };

  const [date, setDate] = useState<Date | undefined>(new Date());
  const monthCaptionStyle = {
    borderBottom: "1px solid currentColor",
    paddingBottom: "0.5em",
  };

  return (
    <>
      <div>
        <Calendar />
      </div>
      <div className="w-full flex flex-col items-center">
        <Button onClick={handleCreate}>Create Diary</Button>
        <Button onClick={handleClickUpdate}>Update Diary</Button>
      </div>
    </>
  );
};
