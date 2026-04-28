import { useState } from "react";
import { Wallet, Download, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { payslips, Payslip } from "@/data/hrData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n);

export function PayslipDialog({ open, onOpenChange }: Props) {
  const [active, setActive] = useState<Payslip>(payslips[0]);
  const { toast } = useToast();

  const totalEarnings = active.basic + active.housing + active.transport + (active.bonus ?? 0);
  const totalDeductions = active.gosi + active.tax;

  const handleDownload = () => {
    toast({
      title: "تم تجهيز الكشف",
      description: `كشف ${active.month} ${active.year} — وقّعه الوكيل رقمياً وأرسله لبريدك.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-right">
              <DialogTitle className="text-right">كشف الراتب</DialogTitle>
              <DialogDescription className="text-right">
                آخر <span className="num">{payslips.length}</span> أشهر
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Month chips */}
          <div className="flex gap-2 overflow-x-auto px-6 pt-4 pb-2">
            {payslips.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                  active.id === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/40"
                )}
              >
                {p.month} {p.year}
              </button>
            ))}
          </div>

          {/* Net hero */}
          <div className="m-6 rounded-2xl bg-gradient-warm p-5 text-primary-foreground">
            <p className="text-xs opacity-90">الصافي المستلم</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black num">{fmt(active.net)}</span>
              <span className="text-sm opacity-90">ريال</span>
            </div>
            <p className="text-xs opacity-90 mt-2 flex items-center gap-1">
              <Check className="h-3 w-3" /> تم الإيداع · {active.payDate}
            </p>
          </div>

          {/* Breakdown */}
          <div className="px-6 pb-2 space-y-3">
            <div>
              <p className="text-[11px] font-bold text-success uppercase tracking-wide mb-2">المستحقات</p>
              <div className="rounded-xl border border-border divide-y divide-border">
                <Row label="الراتب الأساسي" value={active.basic} />
                <Row label="بدل سكن" value={active.housing} />
                <Row label="بدل مواصلات" value={active.transport} />
                {active.bonus ? <Row label="مكافأة" value={active.bonus} /> : null}
                <Row label="إجمالي المستحقات" value={totalEarnings} bold />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-destructive uppercase tracking-wide mb-2">الاستقطاعات</p>
              <div className="rounded-xl border border-border divide-y divide-border">
                <Row label="التأمينات الاجتماعية" value={active.gosi} negative />
                <Row label="ضريبة" value={active.tax} negative />
                <Row label="إجمالي الاستقطاعات" value={totalDeductions} bold negative />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-secondary/30">
          <Button
            onClick={handleDownload}
            className="w-full rounded-xl h-11 bg-primary hover:bg-primary-hover gap-2"
          >
            <Download className="h-4 w-4" />
            تنزيل كشف {active.month} (PDF)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold, negative }: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-2.5", bold && "bg-secondary/40")}>
      <span className={cn("text-sm", bold && "font-bold")}>{label}</span>
      <span className={cn("text-sm num", bold && "font-bold", negative && "text-destructive")}>
        {negative && value > 0 ? "−" : ""}{fmt(value)} ر.س
      </span>
    </div>
  );
}
