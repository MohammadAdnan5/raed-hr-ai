import { useState } from "react";
import { Zap, Shield, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { autoApprovalRules, AutoRule } from "@/data/hrData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function AutoApprovalRules() {
  const [rules, setRules] = useState<AutoRule[]>(autoApprovalRules);
  const { toast } = useToast();

  const toggle = (id: string) => {
    setRules((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const next = !r.enabled;
        toast({
          title: next ? "تم تفعيل القاعدة" : "تم تعطيل القاعدة",
          description: `${r.name} — ${next ? "سيُطبّقها الوكيل تلقائياً" : "ستُحوَّل الطلبات إليك يدوياً"}.`,
        });
        return { ...r, enabled: next };
      })
    );
  };

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalTriggered = rules.reduce((s, r) => s + r.triggeredCount, 0);

  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm shadow-coral">
              <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold">قواعد الموافقة الآلية</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                تحكّم بما يفعله الوكيل نيابةً عنك
              </p>
            </div>
          </div>
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2">
          <span className="chip bg-success-soft text-success">
            <span className="num">{activeCount}</span> قاعدة فعّالة
          </span>
          <span className="chip bg-primary-soft text-primary">
            <Zap className="h-3 w-3" />
            <span className="num">{totalTriggered}</span> تنفيذ هذا الشهر
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {rules.map((r) => (
          <div key={r.id} className="p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-bold">{r.name}</p>
                  {r.riskLevel === "medium" && (
                    <span className="chip bg-warning-soft text-warning text-[10px]">حساسية متوسطة</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.condition}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span>النطاق: <span className="text-foreground">{r.scope}</span></span>
                  {r.enabled && r.triggeredCount > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-primary font-medium">
                        نُفّذت <span className="num">{r.triggeredCount}</span> مرة
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Switch
                checked={r.enabled}
                onCheckedChange={() => toggle(r.id)}
                className={cn(r.enabled && "data-[state=checked]:bg-primary")}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-border bg-secondary/30">
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          الوكيل لا يعتمد قرارات حساسة (إجازات طويلة، استقالات، تعديلات أجور) — تبقى صلاحيتك دائماً.
        </p>
      </div>
    </div>
  );
}
