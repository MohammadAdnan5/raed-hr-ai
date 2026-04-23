import { useState } from "react";
import { Calendar, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const leaveTypes = [
  { id: "annual", label: "سنوية", balance: "١٣ يوماً متاحة" },
  { id: "sick", label: "مرضية", balance: "٢٨ يوماً متاحة" },
  { id: "emergency", label: "طارئة", balance: "٤ أيام متاحة" },
  { id: "unpaid", label: "بدون راتب", balance: "—" },
];

export function LeaveDialog({ open, onOpenChange }: LeaveDialogProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("annual");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const reset = () => {
    setStep(1);
    setType("annual");
    setFrom("");
    setTo("");
    setReason("");
  };

  const handleClose = (o: boolean) => {
    if (!o) setTimeout(reset, 200);
    onOpenChange(o);
  };

  const submit = () => {
    setStep(3);
    toast({
      title: "تم تقديم الطلب بنجاح",
      description: "تم إرسال طلبك إلى مديرك المباشر للموافقة.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-right">تقديم طلب إجازة</DialogTitle>
              <DialogDescription className="text-right">
                {step === 3 ? "تم استلام طلبك" : `الخطوة ${step} من ٢`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <p className="text-sm font-medium mb-2">نوع الإجازة</p>
              <div className="grid grid-cols-2 gap-2">
                {leaveTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={cn(
                      "rounded-xl border p-3 text-right transition-all",
                      type === t.id
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-background hover:border-primary/40"
                    )}
                  >
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.balance}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full bg-primary hover:bg-primary-hover rounded-xl h-11"
            >
              التالي
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">من تاريخ</label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">إلى تاريخ</label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">السبب (اختياري)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="أضف ملاحظة لمديرك..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl h-11"
              >
                رجوع
              </Button>
              <Button
                onClick={submit}
                disabled={!from || !to}
                className="flex-1 bg-primary hover:bg-primary-hover rounded-xl h-11"
              >
                تقديم الطلب
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 text-center space-y-4 animate-fade-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
              <Check className="h-8 w-8 text-success" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-lg font-bold">تم تقديم طلبك</h3>
              <p className="text-sm text-muted-foreground mt-1">
                رقم الطلب <span className="num font-semibold">REQ-2053</span> — سيتم إشعارك فور الموافقة
              </p>
            </div>
            <Button
              onClick={() => handleClose(false)}
              className="w-full bg-primary hover:bg-primary-hover rounded-xl h-11"
            >
              تم
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
