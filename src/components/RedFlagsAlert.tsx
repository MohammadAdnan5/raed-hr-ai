import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, MessageSquare, Calendar, Siren } from "lucide-react";
import { redFlags } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function RedFlagsAlert() {
  const [open, setOpen] = useState(false);
  const [items] = useState(redFlags);
  const { toast } = useToast();

  if (items.length === 0) return null;

  const critical = items.filter((i) => i.severity === "critical").length;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_-8px_hsl(var(--destructive)/0.45)] ring-2 ring-destructive/60 ring-offset-2 ring-offset-background animate-fade-up">
      {/* Right-edge urgency bar (RTL) */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-destructive" />
      {/* Faint gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-l from-destructive/15 via-destructive/5 to-transparent pointer-events-none" />

      <div className="relative bg-card/95 backdrop-blur-sm">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-destructive/5 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <span className="absolute inset-0 rounded-2xl bg-destructive/40 animate-ping" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive shadow-lg">
                <Siren className="h-5 w-5 text-destructive-foreground" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-right min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="chip bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wide uppercase">
                  تنبيه عاجل
                </span>
                <p className="text-base font-black text-destructive leading-tight">
                  حالات حساسة تتطلب تدخلك الطارئ
                </p>
              </div>
              <p className="text-xs text-foreground/80 mt-1">
                <span className="num font-bold">{items.length}</span> حالة بانتظارك —
                {" "}
                <span className="num font-black text-destructive">{critical}</span> منها حرجة لا تحتمل التأجيل.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex chip bg-destructive/10 text-destructive text-[10px] font-bold">
              {open ? "إخفاء" : "عرض الحالات"}
            </span>
            {open ? (
              <ChevronUp className="h-5 w-5 text-destructive" />
            ) : (
              <ChevronDown className="h-5 w-5 text-destructive" />
            )}
          </div>
        </button>

        {open && (
          <div className="divide-y divide-destructive/15 border-t-2 border-destructive/30 animate-fade-up">
            {items.map((f) => (
              <div key={f.id} className="p-4 bg-card">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0 mt-2 ring-4",
                      f.severity === "critical"
                        ? "bg-destructive ring-destructive/20"
                        : "bg-warning ring-warning/20"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={cn(
                          "chip text-[10px] font-bold",
                          f.severity === "critical"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-warning text-warning-foreground"
                        )}
                      >
                        {f.severity === "critical" ? (
                          <>
                            <AlertTriangle className="h-3 w-3" /> حرج
                          </>
                        ) : (
                          "عاجل"
                        )}
                      </span>
                      <span className="chip bg-secondary text-foreground text-[10px]">{f.category}</span>
                      <p className="text-sm font-bold">{f.who}</p>
                      <span className="text-[11px] text-muted-foreground">· {f.team}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed mt-1">{f.summary}</p>
                    <div className="mt-2.5 rounded-lg bg-primary-soft/60 border border-primary/20 px-3 py-2">
                      <p className="text-[11px] font-bold text-primary mb-0.5">إجراء مقترح من الوكيل</p>
                      <p className="text-xs text-foreground">{f.suggestedAction}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                      <span className="text-[11px] text-muted-foreground">{f.detected}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast({
                              title: "فُتحت محادثة خاصة",
                              description: `سيُشعَر ${f.who} بطلب جلسة سرية.`,
                            })
                          }
                          className="rounded-full h-8 gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> تواصل خاص
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            toast({
                              title: "تمت جدولة الاجتماع",
                              description: `سينسّق الوكيل موعداً عاجلاً مع ${f.who}.`,
                            })
                          }
                          className="rounded-full h-8 gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          <Calendar className="h-3.5 w-3.5" /> جدولة عاجلة
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
