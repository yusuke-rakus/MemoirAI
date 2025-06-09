export type Tag = {
  name: string;
  color: string;
};

export type Diary = {
  id: string;
  uid: string;
  date: Date;
  title: string;
  content: string;
  tags: Tag[];
  createdAt: Date;
};
