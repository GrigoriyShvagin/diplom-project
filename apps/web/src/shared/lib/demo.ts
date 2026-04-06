export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type TripStatus = "planning" | "active" | "done";

export type TripSummary = {
  id: string;
  title: string;
  dest: string;
  dates: string;
  status: TripStatus;
  members: string[];
  cover: string;
  days: number;
};

export type ScheduleItem = {
  time: string;
  type: "flight" | "stay" | "food" | "walk" | "drive" | "place";
  title: string;
  note: string;
};

export type ItineraryDay = {
  day: number;
  date: string;
  city: string;
  items: ScheduleItem[];
};

export type VoteOption = { id: string; label: string; votes: number };
export type Vote = {
  id: string;
  title: string;
  author: string;
  status: "open" | "resolved";
  myVote: string | null;
  resolution?: string;
  options: VoteOption[];
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  payer: string;
  split: string[];
  date: string;
};

export type ActiveTrip = {
  id: string;
  title: string;
  subtitle: string;
  members: string[];
  itinerary: ItineraryDay[];
  votes: Vote[];
  expenses: Expense[];
};

export const MEMBERS: Member[] = [
  { id: "m1", name: "Аня", initials: "АК", color: "oklch(0.78 0.10 60)" },
  { id: "m2", name: "Лёша", initials: "ЛП", color: "oklch(0.72 0.10 200)" },
  { id: "m3", name: "Маша", initials: "МР", color: "oklch(0.75 0.10 145)" },
  { id: "m4", name: "Дима", initials: "ДВ", color: "oklch(0.70 0.10 30)" },
  { id: "m5", name: "Вика", initials: "ВС", color: "oklch(0.74 0.10 320)" },
  { id: "me", name: "Вы", initials: "Я", color: "oklch(0.62 0.135 40)" },
  { id: "bot", name: "Гид", initials: "Г", color: "oklch(0.62 0.135 40)" },
];

export const TRIPS: TripSummary[] = [
  {
    id: "t1",
    title: "Грузия: вино и горы",
    dest: "Тбилиси → Кахетия → Казбеги",
    dates: "12 — 22 июня",
    status: "planning",
    members: ["me", "m1", "m2", "m3"],
    cover: "грузинские горы — сверху",
    days: 10,
  },
  {
    id: "t2",
    title: "Северный Байкал",
    dest: "Иркутск → Ольхон → Северобайкальск",
    dates: "3 — 14 августа",
    status: "active",
    members: ["me", "m4", "m5"],
    cover: "байкальский лёд",
    days: 11,
  },
  {
    id: "t3",
    title: "Карпаты, осень",
    dest: "Львов → Яремче → Говерла",
    dates: "5 — 11 октября",
    status: "planning",
    members: ["me", "m1", "m4", "m5", "m2"],
    cover: "карпатский лес",
    days: 7,
  },
  {
    id: "t4",
    title: "Сочи, длинные выходные",
    dest: "Адлер → Красная Поляна",
    dates: "23 — 26 февраля",
    status: "done",
    members: ["me", "m2", "m3"],
    cover: "горнолыжка",
    days: 4,
  },
];

export const ACTIVE_TRIP: ActiveTrip = {
  id: "t1",
  title: "Грузия: вино и горы",
  subtitle: "Тбилиси → Кахетия → Казбеги · 12—22 июня · 4 человека",
  members: ["me", "m1", "m2", "m3"],
  itinerary: [
    {
      day: 1,
      date: "12 июня",
      city: "Тбилиси",
      items: [
        { time: "09:30", type: "flight", title: "Прилёт во Внуково → Тбилиси", note: "Рейс U6-2845" },
        { time: "13:00", type: "stay", title: "Заселение, район Сололаки", note: "Адрес у Лёши" },
        { time: "15:00", type: "food", title: "Хинкальная Велиаминов", note: "5 хинкали + хачапури" },
        { time: "18:00", type: "walk", title: "Старый город пешком", note: "Серные бани, Нарикала" },
        { time: "21:00", type: "food", title: "Винный бар «Гвино Underground»", note: "" },
      ],
    },
    {
      day: 2,
      date: "13 июня",
      city: "Тбилиси → Кахетия",
      items: [
        { time: "08:00", type: "drive", title: "Машина в аренду", note: "Renault Duster, 4 дня" },
        { time: "11:00", type: "place", title: "Монастырь Бодбе", note: "Вход бесплатный" },
        { time: "14:00", type: "food", title: "Обед в Сигнахи", note: "Любой из 3 на главной" },
        { time: "17:00", type: "place", title: "Винодельня Шумi", note: "Дегустация × 4" },
      ],
    },
    {
      day: 3,
      date: "14 июня",
      city: "Казбеги",
      items: [
        { time: "07:30", type: "drive", title: "Военно-Грузинская дорога", note: "≈ 4 часа в пути" },
        { time: "13:00", type: "place", title: "Гергети, Троицкая церковь", note: "Подъём 1.5 ч" },
        { time: "19:00", type: "stay", title: "Гостевой дом «Соно»", note: "" },
      ],
    },
  ],
  votes: [
    {
      id: "v1",
      title: "Где ужинаем во второй вечер в Тбилиси?",
      author: "Аня",
      status: "open",
      myVote: null,
      options: [
        { id: "a", label: "Шавi Lomi — современная грузинская", votes: 2 },
        { id: "b", label: "Барбарестан — авторская кухня", votes: 1 },
        { id: "c", label: "Самикитно — классика на Мейдане", votes: 0 },
      ],
    },
    {
      id: "v2",
      title: "Стартуем рано или поспим?",
      author: "Лёша",
      status: "open",
      myVote: null,
      options: [
        { id: "a", label: "Выезд в 07:00, успеем всё", votes: 1 },
        { id: "b", label: "Выезд в 10:00, спокойное утро", votes: 2 },
      ],
    },
    {
      id: "v3",
      title: "Брать ли четвёртый день в Кахетии?",
      author: "Маша",
      status: "resolved",
      resolution: "Да, добавили",
      myVote: "a",
      options: [
        { id: "a", label: "Да, добавляем", votes: 3 },
        { id: "b", label: "Нет, едем в Боржоми", votes: 1 },
      ],
    },
  ],
  expenses: [
    { id: "e1", title: "Аренда машины (4 дня)", amount: 18400, payer: "me", split: ["me", "m1", "m2", "m3"], date: "12.06" },
    { id: "e2", title: "Хинкальная Велиаминов", amount: 2640, payer: "m1", split: ["me", "m1", "m2", "m3"], date: "12.06" },
    { id: "e3", title: "Бензин, заправка №1", amount: 3500, payer: "m2", split: ["me", "m1", "m2", "m3"], date: "13.06" },
    { id: "e4", title: "Дегустация Шумi", amount: 4800, payer: "me", split: ["me", "m1", "m2", "m3"], date: "13.06" },
    { id: "e5", title: "Гостевой дом «Соно»", amount: 9200, payer: "m3", split: ["me", "m1", "m2", "m3"], date: "14.06" },
  ],
};
