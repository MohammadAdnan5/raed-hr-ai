import { TrendingUp, Clock, Coins, Bot, Timer } from "lucide-react";
import { roiSummary, roiBreakdown } from "@/data/hrData";

const iconMap = [Clock, Coins, Bot, Timer];

export function ROITracker() {
  const max = Math.max(...roiSummary.trend);
  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
            <TrendingUp className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold">مؤشر العائد على الاستثمار</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              قياس الأثر الفعلي للوكيل هذا الأسبوع
            </p>
          </div>
        </div>
        <span className="chip bg-success-soft text-success">+٢٢٪ هذا الأسبوع</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Headline */}
        <div className="rounded-2xl bg-gradient-hero p-5 border border-primary/10">
          <p className="text-sm text-muted-foreground mb-1">وفّر رائد هذا الأسبوع</p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-black num text-primary">{roiSummary.hoursSavedWeek}</span>
            <span className="text-base font-medium">ساعة عمل</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-2xl font-bold num">{roiSummary.riyalEquivalent.toLocaleString("ar-SA")}</span>
            <span className="text-base font-medium">ريال</span>
          </div>
          {/* Sparkline */}
          <div className="mt-4 flex items-end gap-1.5 h-12">
            {roiSummary.trend.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${(v / max) * 100}%` }}
                  title={`${v} ساعة`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground num">
            <span>س</span><span>أ</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>اليوم</span>
          </div>
        </div>

        {/* Breakdown grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {roiBreakdown.map((m, i) => {
            const Icon = iconMap[i];
            return (
              <div key={i} className="rounded-xl border border-border p-3.5 bg-card">
                <Icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-[11px] text-muted-foreground mb-1">{m.label}</p>
                <p className="text-xl font-bold num leading-tight">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                <p className={`text-[11px] font-medium num mt-1 ${m.positive ? "text-success" : "text-destructive"}`}>
                  {m.delta}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
