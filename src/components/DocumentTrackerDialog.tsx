import { useState } from "react";
import { FileText, Check, Download, Clock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrackedDocument } from "@/data/hrData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  docs: TrackedDocument[];
}

const statusChip: Record<TrackedDocument["status"], { label: string; cls: string }> = {
  processing: { label: "قيد التنفيذ", cls: "bg-info-soft text-info" },
  ready: { label: "جاهز للتنزيل", cls: "bg-success-soft text-success" },
  delivered: { label: "تم التسليم", cls: "bg-secondary text-muted-foreground" },
};

export function DocumentTrackerDialog({ open, onOpenChange, docs }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();
  const selected = docs.find((d) => d.id === selectedId) ?? null;

  const handleDownload = (d: TrackedDocument) => {
    toast({
      title: "تم تنزيل الوثيقة",
      description: `${d.type} — موقّعة رقمياً ومختومة.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setSelectedId(null); }}>
      <DialogContent className="sm:max-w-[540px] rounded-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-right">
              <DialogTitle className="text-right">وثائقي</DialogTitle>
              <DialogDescription className="text-right">
                تتبّع الطلبات وحمّل الجاهزة منها
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!selected ? (
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-2">
            {docs.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">لا توجد وثائق بعد</div>
            ) : (
              docs.map((d) => {
                const cfg = statusChip[d.status];
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className="w-full text-right rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary-soft/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{d.type}</p>
                        {d.recipient && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">إلى: {d.recipient}</p>
                        )}
                      </div>
                      <span className={cn("chip shrink-0", cfg.cls)}>{cfg.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 num">{d.id} · {d.requestedAt}</p>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="px-6 py-3 border-b border-border">
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-primary font-medium hover:underline"
              >
                ← رجوع للقائمة
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold">{selected.type}</h3>
                  <span className={cn("chip", statusChip[selected.status].cls)}>
                    {statusChip[selected.status].label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground num">{selected.id} · {selected.requestedAt}</p>
                {selected.recipient && (
                  <p className="text-xs text-muted-foreground mt-0.5">إلى: {selected.recipient}</p>
                )}
              </div>

              {/* Steps timeline */}
              <ol className="relative space-y-3 pr-5">
                <div className="absolute right-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />
                {selected.steps.map((s, i) => (
                  <li key={i} className="relative flex items-start gap-3">
                    <div
                      className={cn(
                        "absolute -right-[1px] top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
                        s.done ? "bg-success" : "bg-secondary"
                      )}
                    >
                      {s.done ? (
                        <Check className="h-2.5 w-2.5 text-success-foreground" strokeWidth={4} />
                      ) : (
                        <Clock className="h-2 w-2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 pr-3">
                      <span className={cn("text-sm", s.done ? "font-medium" : "text-muted-foreground")}>
                        {s.label}
                      </span>
                      {s.time && <span className="text-[10px] text-muted-foreground num">{s.time}</span>}
                    </div>
                  </li>
                ))}
              </ol>

              {selected.status !== "processing" && (
                <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-3 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    أنجز الوكيل هذا الطلب تلقائياً وفق قاعدة "الوثائق القياسية".
                  </p>
                </div>
              )}

              {selected.status === "ready" && (
                <Button
                  onClick={() => handleDownload(selected)}
                  className="w-full rounded-xl h-11 bg-primary hover:bg-primary-hover gap-2"
                >
                  <Download className="h-4 w-4" /> تنزيل الوثيقة (PDF)
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
