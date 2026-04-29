import { Calendar, FileText, BookOpen, Wallet, Inbox, FlaskConical } from "lucide-react";
import { leaveBalances, myRequests, stats, RequestStatus, employeeAgentActivity, TrackedDocument } from "@/data/hrData";
import { AgentActivityFeed } from "./AgentActivityFeed";
import { ProactivePerks } from "./ProactivePerks";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  onOpenLeave: () => void;
  onOpenDocument: () => void;
  onOpenPolicies: () => void;
  onOpenPayslip: () => void;
  onOpenTracker: () => void;
  onOpenSimulator: () => void;
  trackedDocs: TrackedDocument[];
}

export function BentoGrid({ onOpenLeave, onOpenDocument, onOpenPolicies, onOpenPayslip, onOpenTracker, onOpenSimulator, trackedDocs }: BentoGridProps) {
  const readyCount = trackedDocs.filter((d) => d.status === "ready").length;
  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(0,auto)]">
      {/* Welcome — large */}
      <div className="col-span-12 lg:col-span-8 bento-card bg-gradient-hero">
        <div className="flex flex-col h-full justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">مرحباً عبدالله 👋</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              كل ما تحتاجه من <span className="text-primary">الموارد البشرية</span>
              <br />
              في مكان واحد، بضغطة واحدة.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Stat label="متوسط وقت الرد" value={stats.responseTime} />
            <Stat label="حُلّت ذاتياً" value={stats.resolved} />
            <Stat label="طلبات مفتوحة" value={String(stats.openRequests)} />
          </div>
        </div>
      </div>

      {/* Leave balance */}
      <button
        onClick={onOpenLeave}
        className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card text-right hover:border-primary/40 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft group-hover:bg-primary transition-colors">
            <Calendar className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <span className="chip bg-success-soft text-success">رصيد متاح</span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">إجازتي السنوية</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold num">
            {leaveBalances.annual.total - leaveBalances.annual.used}
          </span>
          <span className="text-sm text-muted-foreground">
            من <span className="num">{leaveBalances.annual.total}</span> يوماً
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${((leaveBalances.annual.total - leaveBalances.annual.used) / leaveBalances.annual.total) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-primary font-medium mt-3 group-hover:underline">
          تقديم طلب إجازة ←
        </p>
      </button>

      {/* Quick actions row */}
      {/* Quick Access — unified, balanced grid */}
      <section className="col-span-12">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-foreground">وصول سريع</h3>
          <span className="text-[11px] text-muted-foreground">٥ خدمات أساسية</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <ActionCard
            icon={FileText}
            title="طلب وثيقة"
            subtitle="تعريف، شهادة، تأييد"
            onClick={onOpenDocument}
          />
          <ActionCard
            icon={Inbox}
            title="وثائقي"
            subtitle={readyCount > 0 ? `${readyCount} جاهزة للتنزيل` : "تتبّع وحمّل"}
            onClick={onOpenTracker}
            badge={readyCount > 0}
          />
          <ActionCard
            icon={BookOpen}
            title="السياسات"
            subtitle="إجابات فورية موثقة"
            onClick={onOpenPolicies}
          />
          <ActionCard
            icon={Wallet}
            title="كشف الراتب"
            subtitle="آخر شهر متاح"
            onClick={onOpenPayslip}
          />
          <ActionCard
            icon={FlaskConical}
            title="محاكي القرارات"
            subtitle="جرّب قبل أن تقرر"
            onClick={onOpenSimulator}
          />
        </div>
      </section>

      {/* Proactive Perks — surfaces unused benefits */}
      <div className="col-span-12">
        <ProactivePerks />
      </div>

      {/* Requests timeline */}
      <div className="col-span-12 lg:col-span-9 bento-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold">طلباتي الأخيرة</h3>
          <button onClick={onOpenTracker} className="text-xs text-primary font-medium hover:underline">
            عرض الكل
          </button>
        </div>
        <div className="space-y-2">
          {myRequests.map((r) => (
            <RequestRow key={r.id} req={r} />
          ))}
        </div>
      </div>

      {/* This month stat */}
      <div className="col-span-12 lg:col-span-3 bento-card bg-gradient-warm text-primary-foreground border-transparent">
        <div className="flex flex-col h-full justify-between gap-4 min-h-[200px]">
          <div>
            <p className="text-sm opacity-90 mb-1">هذا الشهر</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black num">{stats.thisMonth}</span>
              <span className="text-sm opacity-90">طلبات</span>
            </div>
          </div>
          <div>
            <p className="text-xs opacity-90 leading-relaxed">
              نفّذ الوكيل <span className="num font-bold">٩</span> طلبات تلقائياً —
              وفّر لك <span className="num font-bold">٣ ساعات</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Agent activity feed */}
      <div className="col-span-12">
        <AgentActivityFeed activities={employeeAgentActivity} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/70 backdrop-blur px-3.5 py-2 border border-border/50">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-base font-bold num">{value}</p>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  badge,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="bento-card p-4 text-right hover:border-primary/40 group flex flex-col items-start gap-3 relative h-full"
    >
      {badge && (
        <span className="absolute top-3 left-3 h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary-soft transition-colors">
        <Icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}

const statusConfig: Record<RequestStatus, { label: string; cls: string }> = {
  pending: { label: "بانتظار الموافقة", cls: "bg-warning-soft text-warning" },
  approved: { label: "تمت الموافقة", cls: "bg-success-soft text-success" },
  rejected: { label: "مرفوض", cls: "bg-destructive/10 text-destructive" },
  in_progress: { label: "قيد التنفيذ", cls: "bg-info-soft text-info" },
};

function RequestRow({ req }: { req: any }) {
  const cfg = statusConfig[req.status as RequestStatus];
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-mono text-muted-foreground shrink-0 num">
          {req.id.split("-")[1]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{req.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {req.type} · {req.date}
          </p>
        </div>
      </div>
      <span className={cn("chip shrink-0", cfg.cls)}>{cfg.label}</span>
    </div>
  );
}
