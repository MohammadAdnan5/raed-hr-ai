import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, FileText, Calendar, BookOpen, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { policySnippets } from "@/data/hrData";

type MessageRole = "user" | "agent";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  source?: string;
  actions?: { label: string; onClick: () => void }[];
}

interface ChatPanelProps {
  onOpenLeave: () => void;
  onOpenDocument: () => void;
}

const suggestions = [
  { icon: Calendar, text: "أريد تقديم إجازة سنوية" },
  { icon: FileText, text: "أحتاج خطاب تعريف بالراتب" },
  { icon: BookOpen, text: "كم يوماً يمكنني ترحيل من إجازتي؟" },
  { icon: Sparkles, text: "ما هي مزايا التأمين الصحي؟" },
];

export function ChatPanel({ onOpenLeave, onOpenDocument }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "أهلاً عبدالله 👋 أنا مساعدك الذكي للموارد البشرية. اسألني عن أي شيء، أو ابدأ بطلب جديد.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const reply = generateReply(content, { onOpenLeave, onOpenDocument });
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
        <div className="flex-1">
          <p className="text-sm font-bold">مساعد الموارد البشرية</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            متصل ومستعد للمساعدة
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}

        {messages.length === 1 && (
          <div className="pt-4 space-y-2 animate-fade-up">
            <p className="text-xs text-muted-foreground px-1">اقتراحات سريعة</p>
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

      {/* Input */}
      <div className="border-t border-border bg-background p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-background">
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
            placeholder="اكتب سؤالك أو طلبك..."
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
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          إجاباتي مستندة على سياسات شركتك المعتمدة
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
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
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isUser && "items-end")}>
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
        {message.source && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
            <BookOpen className="h-3 w-3" />
            <span>المصدر: {message.source}</span>
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

function generateReply(
  query: string,
  handlers: { onOpenLeave: () => void; onOpenDocument: () => void }
): ChatMessage {
  const q = query.toLowerCase();
  const id = `a-${Date.now()}`;

  if (q.includes("إجازة") || q.includes("اجازة")) {
    return {
      id,
      role: "agent",
      content:
        "تمام! يمكنني مساعدتك بتقديم طلب الإجازة. رصيدك السنوي الحالي: ١٣ يوماً متاحة من أصل ٢١. هل تريد المتابعة الآن؟",
      actions: [
        { label: "تقديم طلب إجازة", onClick: handlers.onOpenLeave },
        { label: "عرض رصيدي", onClick: () => {} },
      ],
    };
  }
  if (q.includes("خطاب") || q.includes("وثيقة") || q.includes("شهادة") || q.includes("راتب") || q.includes("تعريف")) {
    return {
      id,
      role: "agent",
      content:
        "أكيد. يمكنني إصدار خطاب التعريف خلال ساعات قليلة. أحتاج فقط جهة التوجيه (بنك، سفارة، جهة حكومية...).",
      actions: [{ label: "بدء طلب الوثيقة", onClick: handlers.onOpenDocument }],
    };
  }
  const policy = policySnippets.find((p) => q.includes("ترحيل") || q.includes("تجربة") || q.includes("سياسة"));
  if (policy) {
    return { id, role: "agent", content: policy.a, source: policy.source };
  }
  if (q.includes("تأمين") || q.includes("مزايا")) {
    return {
      id,
      role: "agent",
      content:
        "التأمين الصحي يغطيك أنت وأسرتك (الزوج/ة وحتى ٣ أبناء) في الفئة (أ) لدى شبكة بوبا، ويشمل العيادات الخارجية والتنويم وطب الأسنان الأساسي.",
      source: "دليل المزايا — قسم التأمين",
    };
  }
  return {
    id,
    role: "agent",
    content:
      "فهمت طلبك. هل تقصد إجراءً معيناً؟ يمكنني المساعدة في الإجازات، الوثائق، الاستفسارات عن السياسات، أو تحديث بياناتك.",
    actions: [
      { label: "تقديم إجازة", onClick: handlers.onOpenLeave },
      { label: "طلب وثيقة", onClick: handlers.onOpenDocument },
    ],
  };
}
