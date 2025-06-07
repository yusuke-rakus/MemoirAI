export type Tag = {
  name: string;
  color: string;
};

export type Diary = {
  title: string;
  content: string;
  tags: Tag[];
  createdAt: Date;
};
