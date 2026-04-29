import { Sparkles, CheckCircle2, BookOpen, CalendarClock, FileSignature, Eye } from "lucide-react";
import { AgentActivity, AgentActivityType } from "@/data/hrData";

const iconMap: Record<AgentActivityType, any> = {
  auto_resolved: CheckCircle2,
  policy_check: BookOpen,
  scheduled: CalendarClock,
  drafted: FileSignature,
  monitored: Eye,
};

const labelMap: Record<AgentActivityType, string> = {
  auto_resolved: "أُنجز تلقائياً",
  policy_check: "تذكير ذكي",
  scheduled: "تنسيق",
  drafted: "مسوّدة جاهزة",
  monitored: "رصد استباقي",
};

interface Props {
  activities: AgentActivity[];
  title?: string;
  className?: string;
}

export function AgentActivityFeed({ activities, title = "ماذا فعل وكيلك اليوم", className }: Props) {
  return (
    <div dir="rtl" className={`bento-card text-right ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h3 className="text-base font-bold">{title}</h3>
        </div>
        <span className="chip bg-primary-soft text-primary">
          <span className="num">{activities.length}</span> إجراء
        </span>
      </div>

      <ol className="relative space-y-4">
        {/* Timeline rail — anchored to RTL right edge, aligned to icon center (24px / 2) */}
        <div className="absolute right-[11px] top-1 bottom-1 w-px bg-border" aria-hidden />

        {activities.map((a) => {
          const Icon = iconMap[a.type];
          return (
            <li key={a.id} className="relative flex gap-3 animate-fade-up">
              <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft border-2 border-background">
                <Icon className="h-3 w-3 text-primary" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-start justify-between gap-3 mb-0.5">
                  <p className="text-sm font-semibold leading-tight text-right flex-1 min-w-0">{a.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0 num" dir="ltr">{a.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed text-right">{a.detail}</p>
                <span className="inline-block mt-1.5 text-[10px] font-medium text-primary">
                  {labelMap[a.type]}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
