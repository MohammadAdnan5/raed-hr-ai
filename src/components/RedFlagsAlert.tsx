import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, MessageSquare, Calendar } from "lucide-react";
import { redFlags } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function RedFlagsAlert() {
  // Collapsed by default — surface count, hide details until manager opts in
  const [open, setOpen] = useState(false);
  const [items] = useState(redFlags);
  const { toast } = useToast();

  if (items.length === 0) return null;

  const critical = items.filter((i) => i.severity === "critical").length;

  return (
    <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-destructive/10 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive shrink-0 animate-pulse-soft">
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" strokeWidth={2.5} />
          </div>
          <div className="text-right min-w-0">
            <p className="text-sm font-bold text-destructive">حالات حساسة تتطلب تدخلك الطارئ</p>
            <p className="text-[11px] text-muted-foreground">
              <span className="num">{items.length}</span> حالة — منها <span className="num font-bold text-destructive">{critical}</span> حرجة
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-destructive" /> : <ChevronDown className="h-4 w-4 text-destructive" />}
      </button>

      {open && (
        <div className="divide-y divide-destructive/15 border-t border-destructive/15 animate-fade-up">
          {items.map((f) => (
            <div key={f.id} className="p-4 bg-card/60">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-2 w-2 rounded-full shrink-0 mt-2",
                  f.severity === "critical" ? "bg-destructive" : "bg-warning"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn(
                      "chip text-[10px]",
                      f.severity === "critical" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"
                    )}>
                      {f.severity === "critical" ? "حرج" : "عاجل"}
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
                  <div className="flex items-center justify-between gap-2 mt-3">
                    <span className="text-[11px] text-muted-foreground">{f.detected}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({ title: "فُتحت محادثة خاصة", description: `سيُشعَر ${f.who} بطلب جلسة سرية.` })}
                        className="rounded-full h-8 gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> تواصل خاص
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => toast({ title: "تمت جدولة الاجتماع", description: `سينسّق الوكيل موعداً عاجلاً مع ${f.who}.` })}
                        className="rounded-full h-8 gap-1.5 bg-destructive hover:bg-destructive/90"
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
  );
}
