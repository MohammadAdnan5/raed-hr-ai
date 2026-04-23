import { useState } from "react";
import { Check, X, Calendar, FileText, Home, Clock } from "lucide-react";
import { pendingApprovals, HRRequest } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

  return (
    <div className="space-y-4">
      {/* Manager hero */}
      <div className="bento-card bg-gradient-hero">
        <p className="text-sm text-muted-foreground mb-1">صباح الخير، م. عبدالله</p>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
          لديك <span className="text-primary num">{requests.length}</span> طلبات بانتظار قرارك
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          جمعتُ كل المعلومات اللازمة لكل طلب — اعتمد بضغطة واحدة.
        </p>
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

      {/* Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InsightCard label="موافقات هذا الأسبوع" value="١٢" delta="+٣" />
        <InsightCard label="متوسط وقت القرار" value="١.٢ س" delta="−٤٠٪" positive />
        <InsightCard label="طلبات الفريق" value="٢٤" delta="+٦" />
        <InsightCard label="رضا الفريق" value="٤.٨" delta="+٠.٢" positive />
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
