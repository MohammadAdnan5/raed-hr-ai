import { useState } from "react";
import { FileText, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmitted?: (doc: import("@/data/hrData").TrackedDocument) => void;
  onOpenTracker?: () => void;
}

const docTypes = [
  { id: "salary", label: "خطاب تعريف بالراتب", time: "خلال ساعتين" },
  { id: "exp", label: "شهادة خبرة", time: "خلال ٢٤ ساعة" },
  { id: "visa", label: "تأييد لتأشيرة", time: "خلال ٤٨ ساعة" },
  { id: "noobj", label: "خطاب عدم ممانعة", time: "خلال ٢٤ ساعة" },
];

export function DocumentDialog({ open, onOpenChange, onSubmitted, onOpenTracker }: DocumentDialogProps) {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState("salary");
  const [recipient, setRecipient] = useState("");
  const { toast } = useToast();

  const reset = () => {
    setStep(1);
    setDocType("salary");
    setRecipient("");
  };

  const handleClose = (o: boolean) => {
    if (!o) setTimeout(reset, 200);
    onOpenChange(o);
  };

  const submit = () => {
    setStep(3);
    const selected = docTypes.find((d) => d.id === docType)!;
    const newDoc: import("@/data/hrData").TrackedDocument = {
      id: `DOC-${Math.floor(2050 + Math.random() * 50)}`,
      type: selected.label,
      recipient: recipient.trim() || undefined,
      requestedAt: "الآن",
      status: "processing",
      steps: [
        { label: "استلام الطلب", done: true, time: "الآن" },
        { label: "التحقق من البيانات", done: false },
        { label: "إنشاء المسودة", done: false },
        { label: "التوقيع الرقمي", done: false },
        { label: "جاهز للتنزيل", done: false },
      ],
    };
    onSubmitted?.(newDoc);
    toast({
      title: "بدأ الوكيل التنفيذ",
      description: "يمكنك متابعة حالة الوثيقة من \"وثائقي\".",
    });
  };

  const selectedDoc = docTypes.find((d) => d.id === docType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-right">طلب وثيقة</DialogTitle>
              <DialogDescription className="text-right">
                {step === 3 ? "تم استلام طلبك" : `الخطوة ${step} من ٢`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3 animate-fade-up">
            <p className="text-sm font-medium">نوع الوثيقة</p>
            <div className="space-y-2">
              {docTypes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDocType(d.id)}
                  className={cn(
                    "w-full rounded-xl border p-3.5 text-right transition-all flex items-center justify-between",
                    docType === d.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-background hover:border-primary/40"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">{d.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">جاهز {d.time}</p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      docType === d.id ? "border-primary bg-primary" : "border-border"
                    )}
                  >
                    {docType === d.id && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                </button>
              ))}
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
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">الوثيقة المطلوبة</p>
              <p className="text-sm font-semibold mt-0.5">{selectedDoc?.label}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">جهة التوجيه</label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="مثال: البنك الأهلي السعودي"
                className="rounded-xl h-11"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                ستظهر هذه الجهة في رأس الوثيقة الرسمية.
              </p>
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
                disabled={!recipient.trim()}
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
              <h3 className="text-lg font-bold">طلبك في الطريق</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ستجد الوثيقة في صندوق طلباتك {selectedDoc?.time}.
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
