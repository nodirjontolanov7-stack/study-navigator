export type TaskType = "book" | "law" | "review" | "exam";

export interface Task {
  index: number;
  date: Date;
  title: string;
  /** Aniq kunlik topshiriqlar */
  steps: string[];
  /** lex.uz havolalari (shu kungi hujjatlar uchun) */
  links?: { label: string; url: string }[];
  type: TaskType;
}

const START = new Date(2026, 8, 6); // 6-sentabr 2026 (yakshanba — 1-o'qish kuni dushanba)
const EXAM = new Date(2026, 11, 23); // 23-dekabr 2026
const LAST_STUDY = new Date(2026, 11, 16); // shu kungacha 3 davra, keyin yakuniy takrorlash

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function lexLink(title: string): string {
  return `https://lex.uz/search/nat?query=${encodeURIComponent(title)}`;
}

/** 4 ta darslik — har biri 12 kun */
const BOOKS = [
  "1-darslik",
  "2-darslik",
  "3-darslik",
  "4-darslik",
];
const BOOK_DAYS = 12;

/** Hujjatlar ro'yxati: [nomi, ajratilgan kun soni, kunlik bo'limlar] */
type Doc = { title: string; parts: string[] };

const DOCS: Doc[] = [
  {
    title: "O'zbekiston Respublikasi Konstitutsiyasi",
    parts: [
      "Muqaddima va I bo'lim (Asosiy printsiplar), 1–14-moddalar",
      "II bo'lim — inson va fuqaro huquqlari, 15–46-moddalar",
      "III–IV bo'limlar — jamiyat, oila, fuqarolik jamiyati",
      "V bo'lim — davlat hokimiyati tashkil etilishi (Oliy Majlis, Prezident, Vazirlar Mahkamasi)",
      "VI bo'lim — sud hokimiyati, prokuratura va yakuniy qoidalar",
    ],
  },
  { title: "\"O'zbekiston Respublikasining Davlat bayrog'i to'g'risida\"gi qonun", parts: ["To'liq matn: bayroq tavsifi, ranglar ma'nosi, foydalanish qoidalari"] },
  { title: "\"O'zbekiston Respublikasining Davlat gerbi to'g'risida\"gi qonun", parts: ["To'liq matn: gerb tavsifi, unsurlari, foydalanish tartibi"] },
  { title: "\"O'zbekiston Respublikasining Davlat madhiyasi to'g'risida\"gi qonun", parts: ["To'liq matn: madhiya matni, ijro etish qoidalari"] },
  { title: "\"Vijdon erkinligi va diniy tashkilotlar to'g'risida\"gi qonun", parts: ["Asosiy tushunchalar, diniy tashkilot ro'yxatdan o'tishi, taqiqlar"] },
  { title: "\"Siyosiy partiyalar to'g'risida\"gi qonun", parts: ["Partiya tuzish, ro'yxatga olish, faoliyatini to'xtatish asoslari"] },
  { title: "\"O'zbekiston Respublikasi Vazirlar Mahkamasi to'g'risida\"gi qonun", parts: ["Tarkibi, vakolatlari, qarorlar qabul qilish tartibi"] },
  { title: "\"Advokatura to'g'risida\"gi qonun", parts: ["Advokat statusi, litsenziya, advokat so'rovi, kafolatlar"] },
  {
    title: "O'zbekiston Respublikasining Budjet kodeksi",
    parts: [
      "Umumiy qoidalar, budjet tizimi va darajalari",
      "Budjet jarayoni: loyihani tuzish, ko'rib chiqish, tasdiqlash va ijro",
    ],
  },
  {
    title: "O'zbekiston Respublikasining Fuqarolik kodeksi",
    parts: [
      "Umumiy qism: shaxslar, bitimlar, vakillik, muddatlar",
      "Mulk huquqi va boshqa ashyoviy huquqlar",
      "Majburiyatlar: yuzaga kelishi, ijrosi, ta'minoti, javobgarlik",
      "Alohida shartnoma turlari (oldi-sotdi, ijara, pudrat, xizmat)",
      "Meros huquqi va nomulkiy huquqlar",
    ],
  },
  { title: "\"O'zbekiston Respublikasining Fuqaroligi to'g'risida\"gi qonun", parts: ["Fuqarolikka qabul qilish, chiqish, tiklash asoslari va tartibi"] },
  { title: "\"Iste'molchilarning huquqlarini himoya qilish to'g'risida\"gi qonun", parts: ["Iste'molchi huquqlari, sifat kafolati, nizolarni hal qilish"] },
  {
    title: "O'zbekiston Respublikasining Jinoyat kodeksi",
    parts: [
      "Umumiy qism: jinoyat tushunchasi, aybdorlik, javobgarlikni istisno qiluvchi holatlar",
      "Umumiy qism: jazolar turlari, tayinlash, ozod qilish asoslari",
      "Maxsus qism: shaxsga qarshi jinoyatlar",
      "Maxsus qism: iqtisodiyot, tinchlik va boshqaruv tartibiga qarshi jinoyatlar",
    ],
  },
  {
    title: "O'zbekiston Respublikasining Jinoyat-protsessual kodeksi",
    parts: [
      "Umumiy qoidalar: printsiplar, ishtirokchilar, dalillar",
      "Dastlabki tergov, majburlov choralari",
      "Sudda ko'rib chiqish, hukm, apellyatsiya va kassatsiya",
    ],
  },
  {
    title: "O'zbekiston Respublikasining Ma'muriy javobgarlik to'g'risidagi kodeksi",
    parts: [
      "Umumiy qism: ma'muriy huquqbuzarlik, jazolar turlari",
      "Maxsus qism: eng ko'p uchraydigan huquqbuzarliklar va ish yuritish tartibi",
    ],
  },
  {
    title: "O'zbekiston Respublikasining Mehnat kodeksi",
    parts: [
      "Mehnat shartnomasi: tuzish, o'zgartirish, bekor qilish",
      "Ish vaqti, dam olish, ta'til, mehnatga haq to'lash",
      "Mehnat nizolari, mehnat muhofazasi, alohida toifalar kafolatlari",
    ],
  },
  { title: "Inson huquqlari bo'yicha O'zbekiston Respublikasi Milliy markazi to'g'risida NIZOM", parts: ["Markaz maqomi, vazifalari, faoliyat yo'nalishlari"] },
  { title: "\"Mualliflik huquqi va turdosh huquqlar to'g'risida\"gi qonun", parts: ["Ob'ektlar, muallif huquqlari, muddatlar, himoya usullari"] },
  { title: "\"Normativ-huquqiy hujjatlar to'g'risida\"gi qonun", parts: ["Hujjat turlari, ierarxiya, kuchga kirishi, talqin qilish"] },
  { title: "\"Notariat to'g'risida\"gi qonun", parts: ["Notarius maqomi, notarial harakatlar turlari va tartibi"] },
  {
    title: "O'zbekiston Respublikasining Oila kodeksi",
    parts: [
      "Nikoh: tuzish, bekor qilish, er-xotin huquq va majburiyatlari",
      "Ota-ona va bolalar, aliment, farzandlikka olish, vasiylik",
    ],
  },
  { title: "\"Oliy Majlisning inson huquqlari bo'yicha vakili (Ombudsman) to'g'risida\"gi qonun", parts: ["Ombudsman maqomi, vakolatlari, murojaatlarni ko'rish tartibi"] },
  { title: "\"Prokuratura to'g'risida\"gi qonun", parts: ["Prokuratura tizimi, nazorat yo'nalishlari, prokuror aktlari"] },
  { title: "\"O'zbekiston Respublikasining referendumi to'g'risida\"gi qonun", parts: ["Referendum tashabbusi, o'tkazish tartibi, natijalar"] },
  {
    title: "O'zbekiston Respublikasining Saylov kodeksi",
    parts: [
      "Saylov printsiplari, saylov komissiyalari tizimi",
      "Nomzodlarni ro'yxatga olish, ovoz berish va natijalarni aniqlash",
    ],
  },
  {
    title: "O'zbekiston Respublikasining Soliq kodeksi",
    parts: [
      "Umumiy qism: soliq tushunchalari, soliq to'lovchi huquqlari, nazorat",
      "Maxsus qism: asosiy soliq turlari (QQS, foyda, daromad, mol-mulk)",
    ],
  },
  { title: "\"Sudlar to'g'risida\"gi qonun", parts: ["Sud tizimi, sudya maqomi, Sudyalar oliy kengashi"] },
  { title: "O'zbekiston Respublikasi Adliya vazirligi to'g'risida NIZOM", parts: ["Vazirlik vazifalari, tuzilmasi, vakolatlari"] },
  { title: "\"O'zbekiston Respublikasining Xalqaro shartnomalari to'g'risida\"gi qonun", parts: ["Shartnoma tuzish, ratifikatsiya, ijro va bekor qilish"] },
  { title: "\"Tabiatni muhofaza qilish to'g'risida\"gi qonun", parts: ["Ekologik talablar, ekspertiza, javobgarlik"] },
  { title: "\"Jamiyatda huquqiy ong va huquqiy madaniyatni yuksaltirish tizimini tubdan takomillashtirish to'g'risida\"gi Prezident farmoni", parts: ["Farmon maqsadlari, konsepsiya asosiy yo'nalishlari"] },
  { title: "\"Jismoniy va yuridik shaxslarning murojaatlari to'g'risida\"gi qonun", parts: ["Murojaat turlari, ko'rib chiqish muddatlari, javobgarlik"] },
  { title: "\"O'zbekiston Respublikasida jamoat birlashmalari to'g'risida\"gi qonun", parts: ["Tashkil etish, ro'yxatga olish, faoliyat kafolatlari"] },
  { title: "\"Fuqarolarning o'zini o'zi boshqarish organlari to'g'risida\"gi qonun", parts: ["Mahalla organlari, rais saylovi, vakolatlar"] },
  { title: "\"Mahalliy davlat hokimiyati to'g'risida\"gi qonun", parts: ["Hokim va Kengash vakolatlari, qarorlar qabul qilish"] },
];

const REVIEW_TOPICS: { title: string; steps: string[] }[] = [
  {
    title: "Takrorlash: Konstitutsiya",
    steps: [
      "Konspektni to'liq o'qing",
      "Bo'limlar va moddalar sonini yoddan aytib chiqing",
      "10 ta o'zingizga savol tuzib javob bering",
    ],
  },
  {
    title: "Takrorlash: 1-darslik",
    steps: ["Konspekt bo'yicha barcha mavzularni ko'zdan kechiring", "Ta'riflarni yozib takrorlang", "Qiyin 3 mavzuni qayta o'qing"],
  },
  {
    title: "Takrorlash: 2-darslik",
    steps: ["Konspekt bo'yicha barcha mavzularni ko'zdan kechiring", "Ta'riflarni yozib takrorlang", "Qiyin 3 mavzuni qayta o'qing"],
  },
  {
    title: "Takrorlash: 3-darslik",
    steps: ["Konspekt bo'yicha barcha mavzularni ko'zdan kechiring", "Ta'riflarni yozib takrorlang", "Qiyin 3 mavzuni qayta o'qing"],
  },
  {
    title: "Takrorlash: 4-darslik",
    steps: ["Konspekt bo'yicha barcha mavzularni ko'zdan kechiring", "Ta'riflarni yozib takrorlang", "Qiyin 3 mavzuni qayta o'qing"],
  },
  {
    title: "Takrorlash: davlat ramzlari va konstitutsiyaviy qonunlar",
    steps: ["Bayroq, gerb, madhiya qonunlari", "Referendum va Saylov kodeksi asosiy tartiblari", "Qisqa test ishlang"],
  },
  {
    title: "Takrorlash: Fuqarolik va Oila kodekslari",
    steps: ["Bitim, mulk, majburiyat tushunchalarini takrorlang", "Nikoh va aliment qoidalarini takrorlang", "5 ta amaliy holat yechib ko'ring"],
  },
  {
    title: "Takrorlash: Jinoyat va JPK",
    steps: ["Jazo turlari va muddatlarini takrorlang", "Majburlov choralari va tergov muddatlari", "Kazuslar bo'yicha mashq"],
  },
  {
    title: "Takrorlash: Mehnat, Soliq, Budjet",
    steps: ["Mehnat shartnomasi bekor qilish asoslari", "Asosiy soliq stavkalari va to'lovchilar", "Budjet jarayoni bosqichlari"],
  },
  {
    title: "Takrorlash: sud-huquq organlari",
    steps: ["Sudlar, Prokuratura, Advokatura, Notariat qonunlari", "Ombudsman va Milliy markaz nizomlari", "Vakolatlarni jadval qilib solishtiring"],
  },
  {
    title: "Takrorlash: davlat boshqaruvi va fuqarolik jamiyati",
    steps: ["Vazirlar Mahkamasi, mahalliy hokimiyat, mahalla", "Jamoat birlashmalari va siyosiy partiyalar", "Murojaatlar qonunini takrorlang"],
  },
  {
    title: "Umumiy sinov: to'liq test",
    steps: ["50 ta savoldan sinov ishlang", "Xatolarni ajratib qayta o'qing", "Xato mavzular ro'yxatini tuzing"],
  },
];

export function buildPlan(): Task[] {
  const tasks: Task[] = [];
  let day = 0;
  const push = (t: Omit<Task, "index" | "date">) => {
    tasks.push({ ...t, index: tasks.length, date: addDays(START, day) });
    day++;
  };

  // 1-bosqich: darsliklar
  BOOKS.forEach((book, bi) => {
    for (let p = 1; p <= BOOK_DAYS; p++) {
      const last = p === BOOK_DAYS;
      push({
        title: `${book} — ${p}/${BOOK_DAYS} qism`,
        type: "book",
        steps: [
          `Kitobning ${Math.round(((p - 1) / BOOK_DAYS) * 100)}–${Math.round((p / BOOK_DAYS) * 100)}% oralig'ini o'qing (~2 soat)`,
          "O'qigan qismdan 1 varaq konspekt yozing (ta'rif + misol)",
          last
            ? `Butun ${bi + 1}-darslik bo'yicha 20 ta savol tuzib javob bering`
            : "Kechqurun 15 daqiqa oldingi kun konspektini takrorlang",
        ],
      });
    }
  });

  // 2-bosqich: qonunchilik hujjatlari (lex.uz)
  DOCS.forEach((doc, di) => {
    doc.parts.forEach((part, pi) => {
      const multi = doc.parts.length > 1;
      push({
        title: multi
          ? `${di + 1}. ${doc.title} (${pi + 1}/${doc.parts.length})`
          : `${di + 1}. ${doc.title}`,
        link: lexLink(doc.title),
        type: "law",
        steps: [
          `lex.uz da oching va o'qing: ${part}`,
          "Asosiy moddalar raqami bilan qisqa konspekt yozing (10–15 qator)",
          pi === doc.parts.length - 1
            ? "Hujjat bo'yicha 5 ta savol tuzib o'zingizni sinang"
            : "Bugungi moddalardan 5 ta tayanch tushunchani yodlang",
        ],
      });
    });
  });

  // 3-bosqich: takrorlash — imtihongacha qolgan kunlar
  const reviewDays = Math.max(
    0,
    Math.round((EXAM.getTime() - addDays(START, day).getTime()) / 86400000)
  );
  for (let i = 0; i < reviewDays; i++) {
    const topic = REVIEW_TOPICS[i % REVIEW_TOPICS.length]!;
    push({ title: topic.title, steps: topic.steps, type: "review" });
  }

  tasks.push({
    index: tasks.length,
    date: EXAM,
    title: "IMTIHON KUNI",
    type: "exam",
    steps: [
      "Hujjatlaringizni oldindan tayyorlab qo'ying",
      "Ertalab faqat qisqa konspektni ko'zdan kechiring",
      "Omad! Xotirjam bo'ling",
    ],
  });

  return tasks;
}

export const EXAM_DATE = EXAM;
export const START_DATE = START;
export const DOC_COUNT = DOCS.length;
export const BOOK_COUNT = BOOKS.length;

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
