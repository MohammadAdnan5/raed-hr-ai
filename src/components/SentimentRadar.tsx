import { Activity, AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { sentimentRadar, sentimentOverall } from "@/data/hrData";
import { cn } from "@/lib/utils";

function moodTone(mood: number) {
  if (mood >= 75) return { color: "text-success", bar: "bg-success", label: "ممتاز" };
  if (mood >= 60) return { color: "text-info", bar: "bg-info", label: "مقبول" };
  return { color: "text-warning", bar: "bg-warning", label: "منخفض" };
}
function stressTone(stress: number) {
  if (stress >= 70) return { color: "text-destructive", bar: "bg-destructive", label: "مرتفع" };
  if (stress >= 55) return { color: "text-warning", bar: "bg-warning", label: "متوسط" };
  return { color: "text-success", bar: "bg-success", label: "منخفض" };
}

export function SentimentRadar() {
  const deltaPositive = sentimentOverall.weekDelta >= 0;

  return (
    <div className="bento-card p-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral shrink-0">
              <Activity className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight">رادار المزاج العام</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                إشارات لغوية مجهولة الهوية من تفاعلات الفريق
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip — overall mood + stress + delta */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border border-b border-border">
        <div className="p-4">
          <p className="text-[11px] text-muted-foreground mb-1.5">المزاج العام</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-bold num", moodTone(sentimentOverall.mood).color)}>
              {sentimentOverall.mood}
            </span>
            <span className="text-[11px] text-muted-foreground">/ ١٠٠</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] text-muted-foreground mb-1.5">مستوى الضغط</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-bold num", stressTone(sentimentOverall.stress).color)}>
              {sentimentOverall.stress}
            </span>
            <span className="text-[11px] text-muted-foreground">/ ١٠٠</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] text-muted-foreground mb-1.5">التغيّر الأسبوعي</p>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-2xl font-bold num",
              deltaPositive ? "text-success" : "text-warning"
            )}
          >
            {deltaPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {deltaPositive ? "+" : ""}
            {sentimentOverall.weekDelta}
          </div>
        </div>
      </div>

      {/* Per-team — clean grid, each team gets two distinct lines */}
      <div className="divide-y divide-border">
        {sentimentRadar.map((s) => {
          const mt = moodTone(s.mood);
          const st = stressTone(s.stress);
          const isHot = s.stress >= 70;
          return (
            <div key={s.team} className="p-5 hover:bg-secondary/20 transition-colors">
              {/* Team name row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-bold">{s.team}</p>
                  {isHot && (
                    <span className="chip bg-destructive/10 text-destructive text-[10px]">
                      <AlertCircle className="h-3 w-3" /> ضغط مرتفع
                    </span>
                  )}
                </div>
              </div>

              {/* Two parallel metrics — each on its own line, breathing room */}
              <div className="space-y-2.5">
                <MetricBar label="المزاج" value={s.mood} tone={mt} />
                <MetricBar label="الضغط" value={s.stress} tone={st} />
              </div>

              {/* Signals */}
              {s.signals.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {s.signals.map((sig, i) => (
                    <li
                      key={i}
                      className="text-[10px] text-muted-foreground bg-secondary/60 px-2 py-1 rounded-md"
                    >
                      {sig}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-border bg-secondary/30">
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          البيانات مجمّعة ومجهولة الهوية — لا تكشف عن أفراد بعينهم احتراماً للخصوصية.
        </p>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: { color: string; bar: string; label: string };
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="flex items-center gap-1.5">
          <span className={cn("font-medium", tone.color)}>{tone.label}</span>
          <span className={cn("font-bold num", tone.color)}>{value}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
