import { Button } from "@/components/ui/button";
import { db } from "@/firebase/firebase";
import { DiaryClient } from "@/lib/service/diaryClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect } from "react";

export const HomeView = () => {
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

  const handleClick = async () => {
    await DiaryClient.add({
      uid: "xxxxxxxxxxxxx",
      title: "New Diary Entry",
      content: "This is the content of the new diary entry.",
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
    const data = await DiaryClient.get("jqx2tIHhQlwq8isFoMBF6ccbdoMM");
    console.table(data);
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <h1>Home Page</h1>
        <Button onClick={handleClick}>Add Diary</Button>
        <Button onClick={handleClickUpdate}>Update Diary</Button>
        <Button onClick={handleSearch}>Search</Button>
        <div className="h-200 w-200 bg-amber-500"></div>
      </div>
    </>
  );
};
