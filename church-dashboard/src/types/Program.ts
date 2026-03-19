export type Program = {
  id?: string;
  title: string;
  date: string;
  speaker: string;
  theme: string;
  status: "Upcoming" | "Completed";
  createdAt: string;
};
