import { useState } from "react";
import { Zap, Shield, Settings2, Pencil, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { autoApprovalRules, AutoRule } from "@/data/hrData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Risk = AutoRule["riskLevel"];

const RISK_META: Record<Risk, { label: string; chip: string; icon: any; desc: string }> = {
  low: {
    label: "حساسية منخفضة",
    chip: "bg-success-soft text-success",
    icon: ShieldCheck,
    desc: "قرار روتيني — أثر محدود في حال الخطأ.",
  },
  medium: {
    label: "حساسية متوسطة",
    chip: "bg-warning-soft text-warning",
    icon: ShieldAlert,
    desc: "يستحسن مراجعة دورية للنتائج.",
  },
  high: {
    label: "حساسية عالية",
    chip: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
    desc: "أثر مالي أو تنظيمي مباشر — يُفضّل بقاؤها يدوية.",
  },
};

export function AutoApprovalRules() {
  const [rules, setRules] = useState<AutoRule[]>(autoApprovalRules);
  const [editing, setEditing] = useState<AutoRule | null>(null);
  const [draft, setDraft] = useState<AutoRule | null>(null);
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

  const openEdit = (r: AutoRule) => {
    setEditing(r);
    setDraft({ ...r });
  };

  const saveEdit = () => {
    if (!draft) return;
    setRules((rs) => rs.map((r) => (r.id === draft.id ? draft : r)));
    toast({
      title: "تم حفظ التعديلات",
      description: `${draft.name} — تم تحديث القاعدة بنجاح.`,
    });
    setEditing(null);
    setDraft(null);
  };

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalTriggered = rules.reduce((s, r) => s + r.triggeredCount, 0);

  return (
    <>
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
          <div className="flex gap-2 flex-wrap">
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
          {rules.map((r) => {
            const meta = RISK_META[r.riskLevel];
            const RiskIcon = meta.icon;
            return (
              <div key={r.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold">{r.name}</p>
                      <span className={cn("chip text-[10px] gap-1", meta.chip)}>
                        <RiskIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.condition}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
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
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(r)}
                      className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`تعديل ${r.name}`}
                      title="تعديل القاعدة"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={() => toggle(r.id)}
                      className={cn(r.enabled && "data-[state=checked]:bg-primary")}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border bg-secondary/30">
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            الوكيل لا يعتمد قرارات حساسة (إجازات طويلة، استقالات، تعديلات أجور) — تبقى صلاحيتك دائماً.
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && (setEditing(null), setDraft(null))}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>تعديل القاعدة</DialogTitle>
            <DialogDescription>
              عدّل سلوك الوكيل لهذه القاعدة. تطبّق التغييرات فوراً.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="rule-name" className="text-xs">اسم القاعدة</Label>
                <Input
                  id="rule-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rule-cond" className="text-xs">الشرط</Label>
                <Textarea
                  id="rule-cond"
                  rows={2}
                  value={draft.condition}
                  onChange={(e) => setDraft({ ...draft, condition: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rule-scope" className="text-xs">النطاق</Label>
                <Input
                  id="rule-scope"
                  value={draft.scope}
                  onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">مستوى الحساسية</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as Risk[]).map((lvl) => {
                    const m = RISK_META[lvl];
                    const Icon = m.icon;
                    const active = draft.riskLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraft({ ...draft, riskLevel: lvl })}
                        className={cn(
                          "rounded-xl border p-2.5 text-right transition-all",
                          active
                            ? "border-primary bg-primary-soft/40 shadow-sm"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className={cn("inline-flex items-center gap-1 chip text-[10px]", m.chip)}>
                          <Icon className="h-3 w-3" />
                          {m.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground pt-0.5">
                  {RISK_META[draft.riskLevel].desc}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold">الحالة</p>
                  <p className="text-[11px] text-muted-foreground">
                    {draft.enabled ? "مفعّلة — يطبّقها الوكيل تلقائياً" : "معطّلة — تتطلّب قراراً يدوياً"}
                  </p>
                </div>
                <Switch
                  checked={draft.enabled}
                  onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => (setEditing(null), setDraft(null))}>
              إلغاء
            </Button>
            <Button onClick={saveEdit} className="bg-primary hover:bg-primary-hover">
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
