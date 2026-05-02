import { useState } from "react";
import { Check, X, Calendar, FileText, Home, Clock, Sparkles, Zap, LayoutDashboard, BarChart3, Shield } from "lucide-react";
import { pendingApprovals, HRRequest, managerAgentActivity } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AgentActivityFeed } from "./AgentActivityFeed";
import { AutoApprovalRules } from "./AutoApprovalRules";
import { ROITracker } from "./ROITracker";
import { SentimentRadar } from "./SentimentRadar";
import { RedFlagsAlert } from "./RedFlagsAlert";
import { ExplainAIPopover } from "./ExplainAIPopover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const pendingCount = requests.length;
  const safeCount = requests.filter((r) => r.aiRecommendation === "approve").length;
  const reviewCount = requests.filter((r) => r.aiRecommendation === "review").length;

  return (
    <div className="space-y-4">
      {/* 🚨 Always-on top: Red Flags */}
      <RedFlagsAlert />

      {/* Tabbed shell — keeps surface clean */}
      <Tabs defaultValue="overview" dir="rtl" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full bg-secondary/60 rounded-xl p-1 h-auto gap-1">
          <TabsTrigger value="overview" className="rounded-lg gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <LayoutDashboard className="h-3.5 w-3.5" /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <BarChart3 className="h-3.5 w-3.5" /> تحليلات وأثر
          </TabsTrigger>
          <TabsTrigger value="governance" className="rounded-lg gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Shield className="h-3.5 w-3.5" /> الحوكمة
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW: integrated hero + pending list + agent activity */}
        <TabsContent value="overview" className="space-y-4 m-0">
          {/* Integrated header: hero merges directly into the approvals card */}
          <div className="bento-card p-0 overflow-hidden">
            <div className="px-5 md:px-6 py-5 bg-gradient-hero border-b border-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <p className="text-xs text-muted-foreground mb-1">صباح الخير، م. عبدالله</p>
                  <h2 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
                    لديك <span className="text-primary num">{pendingCount}</span> طلبات بانتظار قرارك
                  </h2>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    {safeCount > 0 && (
                      <span className="chip bg-success-soft text-success">
                        <Check className="h-3 w-3" />
                        <span className="num">{safeCount}</span> آمن للاعتماد
                      </span>
                    )}
                    {reviewCount > 0 && (
                      <span className="chip bg-warning-soft text-warning">
                        <span className="num">{reviewCount}</span> يحتاج مراجعتك
                      </span>
                    )}
                  </div>
                </div>
                {safeCount > 0 && (
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
          <AgentActivityFeed activities={managerAgentActivity} />
        </TabsContent>

        {/* ANALYTICS: ROI + Sentiment + contextual KPIs */}
        <TabsContent value="analytics" className="space-y-4 m-0">
          <ROITracker />
          <SentimentRadar />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InsightCard
              label="معدل الموافقة الأسبوعي"
              value="١٢"
              unit="طلب / ٤٢ مستلم"
              delta="+٣ عن الأسبوع الماضي"
              hint="نسبة موافقتك ٨٦٪ — أعلى من متوسط الشركة (٧٤٪)."
              positive
            />
            <InsightCard
              label="حِمل طلبات الفريق"
              value="٢٤"
              unit="طلب نشط هذا الشهر"
              delta="+٦ عن الشهر الماضي"
              hint="٣ موظفين يمثّلون ٦٠٪ من الطلبات — قد يستحقون متابعة."
            />
          </div>
        </TabsContent>

        {/* GOVERNANCE: rules */}
        <TabsContent value="governance" className="space-y-4 m-0">
          <AutoApprovalRules />
        </TabsContent>
      </Tabs>
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

          {req.aiSummary && (
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary-soft/40 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-warm shadow-coral shrink-0">
                  <Sparkles className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <p className="text-[11px] font-bold text-primary">ملخص الوكيل</p>
                    {req.aiRecommendation === "approve" && (
                      <span className="chip bg-success-soft text-success py-0 text-[10px]">
                        يوصى بالاعتماد
                      </span>
                    )}
                    {req.aiRecommendation === "review" && (
                      <span className="chip bg-warning-soft text-warning py-0 text-[10px]">
                        يحتاج مراجعتك
                      </span>
                    )}
                    {req.aiRecommendation === "reject" && (
                      <span className="chip bg-destructive/10 text-destructive py-0 text-[10px]">
                        يوصى بالرفض
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{req.aiSummary}</p>
                </div>
              </div>

              {req.aiReasoning && (
                <div className="mr-8 pt-1">
                  <ExplainAIPopover reasoning={req.aiReasoning} recommendation={req.aiRecommendation} />
                </div>
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
  unit,
  delta,
  hint,
  positive,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <div className="bento-card">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-bold num">{value}</span>
        {unit && <span className="text-[11px] text-muted-foreground">{unit}</span>}
      </div>
      <p
        className={cn(
          "text-[11px] font-medium num mt-1",
          positive ? "text-success" : "text-muted-foreground"
        )}
      >
        {delta}
      </p>
      {hint && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-border">
          {hint}
        </p>
      )}
    </div>
  );
}
