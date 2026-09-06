import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  buildPlan,
  daysLeft,
  formatDate,
  sameDay,
  EXAM_DATE,
  type TaskType,
} from "@/lib/plan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Imtihon Rejasi — 23 dekabr" },
      {
        name: "description",
        content:
          "6 sentabrdan 23 dekabrgacha: 4 ta darslik, Konstitutsiya va 35 ta qonun uchun kunlik o'qish rejasi va taraqqiyot kuzatuvi.",
      },
      { property: "og:title", content: "Imtihon Rejasi — 23 dekabr" },
      {
        property: "og:description",
        content:
          "4 ta darslik va 36 ta huquqiy hujjat uchun kunlik shaxsiy o'qish rejasi.",
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
  const [now] = useState(() => new Date());

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
  const nextTask =
    todayTask ?? plan.find((t) => t.date > now && !done.has(t.index));

  const stats = [
    { label: "Imtihongacha", value: `${daysLeft(now)} kun` },
    { label: "Bajarildi", value: `${doneCount}/${totalStudy}` },
    { label: "Darslik", value: "4 ta" },
    { label: "Hujjat", value: "36 ta" },
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
            4 ta darslik, Konstitutsiya va 35 ta qonun kunlarga bo'linib
            berildi. Har kuni belgilang — oxirgi ikki hafta takrorlash uchun
            ajratilgan.
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
              <div className="mt-1 text-sm text-accent-foreground/80">
                {formatDate(nextTask.date)} — {nextTask.detail}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <ol className="space-y-2">
          {plan.map((t) => {
            const isDone = done.has(t.index);
            const isToday = sameDay(t.date, now);
            return (
              <li key={t.index}>
                <button
                  onClick={() => toggle(t.index)}
                  className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                    t.type === "exam"
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-border bg-secondary/60"
                        : isToday
                          ? "border-primary/50 bg-card shadow-sm"
                          : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                      t.type === "exam"
                        ? "border-primary-foreground/40"
                        : isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background"
                    }`}
                    aria-hidden
                  >
                    {isDone && t.type !== "exam" ? "✓" : ""}
                  </span>
                  <span className="min-w-0 flex-1">
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
                      {t.detail}
                    </span>
                  </span>
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
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Imtihon: {formatDate(EXAM_DATE)}. Belgi brauzeringizda saqlanadi.
        </p>
      </main>
    </div>
  );
}
