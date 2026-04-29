import { useState } from "react";
import { FlaskConical, Sparkles, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { whatIfPresets } from "@/data/hrData";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface SimResult {
  question: string;
  rows: { label: string; value: string; tone: "info" | "warn" | "ok" }[];
  refs: string[];
}

function simulate(q: string): SimResult {
  const text = q.trim();
  // mock smart routing
  if (/بدون راتب|غير مدفوع/.test(text)) {
    const days = parseInt(text.match(/\d+/)?.[0] || "5");
    return {
      question: text,
      rows: [
        { label: "أيام بدون راتب", value: `${days} يوم`, tone: "warn" },
        { label: "خصم تقديري من الراتب", value: `${(days * 700).toLocaleString("ar-SA")} ريال`, tone: "warn" },
        { label: "تأثير على رصيد السنوية", value: "لا يوجد", tone: "ok" },
        { label: "احتساب نهاية الخدمة", value: "لا يتأثر", tone: "ok" },
        { label: "موافقة المدير", value: "مطلوبة", tone: "info" },
      ],
      refs: ["سياسة الإجازات — المادة ٩", "نظام العمل — المادة ١١٦"],
    };
  }
  if (/استقال/.test(text)) {
    return {
      question: text,
      rows: [
        { label: "فترة الإشعار", value: "٦٠ يوم", tone: "info" },
        { label: "مكافأة نهاية الخدمة (تقديرية)", value: "٤٢,٠٠٠ ريال", tone: "ok" },
        { label: "رصيد إجازة قابل للصرف", value: "١٣ يوم", tone: "ok" },
        { label: "تسوية تأمينية", value: "تنتهي بعد ٣٠ يوم", tone: "warn" },
      ],
      refs: ["نظام العمل — المادة ٨٤", "ميثاق المغادرة — المادة ٢"],
    };
  }
  if (/عن بُعد|عن بعد|ريموت/.test(text)) {
    return {
      question: text,
      rows: [
        { label: "الحد الشهري", value: "٤ أيام", tone: "info" },
        { label: "المتبقي بعد هذا الطلب", value: "١ يوم", tone: "warn" },
        { label: "تعارض مع اجتماعات حضورية", value: "يوم واحد", tone: "warn" },
        { label: "موافقة الفريق", value: "تلقائية", tone: "ok" },
      ],
      refs: ["سياسة العمل عن بُعد — المادة ٢"],
    };
  }
  if (/رحّل|ترحيل/.test(text)) {
    return {
      question: text,
      rows: [
        { label: "الحد الأقصى للترحيل", value: "١٠ أيام", tone: "info" },
        { label: "المطلوب ترحيله", value: "٧ أيام", tone: "ok" },
        { label: "ضمن المسموح", value: "نعم ✓", tone: "ok" },
        { label: "تنفيذ تلقائي", value: "بضغطة واحدة", tone: "ok" },
      ],
      refs: ["سياسة الإجازات — المادة ٧"],
    };
  }
  return {
    question: text,
    rows: [
      { label: "حالة المحاكاة", value: "تحتاج توضيحاً", tone: "info" },
      { label: "اقتراح", value: "اختر سيناريو من الأمثلة أدناه", tone: "info" },
    ],
    refs: [],
  };
}

const toneCls = {
  info: "bg-info-soft text-info",
  warn: "bg-warning-soft text-warning",
  ok: "bg-success-soft text-success",
};

export function WhatIfSimulator({ open, onOpenChange }: Props) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<SimResult | null>(null);

  const run = (text?: string) => {
    const v = (text ?? q).trim();
    if (!v) return;
    setQ(v);
    setResult(simulate(v));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setQ(""); setResult(null); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
              <FlaskConical className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            محاكي القرارات الذكي
          </DialogTitle>
          <DialogDescription>
            جرّب سيناريو قبل اتخاذ القرار — يحسب الوكيل كل التبعات بناءً على سياسات شركتك.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="مثال: ماذا لو أخذتُ ٥ أيام بدون راتب؟"
            className="flex-1"
          />
          <Button onClick={() => run()} className="rounded-xl gap-1.5">
            <Sparkles className="h-4 w-4" /> حاكِ
          </Button>
        </div>

        {!result && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">جرّب سيناريو جاهز:</p>
            <div className="grid grid-cols-1 gap-2">
              {whatIfPresets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => run(p)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-right text-sm hover:border-primary/40 hover:bg-primary-soft/40 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="flex-1">{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-border overflow-hidden animate-fade-up">
            <div className="px-4 py-3 bg-gradient-hero border-b border-border">
              <p className="text-[11px] text-muted-foreground mb-0.5">المحاكاة</p>
              <p className="text-sm font-bold">{result.question}</p>
            </div>
            <ul className="divide-y divide-border">
              {result.rows.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                  <span className={cn("chip text-[11px]", toneCls[r.tone])}>{r.value}</span>
                </li>
              ))}
            </ul>
            {result.refs.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-secondary/30">
                <p className="text-[10px] text-muted-foreground mb-1">المراجع</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.refs.map((r, i) => (
                    <span key={i} className="chip bg-card border border-border text-[10px] text-foreground">{r}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="px-4 py-2.5 border-t border-border bg-card text-center">
              <button onClick={() => { setQ(""); setResult(null); }} className="text-xs text-primary font-medium hover:underline">
                جرّب سيناريو آخر
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
