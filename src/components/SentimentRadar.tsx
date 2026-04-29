import { Activity, AlertCircle } from "lucide-react";
import { sentimentRadar, sentimentOverall } from "@/data/hrData";
import { cn } from "@/lib/utils";

function moodColor(mood: number) {
  if (mood >= 75) return "text-success";
  if (mood >= 60) return "text-info";
  return "text-warning";
}
function stressBg(stress: number) {
  if (stress >= 70) return "bg-destructive";
  if (stress >= 55) return "bg-warning";
  return "bg-success";
}

export function SentimentRadar() {
  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
            <Activity className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold">رادار المزاج العام</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              مبني على إشارات لغوية مجهولة الهوية من تفاعلات الفريق
            </p>
          </div>
        </div>
        <span className={cn("chip", sentimentOverall.weekDelta < 0 ? "bg-warning-soft text-warning" : "bg-success-soft text-success")}>
          {sentimentOverall.weekDelta > 0 ? "+" : ""}{sentimentOverall.weekDelta} هذا الأسبوع
        </span>
      </div>

      {/* Overall */}
      <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">المزاج العام</p>
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-3xl font-bold num", moodColor(sentimentOverall.mood))}>
              {sentimentOverall.mood}
            </span>
            <span className="text-xs text-muted-foreground">/ ١٠٠</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">مستوى الضغط</p>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", stressBg(sentimentOverall.stress))}
                 style={{ width: `${sentimentOverall.stress}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 num">{sentimentOverall.stress}%</p>
        </div>
      </div>

      {/* Per-team */}
      <div className="divide-y divide-border">
        {sentimentRadar.map((s) => {
          const isHot = s.stress >= 70;
          return (
            <div key={s.team} className="p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{s.team}</p>
                  {isHot && (
                    <span className="chip bg-destructive/10 text-destructive text-[10px]">
                      <AlertCircle className="h-3 w-3" /> ضغط مرتفع
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-muted-foreground">المزاج: <span className={cn("font-bold num", moodColor(s.mood))}>{s.mood}</span></span>
                  <span className="text-muted-foreground">الضغط: <span className="font-bold num">{s.stress}</span></span>
                </div>
              </div>
              {/* Stacked dual bar */}
              <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-secondary">
                <div className="bg-success/70 transition-all" style={{ width: `${s.mood}%` }} />
                <div className={cn("transition-all", stressBg(s.stress))} style={{ width: `${s.stress / 2}%` }} />
              </div>
              <ul className="mt-2 space-y-0.5">
                {s.signals.map((sig, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">• {sig}</li>
                ))}
              </ul>
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
