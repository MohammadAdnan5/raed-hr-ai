import { useState } from "react";
import { Check, X, Calendar, FileText, Home, Clock, Sparkles, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { pendingApprovals, HRRequest, managerAgentActivity } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AgentActivityFeed } from "./AgentActivityFeed";
import { cn } from "@/lib/utils";

const typeIcon = (type: string) => {
  if (type.includes("إجازة")) return Calendar;
  if (type.includes("بُعد") || type.includes("بعد")) return Home;
  if (type.includes("وثيقة")) return FileText;
  return Clock;
};

export function ManagerView() {
  const [requests, setRequests] = useState<HRRequest[]>(pendingApprovals);
  const { toast } = useToast();

  const handleAction = (id: string, action: "approve" | "reject") => {
    setRequests((r) => r.filter((x) => x.id !== id));
    toast({
      title: action === "approve" ? "تمت الموافقة" : "تم الرفض",
      description: `الطلب ${id} — تم إشعار الموظف.`,
    });
  };

  const handleBulkAutoApprove = () => {
    const safe = requests.filter((r) => r.aiRecommendation === "approve");
    setRequests((r) => r.filter((x) => x.aiRecommendation !== "approve"));
    toast({
      title: "نفّذ الوكيل المهمة",
      description: `اعتمدتُ ${safe.length} طلبات بناءً على توصياتي وأشعرتُ الموظفين.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Manager hero */}
      <div className="bento-card bg-gradient-hero">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <p className="text-sm text-muted-foreground mb-1">صباح الخير، م. عبدالله</p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
              لديك <span className="text-primary num">{requests.length}</span> طلبات بانتظار قرارك
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              راجعتُ كل طلب، طبّقتُ السياسات، وأعطيتُ توصيتي — اعتمد بضغطة واحدة.
            </p>
          </div>
          {requests.filter((r) => r.aiRecommendation === "approve").length > 0 && (
            <Button
              onClick={handleBulkAutoApprove}
              className="rounded-full gap-2 bg-gradient-warm hover:opacity-90 shadow-coral text-primary-foreground"
            >
              <Zap className="h-4 w-4" />
              اعتمد الآمنة دفعة واحدة
            </Button>
          )}
        </div>
      </div>

      {/* Pending list */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold">الموافقات المعلقة</h3>
          <span className="chip bg-warning-soft text-warning">
            <span className="num">{requests.length}</span> طلب
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
              <Check className="h-7 w-7 text-success" strokeWidth={3} />
            </div>
            <p className="text-sm font-semibold">أنجزتَ كل شيء!</p>
            <p className="text-xs text-muted-foreground">لا توجد طلبات معلقة حالياً.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {requests.map((req) => (
              <ApprovalCard
                key={req.id}
                req={req}
                onApprove={() => handleAction(req.id, "approve")}
                onReject={() => handleAction(req.id, "reject")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Agent activity for manager */}
      <AgentActivityFeed activities={managerAgentActivity} />

      {/* Insights */}
      <div className="grid grid-cols-2 gap-3">
        <InsightCard label="موافقات هذا الأسبوع" value="١٢" delta="+٣" />
        <InsightCard label="طلبات الفريق" value="٢٤" delta="+٦" />
      </div>
    </div>
  );
}

function ApprovalCard({
  req,
  onApprove,
  onReject,
}: {
  req: HRRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const Icon = typeIcon(req.type);
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="p-5 hover:bg-secondary/30 transition-colors animate-fade-up">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{req.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req.requester} · {req.requesterRole}
              </p>
            </div>
            <span className="chip bg-secondary text-muted-foreground shrink-0 num">
              {req.id.split("-")[1]}
            </span>
          </div>

          {req.details && (
            <div className="mt-2.5 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-foreground">
              {req.details}
            </div>
          )}

          {/* AI Summary & Recommendation */}
          {req.aiSummary && (
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary-soft/40 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-warm shadow-coral shrink-0">
                  <Sparkles className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[11px] font-bold text-primary">ملخص الوكيل</p>
                    {req.aiRecommendation === "approve" && (
                      <span className="chip bg-success-soft text-success py-0 text-[10px]">
                        يوصى بالاعتماد
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{req.aiSummary}</p>
                </div>
              </div>

              {req.aiReasoning && (
                <>
                  <button
                    onClick={() => setShowReasoning((v) => !v)}
                    className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline mr-8"
                  >
                    {showReasoning ? (
                      <>
                        <ChevronUp className="h-3 w-3" /> إخفاء خطوات التحقق
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" /> عرض خطوات التحقق ({req.aiReasoning.length})
                      </>
                    )}
                  </button>
                  {showReasoning && (
                    <ul className="mr-8 space-y-1 pt-1 animate-fade-up">
                      {req.aiReasoning.map((step, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{req.date}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="rounded-full h-8 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                رفض
              </Button>
              <Button
                size="sm"
                onClick={onApprove}
                className="rounded-full h-8 gap-1.5 bg-primary hover:bg-primary-hover"
              >
                <Check className="h-3.5 w-3.5" />
                موافقة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="bento-card">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold num">{value}</span>
        <span
          className={cn(
            "text-xs font-medium num",
            positive ? "text-success" : "text-muted-foreground"
          )}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}
