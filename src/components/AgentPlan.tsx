import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { AgentPlan as TPlan, AgentStep } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentPlanCardProps {
  plan: TPlan;
  onApprove: () => void;
  onCancel: () => void;
}

export function AgentPlanCard({ plan, onApprove, onCancel }: AgentPlanCardProps) {
  const [steps, setSteps] = useState<AgentStep[]>(plan.steps);

  // Auto-advance the "active" step after a short delay to feel alive
  useEffect(() => {
    const activeIdx = steps.findIndex((s) => s.status === "active");
    if (activeIdx === -1) return;
    const t = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i < activeIdx) return s;
          if (i === activeIdx) return { ...s, status: "done" };
          if (i === activeIdx + 1 && s.status === "pending") return { ...s, status: "active" };
          return s;
        })
      );
    }, 1400);
    return () => clearTimeout(t);
  }, [steps]);

  const needsApproval = steps.some((s) => s.status === "needs_approval");

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-hero p-4 space-y-3 animate-fade-up">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral shrink-0">
          <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground">خطة الوكيل الذكي</p>
          <p className="text-sm font-bold leading-tight">{plan.goal}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{plan.context}</p>
        </div>
      </div>

      <ol className="space-y-2 pr-1">
        {steps.map((s, i) => (
          <StepRow key={s.id} step={s} index={i + 1} />
        ))}
      </ol>

      {needsApproval && (
        <div className="rounded-xl bg-warning-soft border border-warning/30 p-3 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-foreground leading-relaxed">
            توقّفتُ هنا لأن هذه الخطوة تحتاج تأكيدك — لن أنفّذ أي إجراء حساس دون موافقتك.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="rounded-full h-8 gap-1 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          إيقاف
        </Button>
        {needsApproval && (
          <Button
            size="sm"
            onClick={onApprove}
            className="rounded-full h-8 gap-1.5 bg-primary hover:bg-primary-hover text-xs flex-1"
          >
            <Check className="h-3.5 w-3.5" />
            اعتمد ونفّذ الخطوات المتبقية
          </Button>
        )}
      </div>
    </div>
  );
}

function StepRow({ step, index }: { step: AgentStep; index: number }) {
  const isDone = step.status === "done";
  const isActive = step.status === "active";
  const isApproval = step.status === "needs_approval";

  return (
    <li className="flex items-start gap-3">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0 transition-colors num",
          isDone && "bg-success text-success-foreground",
          isActive && "bg-primary text-primary-foreground",
          isApproval && "bg-warning text-warning-foreground",
          !isDone && !isActive && !isApproval && "bg-secondary text-muted-foreground"
        )}
      >
        {isDone ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : isActive ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          index
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={cn(
            "text-xs leading-relaxed",
            isDone && "text-muted-foreground line-through decoration-1",
            (isActive || isApproval) && "text-foreground font-medium",
            step.status === "pending" && "text-muted-foreground"
          )}
        >
          {step.label}
        </p>
        {step.detail && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>
        )}
      </div>
    </li>
  );
}
