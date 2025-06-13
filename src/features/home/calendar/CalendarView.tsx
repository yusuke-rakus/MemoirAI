import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiaryClient } from "@/lib/service/diaryClient";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const CalendarView = () => {
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const docRef = doc(db, "test", "JdHop6rfDtjYLNzGCw5b");
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       console.log("Document data:", docSnap.data());
  //     } else {
  //       console.log("No such document!");
  //     }
  //   };
  //   fetchData();
  // }, []);
  const { localUser } = useLocalUser();
  // const { getDiaries } = useDiaryList();
  useDocumentTitle("カレンダー");

  const handleClick = async () => {
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(),
      title: "BBQに行った🍖",
      content:
        "今日は友人たちと河原でBBQをした。炭を起こすのに苦戦したけど、焼きあがった肉は最高！子どもたちも走り回って楽しそうだった。天気も良くて、夏らしい1日だった。また近いうちにやりたいな。",
      tags: [
        { name: "タグ", color: "blue" },
        { name: "タグ", color: "blue" },
      ],
      createdAt: new Date(),
    });
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(),
      title: "水族館に行った🐟",
      content:
        "久しぶりに水族館へ。クラゲの展示が幻想的で、しばらく見入ってしまった。イルカショーも迫力満点で感動！思わずぬいぐるみを買ってしまった。癒しと発見のある良い時間だった。",
      tags: [{ name: "タグ", color: "blue" }],
      createdAt: new Date(),
    });
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(),
      title: "ドライブをした🚗",
      content:
        "朝から車で海沿いをドライブ。天気がよくて、窓を開けて走ると気持ちよかった。途中の道の駅でソフトクリームを食べた。目的地はなかったけど、それが逆に楽しかった。たまにはこういう気ままな日もいい。。",
      tags: [{ name: "タグ", color: "blue" }],
      createdAt: new Date(),
    });
    await DiaryClient.add({
      id: uuidv4(),
      uid: localUser.uid,
      date: new Date(),
      title: "風邪を引いた🤧",
      content:
        "喉が痛くて、だるさが抜けない。熱も少しあって、今日は一日中寝ていた。食欲もなくて、おかゆをちょっとだけ。予定を全部キャンセルすることになってしまった。早く治して元気になりたい。。",
      tags: [{ name: "タグ", color: "blue" }],
      createdAt: new Date(),
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

  const handleSearch = async () => {
    // const data = await DiaryClient.getByUid(localUser.uid);
    // console.table(data);
    // const data = await getDiaries();
    // console.table(data);
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
        <Button onClick={handleClick}>Add Diary</Button>
        <Button onClick={handleClickUpdate}>Update Diary</Button>
        <Button onClick={handleSearch}>Search</Button>
        <div className="h-200 w-200 bg-amber-500"></div>
      </div>
    </>
  );
};
