import { Info, Sparkles, CheckCircle2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  reasoning: string[];
  recommendation?: "approve" | "review" | "reject";
}

const recLabel = {
  approve: "اعتماد",
  review: "مراجعة بشرية",
  reject: "رفض",
};

export function ExplainAIPopover({ reasoning, recommendation }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[11px] text-primary font-medium hover:underline">
          <Info className="h-3 w-3" />
          كيف اتخذ الوكيل هذا القرار؟
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-80 p-0 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-hero border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold">سلسلة استدلال الوكيل</p>
              <p className="text-[10px] text-muted-foreground">قابلة للتدقيق · شفافة بالكامل</p>
            </div>
          </div>
        </div>
        <ol className="p-4 space-y-2.5">
          {reasoning.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-success" strokeWidth={2.5} />
              </span>
              <p className="text-xs text-foreground leading-relaxed flex-1">{step}</p>
            </li>
          ))}
        </ol>
        {recommendation && (
          <div className="px-4 py-3 border-t border-border bg-secondary/40">
            <p className="text-[11px] text-muted-foreground">التوصية النهائية:</p>
            <p className="text-sm font-bold text-primary">{recLabel[recommendation]}</p>
          </div>
        )}
        <div className="px-4 py-2.5 border-t border-border bg-card">
          <p className="text-[10px] text-muted-foreground text-center">
            الوكيل لا يُخفي أي خطوة — كل قراراته قابلة للمراجعة والاعتراض.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
