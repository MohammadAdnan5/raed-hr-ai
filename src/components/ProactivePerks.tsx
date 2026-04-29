import { useState } from "react";
import { Gift, GraduationCap, HeartPulse, CalendarDays, Shield, X, ArrowLeft } from "lucide-react";
import { unusedPerks, UnusedPerk } from "@/data/hrData";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<UnusedPerk["icon"], any> = {
  training: GraduationCap,
  wellness: HeartPulse,
  leave: CalendarDays,
  insurance: Shield,
};

export function ProactivePerks() {
  const [items, setItems] = useState(unusedPerks);
  const { toast } = useToast();

  if (items.length === 0) return null;

  const dismiss = (id: string) =>
    setItems((it) => it.filter((p) => p.id !== id));

  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
            <Gift className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold">مزايا غير مستخدمة</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              اقترحها الوكيل بناءً على ملفك ومدة عملك
            </p>
          </div>
        </div>
        <span className="chip bg-primary-soft text-primary num">{items.length}</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((p) => {
          const Icon = iconMap[p.icon];
          return (
            <div key={p.id} className="p-4 hover:bg-secondary/30 transition-colors group relative">
              <button
                onClick={() => dismiss(p.id)}
                aria-label="إغلاق"
                className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full hover:bg-secondary flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-bold">{p.title}</p>
                    {p.expiresIn && (
                      <span className="chip bg-warning-soft text-warning text-[10px]">{p.expiresIn}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
                  <button
                    onClick={() => toast({ title: "جاهز للوكيل", description: `سأبدأ بتنفيذ: ${p.cta}` })}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                  >
                    {p.cta} <ArrowLeft className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
