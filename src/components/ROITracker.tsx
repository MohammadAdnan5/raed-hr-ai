import { useState, useMemo } from "react";
import { TrendingUp, Clock, Coins, Bot, Timer } from "lucide-react";
import { roiSummary, roiBreakdown } from "@/data/hrData";
import { cn } from "@/lib/utils";

const iconMap = [Clock, Coins, Bot, Timer];

type Range = "day" | "week" | "month";

const RANGES: { id: Range; label: string }[] = [
  { id: "day", label: "يومي" },
  { id: "week", label: "أسبوعي" },
  { id: "month", label: "شهري" },
];

// Mock series — daily (last 7), weekly (last 7 weeks), monthly (last 6 months)
const SERIES: Record<Range, { data: number[]; ticks: string[] }> = {
  day: { data: [3, 2, 4, 3, 5, 2, 4], ticks: ["س", "أ", "ث", "ر", "خ", "ج", "اليوم"] },
  week: { data: roiSummary.trend, ticks: ["-٦أ", "-٥أ", "-٤أ", "-٣أ", "-٢أ", "أمس", "هذا الأسبوع"] },
  month: { data: [52, 61, 58, 70, 66, 78], ticks: ["ديس", "ينا", "فبر", "مار", "أبر", "مايو"] },
};

const HEADLINE: Record<Range, { hours: number; riyal: number; deltaLabel: string; rangeLabel: string }> = {
  day: { hours: 4, riyal: 1200, deltaLabel: "+١٥٪ مقارنة بالأمس", rangeLabel: "اليوم" },
  week: { hours: roiSummary.hoursSavedWeek, riyal: roiSummary.riyalEquivalent, deltaLabel: "+٢٢٪ مقارنة بالأسبوع الماضي", rangeLabel: "هذا الأسبوع" },
  month: { hours: 78, riyal: 23400, deltaLabel: "+١٨٪ مقارنة بالشهر الماضي", rangeLabel: "هذا الشهر" },
};

export function ROITracker() {
  const [range, setRange] = useState<Range>("week");
  const series = SERIES[range];
  const headline = HEADLINE[range];
  const max = useMemo(() => Math.max(...series.data), [series.data]);

  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
            <TrendingUp className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold">مؤشر العائد على الاستثمار</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              قياس الأثر الفعلي للوكيل
            </p>
          </div>
        </div>
        {/* Timeframe segmented control */}
        <div role="tablist" className="inline-flex items-center bg-secondary/60 rounded-full p-1 gap-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-full transition-all",
                range === r.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Headline */}
        <div className="rounded-2xl bg-gradient-hero p-5 border border-primary/10">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <p className="text-sm text-muted-foreground">وفّر رائد {headline.rangeLabel}</p>
            <span className="chip bg-success-soft text-success">{headline.deltaLabel}</span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-black num text-primary">{headline.hours}</span>
            <span className="text-base font-medium">ساعة عمل</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-2xl font-bold num">{headline.riyal.toLocaleString("ar-SA")}</span>
            <span className="text-base font-medium">ريال</span>
          </div>
          {/* Sparkline */}
          <div className="mt-4 flex items-end gap-1.5 h-12">
            {series.data.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${(v / max) * 100}%` }}
                  title={`${v} ساعة`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            {series.ticks.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
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
