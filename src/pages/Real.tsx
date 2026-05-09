import { useMemo, useRef, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Link } from "react-router-dom";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  ArrowRight,
  Bot,
  ChevronDown,
  Sparkles,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  title: string;
  createdAt: number;
  messages: UIMessage[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/raed-agent`;

const newThread = (n: number): Thread => ({
  id: crypto.randomUUID(),
  title: `محادثة ${n}`,
  createdAt: Date.now(),
  messages: [],
});

const SUGGESTIONS = [
  "أصدر لي خطاب تعريف بالراتب موجّه إلى البنك الأهلي",
  "كم رصيد إجازتي السنوية؟",
  "ما هي سياسة العمل عن بُعد؟",
  "احسب صافي راتبي لو زاد إلى 28000 ريال",
];

export default function Real() {
  const initial = useMemo(() => newThread(1), []);
  const [threads, setThreads] = useState<Thread[]>([initial]);
  const [activeId, setActiveId] = useState<string>(initial.id);
  const counter = useRef(1);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  const transport = useMemo(
    () => new DefaultChatTransport({ api: ENDPOINT }),
    []
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: active?.id,
    messages: active?.messages ?? [],
    transport,
  });

  // Persist messages back to thread (in-memory only)
  useEffect(() => {
    if (!active) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, messages } : t))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId, status]);

  const handleSubmit = (msg: PromptInputMessage) => {
    const text = msg.text?.trim();
    if (!text) return;
    // auto-title on first message
    if (active && active.messages.length === 0) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? { ...t, title: text.slice(0, 30) + (text.length > 30 ? "…" : "") }
            : t
        )
      );
    }
    sendMessage({ text });
  };

  const createThread = () => {
    counter.current += 1;
    const t = newThread(counter.current);
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const t = newThread(1);
        counter.current = 1;
        setActiveId(t.id);
        return [t];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 border-l bg-muted/30 flex flex-col shrink-0">
        <div className="p-3 border-b flex items-center gap-2">
          <RaedMark />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">رائد · الوكيل الحقيقي</p>
            <p className="text-[10px] text-muted-foreground">Lovable AI · Tools · Streaming</p>
          </div>
        </div>
        <div className="p-2">
          <Button
            onClick={createThread}
            className="w-full justify-start gap-2 rounded-xl"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            محادثة جديدة
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg text-sm transition-colors",
                t.id === activeId
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <button
                onClick={() => setActiveId(t.id)}
                className="flex-1 text-right px-3 py-2 truncate"
              >
                {t.title}
              </button>
              <button
                onClick={() => deleteThread(t.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-destructive transition"
                aria-label="حذف"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            العودة للنسخة التجريبية
          </Link>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold">{active?.title}</h1>
            <p className="text-[11px] text-muted-foreground">
              نظام وكلاء حقيقي — Vercel AI SDK + Lovable AI Gateway + Tools
            </p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-success-soft text-success font-semibold">
            ● مباشر
          </span>
        </header>

        <Conversation key={active?.id} className="flex-1">
          <ConversationContent>
            {messages.length === 0 && (
              <ConversationEmptyState
                icon={<RaedMark size={48} />}
                title="مرحباً، أنا رائد"
                description="اسألني عن سياساتك، أرصدتك، أو اطلب خطاباً — سأستخدم الأدوات لتنفيذ ذلك فعلياً."
              >
                <RaedMark size={48} />
                <h3 className="font-bold text-base mt-3">مرحباً، أنا رائد</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  وكيلك الذكي للموارد البشرية. اطلب خطاباً، استعلم عن سياسة، أو احسب راتبك.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-xl">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage({ text: s })}
                      className="text-right text-xs p-3 rounded-xl border bg-background hover:border-primary/50 hover:bg-primary/5 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            )}

            {messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent>
                  {m.role === "assistant"
                    ? renderAssistantParts(m.parts)
                    : m.parts.map((part, idx) =>
                        part.type === "text" ? (
                          <span key={idx} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        ) : null
                      )}
                </MessageContent>
              </Message>
            ))}

            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer>رائد يفكر...</Shimmer>
                </MessageContent>
              </Message>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                حدث خطأ: {error.message}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t p-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={inputRef}
              placeholder="اسأل رائد أي شيء..."
              disabled={isLoading}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            مدعوم بـ <span className="font-semibold">google/gemini-2.5-flash</span> عبر Lovable AI Gateway
          </p>
        </div>
      </main>
    </div>
  );
}

function PrettyJson({ data }: { data: unknown }) {
  return (
    <pre className="text-[11px] bg-muted/50 rounded-lg p-2 overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderAssistantParts(parts: any[]) {
  let finalIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].type === "text") {
      finalIdx = i;
      break;
    }
  }
  const stepParts = finalIdx === -1 ? parts : parts.slice(0, finalIdx);
  const finalPart = finalIdx === -1 ? null : parts[finalIdx];

  const steps = stepParts.filter(
    (p) =>
      p.type === "text" ||
      p.type === "dynamic-tool" ||
      (typeof p.type === "string" && p.type.startsWith("tool-"))
  );

  const toolNames = steps
    .filter((p) => p.type === "dynamic-tool" || (typeof p.type === "string" && p.type.startsWith("tool-")))
    .map((p) =>
      p.type === "dynamic-tool" ? p.toolName : p.type.split("-").slice(1).join("-")
    );

  return (
    <>
      {steps.length > 0 && (
        <Collapsible
          defaultOpen={true}
          className="mb-3 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden"
        >
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-primary/5 transition">
            <div className="flex items-center gap-2 text-right min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold flex items-center gap-2">
                  كيف فكّر رائد
                  <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold">
                    {steps.length} خطوات
                  </span>
                </p>
                {toolNames.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    استخدم: {toolNames.join(" ← ")}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 pt-2">
            <div className="relative space-y-3 pr-3 border-r-2 border-dashed border-primary/30">
              {steps.map((part, i) => (
                <StepRow key={i} index={i + 1} part={part} total={steps.length} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      {finalPart && <MessageResponse>{finalPart.text}</MessageResponse>}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepRow({ index, part, total }: { index: number; part: any; total: number }) {
  const isTool =
    part.type === "dynamic-tool" ||
    (typeof part.type === "string" && part.type.startsWith("tool-"));

  const label = isTool ? "استدعاء أداة" : "تفكير";

  if (!isTool) {
    return (
      <div className="relative">
        <StepDot index={index} />
        <div className="mr-4">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">
            خطوة {index} من {total} · {label}
          </p>
          <div className="rounded-lg bg-background border p-2.5 text-xs whitespace-pre-wrap leading-relaxed">
            {part.text}
          </div>
        </div>
      </div>
    );
  }

  const done = part.state === "output-available";
  const toolName =
    part.type === "dynamic-tool"
      ? part.toolName
      : part.type.split("-").slice(1).join("-");

  return (
    <div className="relative">
      <StepDot index={index} tone={done ? "success" : "default"} />
      <div className="mr-4">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
          <span>خطوة {index} من {total} · {label}</span>
          <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px]">
            {toolName}
          </code>
        </p>
        <Tool defaultOpen={done}>
          <ToolHeader type={part.type} state={part.state} toolName={toolName} />
          <ToolContent>
            <ToolInput input={part.input} />
            <ToolOutput
              output={part.output ? <PrettyJson data={part.output} /> : null}
              errorText={part.errorText}
            />
          </ToolContent>
        </Tool>
      </div>
    </div>
  );
}

function StepDot({
  index,
  tone = "default",
}: {
  index: number;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={cn(
        "absolute -right-[1.85rem] top-0 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-background",
        tone === "success"
          ? "bg-success text-success-foreground"
          : "bg-primary text-primary-foreground"
      )}
    >
      {index}
    </div>
  );
}


function RaedMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shrink-0 shadow-md"
      style={{ width: size, height: size }}
    >
      <Bot className="text-primary-foreground" style={{ width: size * 0.6, height: size * 0.6 }} />
    </div>
  );
}
