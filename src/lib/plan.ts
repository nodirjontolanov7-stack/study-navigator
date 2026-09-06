export type TaskType = "book" | "law" | "review" | "exam";

export interface Task {
  index: number;
  date: Date;
  title: string;
  detail: string;
  type: TaskType;
}

const START = new Date(2026, 8, 6); // 6-sentabr 2026
const EXAM = new Date(2026, 11, 23); // 23-dekabr 2026

const BOOKS = 4;
const BOOK_DAYS_PER_BOOK = 15; // 4 × 15 = 60 kun
const LAW_COUNT = 35; // + Konstitutsiya = 36 hujjat

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function buildPlan(): Task[] {
  const tasks: Task[] = [];
  let day = 0;
  const push = (title: string, detail: string, type: TaskType) => {
    tasks.push({
      index: tasks.length,
      date: addDays(START, day),
      title,
      detail,
      type,
    });
    day++;
  };

  // 1-bosqich: darsliklar (har biri 15 kunga bo'linadi)
  for (let b = 1; b <= BOOKS; b++) {
    for (let p = 1; p <= BOOK_DAYS_PER_BOOK; p++) {
      push(
        `${b}-darslik — ${p}/${BOOK_DAYS_PER_BOOK} qism`,
        p === BOOK_DAYS_PER_BOOK
          ? "Kitobni yakunlang va qisqa konspekt yozing"
          : "O'qilgan qismdan konspekt yozib boring",
        "book"
      );
    }
  }

  // 2-bosqich: Konstitutsiya + qonunlar (kuniga 1 ta)
  push("Konstitutsiya", "Asosiy qonun — to'liq o'qing, moddalar ro'yxatini tuzing", "law");
  for (let l = 1; l <= LAW_COUNT; l++) {
    push(`${l}-qonun`, "Asosiy moddalar va tushunchalarni konspekt qiling", "law");
  }

  // 3-bosqich: takrorlash (imtihongacha qolgan kunlar)
  const reviewDays =
    Math.round((EXAM.getTime() - addDays(START, day).getTime()) / 86400000) - 1;
  const reviewTopics = [
    "1-darslik takrorlash",
    "2-darslik takrorlash",
    "3-darslik takrorlash",
    "4-darslik takrorlash",
    "Konstitutsiya takrorlash",
    "Qonunlar (1–9) takrorlash",
    "Qonunlar (10–18) takrorlash",
    "Qonunlar (19–27) takrorlash",
    "Qonunlar (28–35) takrorlash",
    "Umumiy takrorlash",
    "Sinov savollariga javob bering",
    "Yakuniy takrorlash — yengil kun",
  ];
  for (let i = 0; i < reviewDays; i++) {
    push(
      reviewTopics[i % reviewTopics.length] ?? "Umumiy takrorlash",
      "Konspektlarni ko'zdan kechiring, qiyin joylarni qayta o'qing",
      "review"
    );
  }

  tasks.push({
    index: tasks.length,
    date: EXAM,
    title: "IMTIHON KUNI",
    detail: "Omad! Erta uxlaling va hujjatlaringizni tayyor qo'ying",
    type: "exam",
  });

  return tasks;
}

export const EXAM_DATE = EXAM;
export const START_DATE = START;

export function daysLeft(now: Date): number {
  return Math.max(0, Math.ceil((EXAM.getTime() - now.getTime()) / 86400000));
}

const WEEKDAYS = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatDate(d: Date): string {
  return `${d.getDate()}-${MONTHS[d.getMonth()] ?? ""}, ${WEEKDAYS[d.getDay()] ?? ""}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
