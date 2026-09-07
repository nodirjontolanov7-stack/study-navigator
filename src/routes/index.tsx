import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  buildPlan,
  daysLeft,
  formatDate,
  sameDay,
  EXAM_DATE,
  DOC_COUNT,
  BOOK_COUNT,
  type TaskType,
} from "@/lib/plan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Imtihon Rejasi — kunlik topshiriqlar" },
      {
        name: "description",
        content:
          "6 sentabrdan 23 dekabrgacha: 4 ta darslik, Konstitutsiya va 35 ta qonunchilik hujjati bo'yicha aniq kunlik topshiriqlar va lex.uz havolalari.",
      },
      { property: "og:title", content: "Imtihon Rejasi — kunlik topshiriqlar" },
      {
        property: "og:description",
        content:
          "Har kun uchun aniq topshiriqlar: nima o'qish, nima konspekt qilish, nimani takrorlash.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const STORAGE_KEY = "imtihon-rejasi-progress-v1";

const TYPE_LABEL: Record<TaskType, string> = {
  book: "Darslik",
  law: "Qonunchilik",
  review: "Takrorlash",
  exam: "Imtihon",
};

function Index() {
  const plan = useMemo(buildPlan, []);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [now] = useState(() => new Date());
  const [filter, setFilter] = useState<0 | 1 | 2 | 3 | "all">("all");
  const [view, setView] = useState<"table" | "list">("table");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(new Set(JSON.parse(raw) as number[]));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  }, [done, loaded]);

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const doneCount = plan.filter((t) => done.has(t.index) && t.type !== "exam").length;
  const totalStudy = plan.filter((t) => t.type !== "exam").length;
  const pct = Math.round((doneCount / totalStudy) * 100);

  const todayTask = plan.find((t) => sameDay(t.date, now));
  const nextTask = todayTask ?? plan.find((t) => t.date > now && !done.has(t.index));

  useEffect(() => {
    if (loaded && nextTask && open === null) setOpen(nextTask.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const cycleStats = ([1, 2, 3] as const).map((c) => {
    const list = plan.filter((t) => t.cycle === c);
    const d = list.filter((t) => done.has(t.index)).length;
    return { cycle: c, total: list.length, done: d, pct: list.length ? Math.round((d / list.length) * 100) : 0 };
  });

  const visible = filter === "all" ? plan : plan.filter((t) => t.cycle === filter);

  const goToday = () => {
    const t = todayTask ?? nextTask;
    if (!t) return;
    setFilter("all");
    setOpen(t.index);
    requestAnimationFrame(() =>
      document
        .getElementById(`day-${t.index}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    );
  };

  const stats = [
    { label: "Imtihongacha", value: `${daysLeft(now)} kun` },
    { label: "Bajarildi", value: `${doneCount}/${totalStudy}` },
    { label: "Darslik", value: `${BOOK_COUNT} ta` },
    { label: "Hujjat", value: `${DOC_COUNT} ta` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            6 sentabr → 23 dekabr
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            Imtihon rejasi
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Haftada 5 kun (dushanba–juma), shanba–yakshanba dam. Barcha materiallar
            3 marta to'liq o'tiladi: har kuni darslik va qonunlar aralash, 3 ta davrda.
            Qonunchilik hujjatlari lex.uz havolasi bilan berilgan.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="font-display text-2xl font-semibold text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Umumiy taraqqiyot</span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {nextTask && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-accent p-4">
              <div className="text-xs font-medium uppercase tracking-widest text-accent-foreground/70">
                {todayTask ? "Bugungi vazifa" : "Keyingi vazifa"}
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-accent-foreground">
                {nextTask.title}
              </div>
              <ul className="mt-2 space-y-1 text-sm text-accent-foreground/80">
                {nextTask.steps.map((s, i) => (
                  <li key={i}>
                    {i + 1}. {s}
                  </li>
                ))}
              </ul>
              {nextTask.links?.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-sm font-medium text-primary underline"
                >
                  lex.uz: {l.label} →
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {cycleStats.map((c) => (
            <div key={c.cycle} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">{c.cycle}-davra</span>
                <span className="text-xs text-muted-foreground">
                  {c.done}/{c.total}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {([["all", "Hammasi"], [1, "1-davra"], [2, "2-davra"], [3, "3-davra"], [0, "Takrorlash"]] as const).map(
            ([value, label]) => (
              <button
                key={String(value)}
                onClick={() => setFilter(value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            )
          )}
          <div className="ml-auto flex gap-2">
            <div className="flex overflow-hidden rounded-full border border-border bg-card">
              {(["table", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    view === v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "table" ? "Jadval" : "Ro'yxat"}
                </button>
              ))}
            </div>
            <button
              onClick={goToday}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              Bugunga o'tish
            </button>
          </div>
        </div>

        {view === "table" && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-secondary/70 text-left">
                  <th className="w-10 border-b border-border px-3 py-2.5 font-medium text-muted-foreground">✓</th>
                  <th className="w-32 border-b border-l border-border px-3 py-2.5 font-medium text-muted-foreground">Sana</th>
                  <th className="border-b border-l border-border px-3 py-2.5 font-medium text-muted-foreground">Darslik</th>
                  <th className="border-b border-l border-border px-3 py-2.5 font-medium text-muted-foreground">NHH (qonunchilik)</th>
                  <th className="w-56 border-b border-l border-border px-3 py-2.5 font-medium text-muted-foreground">English</th>
                  <th className="w-24 border-b border-l border-border px-3 py-2.5 font-medium text-muted-foreground">Davra</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => {
                  const isDone = done.has(t.index);
                  const isToday = sameDay(t.date, now);
                  return (
                    <tr
                      key={t.index}
                      id={`row-${t.index}`}
                      className={
                        t.type === "exam"
                          ? "bg-primary/10"
                          : isDone
                            ? "bg-secondary/40 text-muted-foreground"
                            : isToday
                              ? "bg-accent"
                              : ""
                      }
                    >
                      <td className="border-b border-border px-3 py-2 align-top">
                        <button
                          onClick={() => toggle(t.index)}
                          aria-label={isDone ? "Belgini olish" : "Bajarildi deb belgilash"}
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                            isDone
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                        >
                          {isDone ? "✓" : ""}
                        </button>
                      </td>
                      <td className="whitespace-nowrap border-b border-l border-border px-3 py-2 align-top">
                        {formatDate(t.date)}
                        {isToday && (
                          <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                            bugun
                          </span>
                        )}
                      </td>
                      <td className={`border-b border-l border-border px-3 py-2 align-top ${isDone ? "line-through" : ""}`}>
                        {t.cells.book.length ? t.cells.book.join(", ") : "—"}
                      </td>
                      <td className={`border-b border-l border-border px-3 py-2 align-top ${isDone ? "line-through" : ""}`}>
                        {t.cells.doc.length ? (
                          <ul className="space-y-1">
                            {t.cells.doc.map((d, i) => {
                              const link = t.links?.find((l) => l.label === d);
                              return (
                                <li key={i}>
                                  {link ? (
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary underline decoration-dotted"
                                    >
                                      {d}
                                    </a>
                                  ) : (
                                    d
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="border-b border-l border-border px-3 py-2 align-top">
                        {t.cells.english}
                      </td>
                      <td className="whitespace-nowrap border-b border-l border-border px-3 py-2 align-top text-muted-foreground">
                        {t.type === "exam"
                          ? "Imtihon"
                          : t.cycle === 0
                            ? "Takrorlash"
                            : `${t.cycle}-davra`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === "list" && (
        <ol className="mt-4 space-y-2">
          {visible.map((t) => {
            const isDone = done.has(t.index);
            const isToday = sameDay(t.date, now);
            const isOpen = open === t.index;
            return (
              <li key={t.index} id={`day-${t.index}`}>
                <div
                  className={`rounded-lg border transition-colors ${
                    t.type === "exam"
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-border bg-secondary/60"
                        : isToday
                          ? "border-primary/50 bg-card shadow-sm"
                          : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggle(t.index)}
                      aria-label={isDone ? "Belgini olish" : "Bajarildi deb belgilash"}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                        t.type === "exam"
                          ? "border-primary-foreground/40"
                          : isDone
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background"
                      }`}
                    >
                      {isDone && t.type !== "exam" ? "✓" : ""}
                    </button>
                    <button
                      onClick={() => setOpen(isOpen ? null : t.index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span
                        className={`block font-medium ${
                          isDone && t.type !== "exam"
                            ? "text-muted-foreground line-through"
                            : t.type === "exam"
                              ? "text-primary-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {t.title}
                      </span>
                      <span
                        className={`mt-0.5 block text-sm ${
                          t.type === "exam"
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t.steps.length} topshiriq — {isOpen ? "yopish" : "ko'rish"}
                      </span>
                    </button>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`text-xs ${
                          t.type === "exam"
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(t.date)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          t.type === "exam"
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {isToday ? "Bugun" : TYPE_LABEL[t.type]}
                      </span>
                    </span>
                  </div>

                  {isOpen && (
                    <div
                      className={`border-t px-4 py-3 ${
                        t.type === "exam"
                          ? "border-primary-foreground/20"
                          : "border-border"
                      }`}
                    >
                      <ol
                        className={`list-decimal space-y-1.5 pl-5 text-sm ${
                          t.type === "exam"
                            ? "text-primary-foreground/90"
                            : "text-foreground"
                        }`}
                      >
                        {t.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                      {t.links?.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 block text-sm font-medium text-primary underline"
                        >
                          lex.uz: {l.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        )}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Imtihon: {formatDate(EXAM_DATE)}. Belgi brauzeringizda saqlanadi.
        </p>
      </main>
    </div>
  );
}
