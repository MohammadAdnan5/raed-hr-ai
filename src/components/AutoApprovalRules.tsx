import { useState } from "react";
import { Zap, Shield, Settings2, Pencil, AlertTriangle, ShieldCheck, ShieldAlert, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { autoApprovalRules, AutoRule } from "@/data/hrData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ===== Condition Builder primitives =====
type Attr =
  | "leave_days"
  | "leave_balance"
  | "remote_days_month"
  | "calendar_conflict"
  | "doc_template"
  | "field_type"
  | "amount_sar"
  | "salary_change";

type Operator = "lte" | "gte" | "eq" | "neq" | "is_true" | "is_false" | "in";

interface Clause {
  id: string;
  attr: Attr;
  op: Operator;
  value: string;
}

const ATTR_META: Record<Attr, { label: string; ops: Operator[]; valueType: "number" | "text" | "boolean" | "select"; options?: string[]; unit?: string }> = {
  leave_days:        { label: "عدد أيام الإجازة", ops: ["lte", "gte", "eq"], valueType: "number", unit: "يوم" },
  leave_balance:     { label: "رصيد الإجازة المتاح", ops: ["gte", "lte"], valueType: "number", unit: "يوم" },
  remote_days_month: { label: "أيام العمل عن بُعد/شهر", ops: ["lte", "gte"], valueType: "number", unit: "يوم" },
  calendar_conflict: { label: "تعارض في التقويم", ops: ["is_true", "is_false"], valueType: "boolean" },
  doc_template:      { label: "نوع الوثيقة", ops: ["in"], valueType: "select", options: ["خطاب تعريف", "شهادة عمل", "تأييد رسمي"] },
  field_type:        { label: "حقل البيانات الشخصية", ops: ["in"], valueType: "select", options: ["جوال", "عنوان", "حالة اجتماعية"] },
  amount_sar:        { label: "المبلغ", ops: ["lte", "gte"], valueType: "number", unit: "ريال" },
  salary_change:     { label: "تعديل على الراتب", ops: ["is_true", "is_false"], valueType: "boolean" },
};

const OP_LABEL: Record<Operator, string> = {
  lte: "≤", gte: "≥", eq: "=", neq: "≠", is_true: "نعم", is_false: "لا", in: "ضمن",
};

const SCOPE_OPTIONS = [
  "كل الموظفين",
  "كل أعضاء الفريق",
  "الفرق التقنية فقط",
  "فريق المبيعات فقط",
  "فريق التسويق فقط",
  "—",
];

function clauseToText(c: Clause): string {
  const meta = ATTR_META[c.attr];
  if (meta.valueType === "boolean") {
    return `${meta.label}: ${c.op === "is_true" ? "نعم" : "لا"}`;
  }
  const unit = meta.unit ? ` ${meta.unit}` : "";
  return `${meta.label} ${OP_LABEL[c.op]} ${c.value}${unit}`;
}

function clausesToCondition(cs: Clause[]): string {
  if (cs.length === 0) return "بدون شرط";
  return cs.map(clauseToText).join("  •  ");
}

// Best-effort parse of legacy free-text condition into a single read-only clause
function seedClauses(_condition: string): Clause[] {
  return [{ id: crypto.randomUUID(), attr: "leave_days", op: "lte", value: "2" }];
}


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
  const [clauses, setClauses] = useState<Clause[]>([]);
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
    setClauses(seedClauses(r.condition));
  };

  const closeEdit = () => {
    setEditing(null);
    setDraft(null);
    setClauses([]);
  };

  const addClause = () => {
    setClauses((cs) => [
      ...cs,
      { id: crypto.randomUUID(), attr: "leave_days", op: "lte", value: "2" },
    ]);
  };

  const updateClause = (id: string, patch: Partial<Clause>) => {
    setClauses((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...patch };
        // Reset op + value if attribute changed and op no longer valid
        if (patch.attr && patch.attr !== c.attr) {
          const meta = ATTR_META[patch.attr];
          next.op = meta.ops[0];
          next.value =
            meta.valueType === "boolean"
              ? ""
              : meta.valueType === "select"
              ? meta.options?.[0] ?? ""
              : "";
        }
        return next;
      })
    );
  };

  const removeClause = (id: string) => {
    setClauses((cs) => cs.filter((c) => c.id !== id));
  };

  const saveEdit = () => {
    if (!draft) return;
    const next: AutoRule = { ...draft, condition: clausesToCondition(clauses) };
    setRules((rs) => rs.map((r) => (r.id === next.id ? next : r)));
    toast({
      title: "تم حفظ التعديلات",
      description: `${next.name} — تم تحديث القاعدة بنجاح.`,
    });
    closeEdit();
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
      <Dialog open={!!editing} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent dir="rtl" className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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

              {/* ===== Condition Builder ===== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">الشروط</Label>
                  <span className="text-[10px] text-muted-foreground">
                    تُطبَّق جميع الشروط معاً (AND)
                  </span>
                </div>

                <div className="space-y-2">
                  {clauses.length === 0 && (
                    <p className="text-[11px] text-muted-foreground bg-secondary/50 rounded-lg p-3 text-center">
                      لا توجد شروط — أضف شرطاً ليبدأ الوكيل بالتنفيذ.
                    </p>
                  )}
                  {clauses.map((c, idx) => {
                    const meta = ATTR_META[c.attr];
                    return (
                      <div key={c.id} className="rounded-xl border border-border bg-secondary/30 p-2.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-muted-foreground font-medium num">
                            شرط {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeClause(c.id)}
                            className="h-6 w-6 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="حذف الشرط"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          {/* Attribute */}
                          <div className="col-span-12 sm:col-span-5">
                            <Select
                              value={c.attr}
                              onValueChange={(v) => updateClause(c.id, { attr: v as Attr })}
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ATTR_META) as Attr[]).map((a) => (
                                  <SelectItem key={a} value={a} className="text-xs">
                                    {ATTR_META[a].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Operator */}
                          <div className="col-span-4 sm:col-span-3">
                            <Select
                              value={c.op}
                              onValueChange={(v) => updateClause(c.id, { op: v as Operator })}
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {meta.ops.map((op) => (
                                  <SelectItem key={op} value={op} className="text-xs">
                                    {OP_LABEL[op]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Value */}
                          <div className="col-span-8 sm:col-span-4">
                            {meta.valueType === "boolean" ? (
                              <div className="h-9 px-3 rounded-md bg-card border border-input flex items-center text-[11px] text-muted-foreground">
                                {c.op === "is_true" ? "نعم" : "لا"}
                              </div>
                            ) : meta.valueType === "select" ? (
                              <Select
                                value={c.value || meta.options?.[0]}
                                onValueChange={(v) => updateClause(c.id, { value: v })}
                              >
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {meta.options?.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="text-xs">
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="relative">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  className="h-9 text-xs num pl-12"
                                  value={c.value}
                                  onChange={(e) => updateClause(c.id, { value: e.target.value })}
                                />
                                {meta.unit && (
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                                    {meta.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addClause}
                  className="w-full rounded-lg gap-1.5 h-8 text-xs border-dashed"
                >
                  <Plus className="h-3.5 w-3.5" /> أضف شرطاً
                </Button>

                {/* Live preview */}
                <div className="rounded-lg bg-primary-soft/40 border border-primary/20 px-3 py-2">
                  <p className="text-[10px] font-bold text-primary mb-0.5">معاينة القاعدة</p>
                  <p className="text-[11px] text-foreground leading-relaxed">
                    {clausesToCondition(clauses)}
                  </p>
                </div>
              </div>

              {/* ===== Scope as Select ===== */}
              <div className="space-y-1.5">
                <Label htmlFor="rule-scope" className="text-xs">النطاق</Label>
                <Select
                  value={SCOPE_OPTIONS.includes(draft.scope) ? draft.scope : SCOPE_OPTIONS[0]}
                  onValueChange={(v) => setDraft({ ...draft, scope: v })}
                >
                  <SelectTrigger id="rule-scope" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button variant="outline" onClick={closeEdit}>
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
