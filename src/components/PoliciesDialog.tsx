import { useState, useMemo } from "react";
import { BookOpen, Search, Sparkles, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { policiesLibrary, PolicyDoc } from "@/data/hrData";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function PoliciesDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PolicyDoc | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return policiesLibrary;
    const q = query.toLowerCase();
    return policiesLibrary.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.articles.some((a) => a.text.toLowerCase().includes(q))
    );
  }, [query]);

  const handleClose = (o: boolean) => {
    if (!o) {
      setTimeout(() => {
        setActive(null);
        setQuery("");
      }, 200);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-right">
              <DialogTitle className="text-right">السياسات والأنظمة</DialogTitle>
              <DialogDescription className="text-right">
                {active ? active.category : "ابحث في سياسات شركتك — مرجع الوكيل الرسمي"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!active ? (
          <>
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث: إجازة، تأمين، عمل عن بُعد..."
                  className="rounded-xl h-11 pr-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  لا توجد نتائج لـ "{query}"
                </div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p)}
                    className="w-full text-right rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary-soft/30 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="chip bg-secondary text-muted-foreground text-[10px]">{p.category}</span>
                      <span className="text-[10px] text-muted-foreground">{p.updatedAt}</span>
                    </div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.summary}</p>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="px-6 py-3 border-b border-border">
              <button
                onClick={() => setActive(null)}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                رجوع للسياسات
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold">{active.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{active.summary}</p>
              </div>
              <div className="space-y-3">
                {active.articles.map((a, i) => (
                  <div key={i} className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-[11px] font-bold text-primary mb-1.5">{a.ref}</p>
                    <p className="text-sm leading-relaxed">{a.text}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  يستند الوكيل إلى هذه السياسة عند الإجابة على أي سؤال يخص "{active.category}".
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
