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
  Code2,
  Activity,
  Cpu,
  Zap,
  Network,
  Clock,
  User,
  BookOpen,
  Calendar,
  FileText,
  Calculator,
  CheckCircle2,
  MessageSquareText,
  ArrowDown,
  Wrench,
  Brain,
  Target,
  AlertTriangle,
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
const MODEL = "google/gemini-2.5-flash";
const TOOL_REGISTRY = [
  "getEmployeeProfile",
  "searchPolicy",
  "requestLeave",
  "issueSalaryCertificate",
  "simulateSalaryChange",
];

// Each tool is presented as a "specialized sub-agent" the orchestrator delegates to.
const AGENT_REGISTRY: Record<
  string,
  { label: string; role: string; icon: typeof User; mutates: boolean }
> = {
  getEmployeeProfile: {
    label: "وكيل بيانات الموظف",
    role: "Employee Profile Agent",
    icon: User,
    mutates: false,
  },
  searchPolicy: {
    label: "وكيل السياسات",
    role: "Policy Retrieval Agent (RAG-ready)",
    icon: BookOpen,
    mutates: false,
  },
  requestLeave: {
    label: "وكيل طلبات الإجازة",
    role: "Leave Request Agent",
    icon: Calendar,
    mutates: true,
  },
  issueSalaryCertificate: {
    label: "وكيل إصدار الوثائق",
    role: "Document Issuance Agent",
    icon: FileText,
    mutates: true,
  },
  simulateSalaryChange: {
    label: "وكيل المحاكاة المالية",
    role: "Payroll Simulation Agent",
    icon: Calculator,
    mutates: false,
  },
};

const getAgent = (toolName: string) =>
  AGENT_REGISTRY[toolName] ?? {
    label: toolName,
    role: "Custom Tool",
    icon: Wrench,
    mutates: false,
  };

// Infer a human-readable "action taken" line from a tool output shape.
function inferAction(toolName: string, output: unknown):
  | { kind: string; summary: string }
  | null {
  if (!output || typeof output !== "object") return null;
  const o = output as Record<string, unknown>;
  if (toolName === "issueSalaryCertificate" && o.documentId) {
    return {
      kind: "document.issued",
      summary: `تم إصدار الوثيقة ${o.documentId} وإرسالها إلى ${o.deliveredTo ?? "المستفيد"}`,
    };
  }
  if (toolName === "requestLeave" && o.requestId) {
    return {
      kind: "leave.pending_approval",
      summary: `تم تقديم طلب الإجازة ${o.requestId} بانتظار موافقة ${o.sentTo ?? "المدير"}`,
    };
  }
  return null;
}

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
  const [devMode, setDevMode] = useState(true);
  const counter = useRef(1);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  const transport = useMemo(
    () => new DefaultChatTransport({ api: ENDPOINT }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    id: active?.id,
    messages: active?.messages ?? [],
    transport,
  });

  // --- Latency tracking (sent → first token → done) ---
  const sentAtRef = useRef<number | null>(null);
  const [firstTokenMs, setFirstTokenMs] = useState<number | null>(null);
  const [totalMs, setTotalMs] = useState<number | null>(null);

  useEffect(() => {
    if (status === "submitted") {
      sentAtRef.current = performance.now();
      setFirstTokenMs(null);
      setTotalMs(null);
    }
    if (status === "streaming" && sentAtRef.current && firstTokenMs === null) {
      setFirstTokenMs(Math.round(performance.now() - sentAtRef.current));
    }
    if (status === "ready" && sentAtRef.current) {
      setTotalMs(Math.round(performance.now() - sentAtRef.current));
      sentAtRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Persist messages back to thread (in-memory only)
  useEffect(() => {
    if (!active) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, messages } : t))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Live aggregate metrics
  const totalToolCalls = messages.reduce(
    (n, m) =>
      n +
      m.parts.filter(
        (p) =>
          p.type === "dynamic-tool" ||
          (typeof p.type === "string" && p.type.startsWith("tool-"))
      ).length,
    0
  );

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
            <p className="text-[10px] text-muted-foreground">AI Gateway · Tools · Streaming</p>
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
        <header className="border-b">
          <div className="px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">{active?.title}</h1>
              <p className="text-[10px] text-muted-foreground">
                Orchestrator Agent · {TOOL_REGISTRY.length} specialized tools registered
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setDevMode((v) => !v)}
                className={cn(
                  "flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border font-mono transition",
                  devMode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                )}
              >
                <Code2 className="h-3 w-3" />
                DEV
              </button>
              <span className="text-[10px] px-2 py-1 rounded-full bg-success-soft text-success font-semibold">
                ● LIVE
              </span>
            </div>
          </div>
          {/* Tech HUD */}
          <div className="px-4 py-2 bg-muted/40 border-t flex items-center gap-3 text-[10px] font-mono overflow-x-auto whitespace-nowrap">
            <HudPill icon={<Cpu className="h-3 w-3" />} label="model" value={MODEL} />
            <HudPill
              icon={<Network className="h-3 w-3" />}
              label="endpoint"
              value="POST /functions/v1/raed-agent"
            />
            <HudPill
              icon={<Activity className="h-3 w-3" />}
              label="status"
              value={status}
              tone={
                status === "streaming"
                  ? "primary"
                  : status === "error"
                  ? "danger"
                  : "default"
              }
            />
            <HudPill
              icon={<Zap className="h-3 w-3" />}
              label="ttft"
              value={firstTokenMs !== null ? `${firstTokenMs}ms` : "—"}
            />
            <HudPill
              icon={<Clock className="h-3 w-3" />}
              label="total"
              value={totalMs !== null ? `${totalMs}ms` : "—"}
            />
            <HudPill
              icon={<Sparkles className="h-3 w-3" />}
              label="tool_calls"
              value={String(totalToolCalls)}
            />
          </div>
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

            {messages.map((m, mi) => {
              const userText =
                m.role === "user"
                  ? m.parts
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("")
                  : "";
              // The user request that triggered this assistant message
              const triggeringRequest =
                m.role === "assistant"
                  ? (() => {
                      for (let i = mi - 1; i >= 0; i--) {
                        if (messages[i].role === "user") {
                          return messages[i].parts
                            .map((p) => (p.type === "text" ? p.text : ""))
                            .join("");
                        }
                      }
                      return "";
                    })()
                  : "";
              return (
                <Message from={m.role} key={m.id}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <AgentJourney
                        parts={m.parts}
                        request={triggeringRequest}
                        devMode={devMode}
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">{userText}</span>
                    )}
                    {devMode && <RawMessageJson message={m} />}
                  </MessageContent>
                </Message>
              );
            })}

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
        </div>
      </main>
    </div>
  );
}

function PrettyJson({ data }: { data: unknown }) {
  return (
    <pre className="text-[11px] bg-muted/50 rounded-lg p-2 overflow-x-auto leading-relaxed font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function inlineJson(data: unknown, max = 70): string {
  if (data === undefined || data === null) return "—";
  let s: string;
  try {
    s = JSON.stringify(data);
  } catch {
    s = String(data);
  }
  if (!s) return "—";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// ===== Agent Journey: end-to-end orchestration trace =====
//
// Each assistant message becomes a phase-typed timeline:
//   REQUEST → ORCHESTRATOR (reasoning) → AGENT (tool call)
//            → ORCHESTRATOR (synthesis)  → ... → FINAL RESULT
//
// Goals:
//   - Make the orchestration layer visible (who decided what)
//   - Show every specialized agent activated, with its role and I/O
//   - Track per-step latency so judges see real execution timing
//   - Terminate with a distinct card that says "answer" or "action taken"

type Phase =
  | { kind: "request"; text: string }
  | { kind: "reasoning"; text: string; partIdx: number }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { kind: "agent"; toolName: string; part: any; partIdx: number }
  | {
      kind: "final";
      text: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      action: ReturnType<typeof inferAction>;
    };

function AgentJourney({
  parts,
  request,
  devMode,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parts: any[];
  request: string;
  devMode: boolean;
}) {
  // Per-part timing: stamp first-seen and "completed" timestamps
  const timingsRef = useRef<
    Map<number, { startedAt: number; endedAt: number | null }>
  >(new Map());
  const startedAtRef = useRef<number>(performance.now());
  const [, force] = useState(0);

  useEffect(() => {
    let changed = false;
    parts.forEach((p, i) => {
      const isTool =
        p.type === "dynamic-tool" ||
        (typeof p.type === "string" && p.type.startsWith("tool-"));
      const t = timingsRef.current.get(i);
      if (!t) {
        timingsRef.current.set(i, {
          startedAt: performance.now(),
          endedAt: null,
        });
        changed = true;
      } else if (
        t.endedAt === null &&
        ((isTool &&
          (p.state === "output-available" || p.state === "output-error")) ||
          (!isTool && typeof p.text === "string"))
      ) {
        t.endedAt = performance.now();
        changed = true;
      }
    });
    if (changed) force((x) => x + 1);
  }, [parts]);

  // Find the final text part (the answer)
  let finalIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].type === "text") {
      finalIdx = i;
      break;
    }
  }

  // Build phase list
  const phases: Phase[] = [];
  if (request) phases.push({ kind: "request", text: request });

  parts.forEach((p, i) => {
    if (i === finalIdx) return;
    if (p.type === "text" && p.text?.trim()) {
      phases.push({ kind: "reasoning", text: p.text, partIdx: i });
    } else if (
      p.type === "dynamic-tool" ||
      (typeof p.type === "string" && p.type.startsWith("tool-"))
    ) {
      const toolName =
        p.type === "dynamic-tool"
          ? p.toolName
          : p.type.split("-").slice(1).join("-");
      phases.push({ kind: "agent", toolName, part: p, partIdx: i });
    }
  });

  if (finalIdx !== -1) {
    const finalPart = parts[finalIdx];
    // Action terminator: if the last tool produced an action, surface it
    let action: ReturnType<typeof inferAction> = null;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const isTool =
        p.type === "dynamic-tool" ||
        (typeof p.type === "string" && p.type.startsWith("tool-"));
      if (isTool && p.state === "output-available") {
        const toolName =
          p.type === "dynamic-tool"
            ? p.toolName
            : p.type.split("-").slice(1).join("-");
        action = inferAction(toolName, p.output);
        if (action) break;
      }
    }
    phases.push({ kind: "final", text: finalPart.text ?? "", action });
  }

  const agentCount = phases.filter((p) => p.kind === "agent").length;
  const reasoningCount = phases.filter((p) => p.kind === "reasoning").length;
  const totalElapsed = (() => {
    const last = parts.length - 1;
    const t = timingsRef.current.get(last);
    if (!t) return null;
    return Math.round((t.endedAt ?? performance.now()) - startedAtRef.current);
  })();

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
      {/* Trace header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b bg-background/60 backdrop-blur">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Brain className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight">رحلة تنفيذ الوكيل</p>
            <p className="text-[10px] text-muted-foreground font-mono">
              Agent execution trace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
          <TraceMetric icon={<Brain className="h-3 w-3" />} label="reasoning" value={reasoningCount} />
          <TraceMetric icon={<Wrench className="h-3 w-3" />} label="agents" value={agentCount} />
          {totalElapsed !== null && (
            <TraceMetric icon={<Clock className="h-3 w-3" />} label="elapsed" value={`${totalElapsed}ms`} />
          )}
        </div>
      </div>

      {/* Timeline rail */}
      <div className="px-4 py-4 relative">
        <div className="absolute right-[1.85rem] top-4 bottom-4 w-px border-r-2 border-dashed border-primary/25" />
        <div className="space-y-3">
          {phases.map((phase, i) => {
            const ts =
              "partIdx" in phase ? timingsRef.current.get(phase.partIdx) : null;
            const startMs =
              ts && Math.round(ts.startedAt - startedAtRef.current);
            const durMs =
              ts && ts.endedAt !== null
                ? Math.round(ts.endedAt - ts.startedAt)
                : null;
            return (
              <PhaseCard
                key={i}
                phase={phase}
                index={i}
                startMs={startMs ?? null}
                durMs={durMs}
                devMode={devMode}
                isLastInTrace={i === phases.length - 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TraceMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 border">
      {icon}
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

function PhaseCard({
  phase,
  index,
  startMs,
  durMs,
  devMode,
  isLastInTrace,
}: {
  phase: Phase;
  index: number;
  startMs: number | null;
  durMs: number | null;
  devMode: boolean;
  isLastInTrace: boolean;
}) {
  // Visual style per phase type
  const styles = {
    request: {
      ring: "bg-muted text-foreground border-muted-foreground/30",
      badge: "bg-muted text-muted-foreground",
      label: "REQUEST",
      icon: MessageSquareText,
      arabic: "طلب المستخدم",
    },
    reasoning: {
      ring: "bg-primary text-primary-foreground border-primary",
      badge: "bg-primary/15 text-primary",
      label: "ORCHESTRATOR",
      icon: Brain,
      arabic: "قرار المنسّق",
    },
    agent: {
      ring: "bg-amber-500 text-white border-amber-500",
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      label: "AGENT CALL",
      icon: Wrench,
      arabic: "وكيل متخصّص",
    },
    final: {
      ring: "bg-success text-success-foreground border-success",
      badge: "bg-success/15 text-success",
      label: "FINAL RESULT",
      icon: Target,
      arabic: "النتيجة النهائية",
    },
  } as const;

  const s = styles[phase.kind];
  const Icon = s.icon;

  return (
    <div className="relative">
      {/* Rail dot */}
      <div
        className={cn(
          "absolute -right-[2.05rem] top-1 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background border-2 shadow-sm",
          s.ring
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="mr-4 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[10px] text-muted-foreground font-mono">
            #{index + 1}
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider",
              s.badge
            )}
          >
            {s.label}
          </span>
          <span className="text-[11px] font-semibold">{s.arabic}</span>
          {startMs !== null && (
            <span className="text-[10px] text-muted-foreground font-mono">
              · t+{startMs}ms
            </span>
          )}
          {durMs !== null && phase.kind === "agent" && (
            <span className="text-[10px] text-success font-mono font-bold">
              · {durMs}ms
            </span>
          )}
        </div>

        {/* Body per type */}
        {phase.kind === "request" && (
          <div className="rounded-lg border bg-background/80 p-2.5 text-xs leading-relaxed">
            <span className="text-muted-foreground">"</span>
            {phase.text}
            <span className="text-muted-foreground">"</span>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-mono text-muted-foreground border-t pt-1.5">
              <span>POST /functions/v1/raed-agent</span>
              <span>·</span>
              <span>model={MODEL}</span>
            </div>
          </div>
        )}

        {phase.kind === "reasoning" && (
          <div className="rounded-lg border bg-primary/5 border-primary/20 p-2.5 text-xs leading-relaxed whitespace-pre-wrap">
            {phase.text}
          </div>
        )}

        {phase.kind === "agent" && (
          <AgentInvocation part={phase.part} devMode={devMode} />
        )}

        {phase.kind === "final" && (
          <FinalCard text={phase.text} action={phase.action} />
        )}

        {/* Arrow connector */}
        {!isLastInTrace && (
          <div className="flex justify-end pr-2 -mb-1.5 mt-1 text-muted-foreground/40">
            <ArrowDown className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}

function AgentInvocation({
  part,
  devMode,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  part: any;
  devMode: boolean;
}) {
  const toolName =
    part.type === "dynamic-tool"
      ? part.toolName
      : part.type.split("-").slice(1).join("-");
  const agent = getAgent(toolName);
  const AgentIcon = agent.icon;
  const done = part.state === "output-available";
  const errored = part.state === "output-error";

  return (
    <div
      className={cn(
        "rounded-lg border-2 overflow-hidden bg-background",
        errored
          ? "border-destructive/40"
          : done
          ? "border-amber-500/30"
          : "border-amber-500/20 animate-pulse"
      )}
    >
      {/* Agent identity bar */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-500/5 border-b border-amber-500/20">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
          <AgentIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight truncate">
            {agent.label}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono truncate">
            {agent.role} · <code>{toolName}()</code>
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {agent.mutates && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-400 inline-flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              MUTATES
            </span>
          )}
          <span
            className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold",
              errored
                ? "bg-destructive/15 text-destructive"
                : done
                ? "bg-success/15 text-success"
                : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
            )}
          >
            {part.state}
          </span>
        </div>
      </div>

      {/* IO rows */}
      <div className="divide-y">
        <IORow
          direction="in"
          label="INPUT"
          arabic="مدخلات"
          data={part.input}
          devMode={devMode}
        />
        {(done || errored) && (
          <IORow
            direction="out"
            label={errored ? "ERROR" : "OUTPUT"}
            arabic={errored ? "خطأ" : "مخرجات"}
            data={errored ? part.errorText : part.output}
            devMode={devMode}
            errored={errored}
          />
        )}
      </div>
    </div>
  );
}

function IORow({
  direction,
  label,
  arabic,
  data,
  devMode,
  errored = false,
}: {
  direction: "in" | "out";
  label: string;
  arabic: string;
  data: unknown;
  devMode: boolean;
  errored?: boolean;
}) {
  const [open, setOpen] = useState(devMode);
  useEffect(() => {
    setOpen(devMode);
  }, [devMode]);

  return (
    <div className="px-2.5 py-1.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-1 shrink-0",
            errored
              ? "bg-destructive/15 text-destructive"
              : direction === "in"
              ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
              : "bg-success/15 text-success"
          )}
        >
          {direction === "in" ? "→" : "←"} {label}
        </span>
        <span className="text-[10px] text-muted-foreground">{arabic}</span>
        <code className="text-[10px] font-mono text-muted-foreground truncate flex-1 min-w-0">
          {inlineJson(data)}
        </code>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[9px] font-mono text-primary hover:underline shrink-0"
        >
          {open ? "إخفاء" : "عرض"}
        </button>
      </div>
      {open && (
        <div className="mt-1.5">
          {typeof data === "string" ? (
            <pre className="text-[11px] bg-muted/50 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">
              {data}
            </pre>
          ) : (
            <PrettyJson data={data} />
          )}
        </div>
      )}
    </div>
  );
}

function FinalCard({
  text,
  action,
}: {
  text: string;
  action: ReturnType<typeof inferAction>;
}) {
  return (
    <div className="rounded-lg border-2 border-success/40 bg-success/5 overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-success/10 border-b border-success/30">
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        <span className="text-[11px] font-bold text-success">
          {action ? "إجراء مُنفّذ + رد على المستخدم" : "إجابة المستخدم"}
        </span>
        {action && (
          <code className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-success/15 text-success">
            {action.kind}
          </code>
        )}
      </div>
      {action && (
        <div className="px-2.5 py-1.5 bg-success/5 border-b border-success/20 text-[11px] flex items-start gap-1.5">
          <Target className="h-3 w-3 text-success mt-0.5 shrink-0" />
          <span>{action.summary}</span>
        </div>
      )}
      <div className="p-3 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function HudPill({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "primary" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-background shrink-0",
        tone === "primary" && "border-primary/40 text-primary",
        tone === "danger" && "border-destructive/40 text-destructive"
      )}
    >
      {icon}
      <span className="text-muted-foreground">{label}=</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RawMessageJson({ message }: { message: any }) {
  return (
    <Collapsible className="mt-2 rounded-lg border border-dashed bg-muted/20">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition">
        <span className="flex items-center gap-1.5">
          <Code2 className="h-3 w-3" />
          raw UIMessage · {message.parts.length} parts · role={message.role}
        </span>
        <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">
        <pre className="text-[10px] bg-background border rounded p-2 overflow-x-auto max-h-64 font-mono leading-relaxed">
          {JSON.stringify(message, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
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
