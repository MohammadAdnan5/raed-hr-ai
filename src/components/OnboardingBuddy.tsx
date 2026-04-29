import { useState } from "react";
import { GraduationCap, ChevronDown, ChevronUp, CheckCircle2, Circle, BookOpen, Users, Wrench, Sparkles } from "lucide-react";
import { onboardingProgress, onboardingTasks, OnboardingTask } from "@/data/hrData";
import { cn } from "@/lib/utils";

const catIcon: Record<OnboardingTask["category"], any> = {
  policy: BookOpen,
  social: Users,
  setup: Wrench,
  training: GraduationCap,
};
const catLabel: Record<OnboardingTask["category"], string> = {
  policy: "سياسة",
  social: "تعارف",
  setup: "إعداد",
  training: "تدريب",
};

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
}

export function OnboardingBuddy({ enabled, onToggle }: Props) {
  // Collapsed by default to reduce cognitive overload on first load
  const [open, setOpen] = useState(false);
  if (!enabled) return null;

  const pct = Math.round((onboardingProgress.completed / onboardingProgress.total) * 100);
  const todayTasks = onboardingTasks.filter((t) => !t.done && t.day <= onboardingProgress.day + 2);

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-gradient-hero overflow-hidden animate-fade-up">
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-warm shadow-coral shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold">رفيق الموظف الجديد</p>
              <span className="chip bg-primary text-primary-foreground text-[10px] num">
                اليوم {onboardingProgress.day} / {onboardingProgress.totalDays}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              مرحباً بك! أرشدك خطوة بخطوة خلال أول ٩٠ يوم — بدون ضغط.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggle(false)}
            className="text-[11px] text-muted-foreground hover:text-foreground"
            aria-label="إخفاء"
          >
            إخفاء
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="h-8 w-8 rounded-full hover:bg-card flex items-center justify-center"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-muted-foreground">تقدّمك</span>
          <span className="font-bold num">{onboardingProgress.completed} / {onboardingProgress.total} مهمة</span>
        </div>
        <div className="h-2 rounded-full bg-card overflow-hidden">
          <div className="h-full bg-gradient-warm transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {open && (
        <div className="bg-card border-t border-primary/15 divide-y divide-border">
          <div className="px-5 py-3">
            <p className="text-[11px] font-bold text-primary mb-2">مهام هذا الأسبوع</p>
            <ul className="space-y-2">
              {todayTasks.length === 0 && (
                <li className="text-xs text-muted-foreground">لا توجد مهام عاجلة — أحسنت! 🎉</li>
              )}
              {todayTasks.map((t) => {
                const Icon = catIcon[t.category];
                return (
                  <li key={t.id} className="flex items-start gap-2.5 rounded-xl border border-border p-3 hover:border-primary/40 transition-colors">
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{t.title}</p>
                        <span className="chip bg-secondary text-muted-foreground text-[10px] gap-1">
                          <Icon className="h-3 w-3" /> {catLabel[t.category]}
                        </span>
                        <span className="text-[10px] text-muted-foreground num">اليوم {t.day}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <details className="px-5 py-3 group">
            <summary className="text-[11px] font-bold text-primary cursor-pointer list-none flex items-center justify-between">
              <span>كل مسار الـ ٩٠ يوماً</span>
              <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180 transition-transform" />
            </summary>
            <ol className="mt-3 space-y-1.5">
              {onboardingTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-xs">
                  {t.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn("text-[10px] text-muted-foreground num shrink-0 w-10")}>يوم {t.day}</span>
                  <span className={cn("flex-1 truncate", t.done && "line-through text-muted-foreground")}>{t.title}</span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      )}
    </div>
  );
}
