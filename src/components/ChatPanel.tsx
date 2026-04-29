import { useState, useRef, useEffect } from "react";
import { Sparkles, FileText, Calendar, BookOpen, ArrowUp, Mic, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { policySnippets, samplePlans, AgentPlan as TPlan } from "@/data/hrData";
import { AgentPlanCard } from "./AgentPlan";
import { useToast } from "@/hooks/use-toast";

type MessageRole = "user" | "agent";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  source?: string;
  actions?: { label: string; onClick: () => void }[];
  plan?: TPlan;
}

interface ChatPanelProps {
  onOpenLeave: () => void;
  onOpenDocument: () => void;
  onOpenPolicies?: () => void;
  onOpenPayslip?: () => void;
  onOpenSimulator?: () => void;
}

const suggestions = [
  { icon: Calendar, text: "أريد تقديم إجازة سنوية" },
  { icon: FileText, text: "أحتاج خطاب تعريف بالراتب" },
  { icon: BookOpen, text: "كم يوماً يمكنني ترحيل من إجازتي؟" },
  { icon: Sparkles, text: "ما هي مزايا التأمين الصحي؟" },
];

export function ChatPanel({ onOpenLeave, onOpenDocument, onOpenPolicies, onOpenPayslip, onOpenSimulator }: ChatPanelProps) {
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content:
        "أهلاً عبدالله 👋 أنا وكيلك الذكي للموارد البشرية. لا أكتفي بالإجابة — أُخطّط، أتحقق من السياسات، وأنفّذ الإجراءات نيابةً عنك بأمان.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateReply(content, {
        onOpenLeave,
        onOpenDocument,
        onOpenPolicies,
        onOpenPayslip,
        onPlanApprove: (planId) => {
          toast({
            title: "نفّذ الوكيل الإجراء",
            description: "أكملتُ الخطوات المتبقية بأمان وأشعرتُ الأطراف المعنية.",
          });
          if (planId === "plan-leave") onOpenLeave();
          if (planId === "plan-doc") onOpenDocument();
        },
      });
      setMessages((m) => [...m, reply]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex h-full flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-gradient-hero px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-coral">
          <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">وكيل الموارد البشرية الذكي</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            يخطط · يتحقق · ينفّذ
          </p>
        </div>
        <span className="chip bg-background/70 border border-border text-[10px] text-muted-foreground shrink-0">
          نطاق: HR فقط
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onPlanApprove={() => {
              if (!msg.plan) return;
              toast({
                title: "نفّذ الوكيل الإجراء",
                description: "أكملتُ الخطوات المتبقية بأمان وأشعرتُ الأطراف المعنية.",
              });
              if (msg.plan.id === "plan-leave") onOpenLeave();
              if (msg.plan.id === "plan-doc") onOpenDocument();
            }}
            onPlanCancel={() => {
              setMessages((m) =>
                m.map((x) => (x.id === msg.id ? { ...x, plan: undefined, content: "أوقفتُ الخطة. أخبرني متى تريد المتابعة." } : x))
              );
            }}
          />
        ))}
        {isTyping && <TypingIndicator />}

        {messages.length === 1 && (
          <div className="pt-4 space-y-2 animate-fade-up">
            <p className="text-xs text-muted-foreground px-1">جرّب طلباً يحتاج تخطيطاً</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-3 text-right text-sm transition-all hover:border-primary/40 hover:bg-primary-soft/40 hover:shadow-sm"
                >
                  <s.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input — frictionless voice & chat */}
      <div className="border-t border-border bg-background p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-background">
          <button
            onClick={() => {
              setListening((v) => !v);
              if (!listening) {
                toast({ title: "🎙️ ابدأ التحدث", description: "أستمع إليك الآن (تجريبي)..." });
                setTimeout(() => {
                  setListening(false);
                  setInput("أحتاج خطاب تعريف بالراتب موجه للبنك الأهلي");
                  toast({ title: "تم التقاط طلبك", description: "راجعه ثم أرسله." });
                }, 1800);
              }
            }}
            aria-label="إدخال صوتي"
            className={cn(
              "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center transition-all",
              listening
                ? "bg-destructive text-destructive-foreground animate-pulse-soft"
                : "bg-card border border-border hover:border-primary/40 hover:text-primary text-muted-foreground"
            )}
          >
            <Mic className="h-4 w-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="تحدث أو اكتب طلبك العفوي هنا..."
            className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none py-2 max-h-32"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            size="icon"
            className="h-9 w-9 rounded-xl bg-primary hover:bg-primary-hover shrink-0 disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="mt-2 mx-auto flex items-center gap-1.5 text-[11px] text-primary font-medium hover:underline"
          >
            <FlaskConical className="h-3 w-3" /> جرّب محاكي القرارات
          </button>
        )}
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          الوكيل لا ينفّذ إجراءات حساسة دون موافقتك · مستند على سياسات شركتك
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onPlanApprove,
  onPlanCancel,
}: {
  message: ChatMessage;
  onPlanApprove: () => void;
  onPlanCancel: () => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2.5 animate-fade-up", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
          isUser ? "bg-secondary text-foreground" : "bg-gradient-warm text-primary-foreground"
        )}
      >
        {isUser ? "أ" : <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div className={cn("flex flex-col gap-1.5 max-w-[85%] min-w-0", isUser && "items-end")}>
        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-secondary text-foreground rounded-tl-sm"
            )}
          >
            {message.content}
          </div>
        )}
        {message.source && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
            <BookOpen className="h-3 w-3" />
            <span>المصدر: {message.source}</span>
          </div>
        )}
        {message.plan && (
          <div className="w-full">
            <AgentPlanCard plan={message.plan} onApprove={onPlanApprove} onCancel={onPlanCancel} />
          </div>
        )}
        {message.actions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade-up">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-warm">
        <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animation: "typing 1.2s infinite", animationDelay: "0s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animation: "typing 1.2s infinite", animationDelay: "0.2s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animation: "typing 1.2s infinite", animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

// HR scope guardrail — keywords inside the agent's authority
const HR_KEYWORDS = [
  "إجاز","اجاز","رصيد","راتب","كشف","تأمين","تامين","مزايا","سياس","لائح","عقد","شهاد","خطاب","تعريف","وثيق","تأييد","تاييد","عمل","حضور","انصراف","تسجيل","تأخر","مكافأ","بدل","سكن","مواصلات","تأشير","تاشير","تجربة","ترحيل","استقالة","اجتماع","مدير","فريق","موارد","HR","hr",
];
// Topics outside the agent's scope (privacy / non-HR)
const OUT_OF_SCOPE = [
  "زميل","زملاء","راتب فلان","تقييم فلان","سياسة","رياضة","طقس","أخبار","برمج","كود","طبخ",
];

function isInScope(q: string) {
  return HR_KEYWORDS.some((k) => q.includes(k));
}
function isPrivacyRisk(q: string) {
  return /راتب\s+\S+|كم\s+يأخذ|كم\s+راتب\s+(?!ي|ال)/.test(q);
}

function generateReply(
  query: string,
  handlers: {
    onOpenLeave: () => void;
    onOpenDocument: () => void;
    onOpenPolicies?: () => void;
    onOpenPayslip?: () => void;
    onPlanApprove: (planId: string) => void;
  }
): ChatMessage {
  const q = query.toLowerCase();
  const id = `a-${Date.now()}`;

  // 🛡️ Guardrail 1: privacy risk (asking about others' compensation)
  if (isPrivacyRisk(q)) {
    return {
      id,
      role: "agent",
      content:
        "لا أستطيع مشاركة معلومات راتب موظف آخر — هذه بيانات خاصة محمية بسياسة السرية. يمكنني مساعدتك في كل ما يخصك أنت.",
      source: "ميثاق سلوك العمل — السرية",
    };
  }

  if (q.includes("إجازة") || q.includes("اجازة")) {
    return {
      id,
      role: "agent",
      content: "فهمتُ — سأخطّط لطلب الإجازة وأتحقق من كل شيء قبل الإرسال:",
      plan: samplePlans.leave,
    };
  }
  if (q.includes("كشف") || q.includes("راتبي") || q.includes("معاش")) {
    return {
      id,
      role: "agent",
      content: "هذا كشف راتبك لآخر شهر — يمكنك أيضاً تنزيل الأشهر السابقة.",
      source: "نظام الرواتب الداخلي",
      actions: handlers.onOpenPayslip ? [{ label: "افتح كشف الراتب", onClick: handlers.onOpenPayslip }] : undefined,
    };
  }
  if (q.includes("خطاب") || q.includes("وثيقة") || q.includes("شهادة") || q.includes("تعريف") || q.includes("تأييد") || q.includes("تاييد")) {
    return {
      id,
      role: "agent",
      content: "تمام، سأتولى إصدار الخطاب خطوة بخطوة:",
      plan: samplePlans.document,
    };
  }
  const policy = policySnippets.find((p) => q.includes("ترحيل") || q.includes("تجربة") || q.includes("سياسة") || q.includes("لائحة"));
  if (policy) {
    return {
      id,
      role: "agent",
      content: policy.a,
      source: policy.source,
      actions: handlers.onOpenPolicies ? [{ label: "تصفح السياسات الكاملة", onClick: handlers.onOpenPolicies }] : undefined,
    };
  }
  if (q.includes("تأمين") || q.includes("تامين") || q.includes("مزايا")) {
    return {
      id,
      role: "agent",
      content:
        "التأمين الصحي يغطيك أنت وأسرتك (الزوج/ة وحتى ٣ أبناء) في الفئة (أ) لدى شبكة بوبا، ويشمل العيادات الخارجية والتنويم وطب الأسنان الأساسي.",
      source: "دليل المزايا — قسم التأمين",
      actions: handlers.onOpenPolicies ? [{ label: "افتح دليل المزايا", onClick: handlers.onOpenPolicies }] : undefined,
    };
  }

  // 🛡️ Guardrail 2: out-of-scope fallback
  if (!isInScope(q)) {
    return {
      id,
      role: "agent",
      content:
        "هذا السؤال خارج نطاقي — أنا متخصص في شؤون الموارد البشرية فقط (إجازات، رواتب، وثائق، سياسات، مزايا). جرّب سؤالاً في هذه المواضيع وسأسعدك بالإجابة.",
      actions: [
        { label: "تصفح السياسات", onClick: handlers.onOpenPolicies ?? (() => {}) },
        { label: "خطّط لإجازة", onClick: handlers.onOpenLeave },
      ],
    };
  }

  return {
    id,
    role: "agent",
    content: "فهمت طلبك. هل تقصد إجراءً معيناً؟ يمكنني التخطيط لإجازة، إصدار وثيقة، فتح كشف الراتب، أو الإجابة عن سياسة محددة.",
    actions: [
      { label: "خطّط لإجازة", onClick: handlers.onOpenLeave },
      { label: "أصدر وثيقة", onClick: handlers.onOpenDocument },
    ],
  };
}
