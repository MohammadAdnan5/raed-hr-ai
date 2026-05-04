import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  MonitorSmartphone,
  Server,
  BrainCircuit,
  Database,
  Wrench,
  ShieldCheck,
  Sparkles,
  Workflow,
  Bot,
  Cpu,
  GitBranch,
  Network,
  Lock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Custom Node ---------- */
type NodeKind = "ui" | "gateway" | "orchestrator" | "agent" | "tool" | "data" | "guard";

const KIND_STYLE: Record<
  NodeKind,
  { icon: typeof Bot; tint: string; ring: string; glow: string; label: string }
> = {
  ui:           { icon: MonitorSmartphone, tint: "from-sky-500/20 to-sky-500/5",      ring: "ring-sky-400/40",      glow: "shadow-[0_0_40px_-10px_hsl(200_90%_60%/0.6)]",  label: "واجهة" },
  gateway:      { icon: Server,            tint: "from-violet-500/20 to-violet-500/5",ring: "ring-violet-400/40",   glow: "shadow-[0_0_40px_-10px_hsl(265_90%_65%/0.6)]",  label: "بوابة" },
  orchestrator: { icon: BrainCircuit,      tint: "from-primary/30 to-primary/5",      ring: "ring-primary/50",      glow: "shadow-[0_0_60px_-10px_hsl(var(--primary)/0.55)]", label: "منسّق" },
  agent:        { icon: Bot,               tint: "from-amber-500/20 to-amber-500/5",  ring: "ring-amber-400/40",    glow: "shadow-[0_0_40px_-10px_hsl(40_95%_60%/0.6)]",   label: "وكيل" },
  tool:         { icon: Wrench,            tint: "from-emerald-500/20 to-emerald-500/5",ring: "ring-emerald-400/40",glow: "shadow-[0_0_40px_-10px_hsl(150_70%_55%/0.6)]",  label: "أداة" },
  data:         { icon: Database,          tint: "from-cyan-500/20 to-cyan-500/5",    ring: "ring-cyan-400/40",     glow: "shadow-[0_0_40px_-10px_hsl(190_90%_55%/0.55)]", label: "بيانات" },
  guard:        { icon: ShieldCheck,       tint: "from-rose-500/20 to-rose-500/5",    ring: "ring-rose-400/40",     glow: "shadow-[0_0_40px_-10px_hsl(350_90%_60%/0.55)]", label: "حوكمة" },
};

type NodeData = {
  title: string;
  subtitle?: string;
  kind: NodeKind;
  icon?: typeof Bot;
};

function ArchNode({ data }: NodeProps) {
  const d = data as unknown as NodeData;
  const style = KIND_STYLE[d.kind];
  const Icon = d.icon ?? style.icon;
  return (
    <div
      dir="rtl"
      className={cn(
        "group relative w-[200px] rounded-2xl border border-white/10 bg-gradient-to-br backdrop-blur-md p-3 ring-1 transition-all",
        style.tint,
        style.ring,
        style.glow,
        "hover:scale-[1.03]"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/40 !border-0 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-white/40 !border-0 !w-2 !h-2" />
      <Handle type="target" position={Position.Top} className="!bg-white/40 !border-0 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/40 !border-0 !w-2 !h-2" />

      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-white/50">{style.label}</p>
          <p className="text-[13px] font-bold text-white leading-tight truncate">{d.title}</p>
        </div>
      </div>
      {d.subtitle && (
        <p className="mt-2 text-[11px] text-white/60 leading-relaxed line-clamp-2">{d.subtitle}</p>
      )}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

const nodeTypes = { arch: ArchNode };

/* ---------- Diagram Data ---------- */
function useArchGraph(): { nodes: Node[]; edges: Edge[] } {
  return useMemo(() => {
    const nodes: Node[] = [
      { id: "ui",     type: "arch", position: { x: 40,   y: 260 }, data: { kind: "ui",           title: "واجهة رائد",         subtitle: "React 18 · Vite · Tailwind · RTL", icon: MonitorSmartphone } },
      { id: "gw",     type: "arch", position: { x: 300,  y: 260 }, data: { kind: "gateway",      title: "بوابة API الآمنة",   subtitle: "Auth · Rate-limit · Audit", icon: Lock } },
      { id: "orch",   type: "arch", position: { x: 580,  y: 260 }, data: { kind: "orchestrator", title: "منسّق الوكلاء",       subtitle: "تخطيط · توجيه · ذاكرة سياق", icon: Workflow } },

      { id: "a1",     type: "arch", position: { x: 880,  y: 60  }, data: { kind: "agent",        title: "وكيل الطلبات",        subtitle: "إجازات · مستندات · صرف", icon: Bot } },
      { id: "a2",     type: "arch", position: { x: 880,  y: 200 }, data: { kind: "agent",        title: "وكيل التحليلات",      subtitle: "ROI · مزاج · كشف انحراف", icon: Sparkles } },
      { id: "a3",     type: "arch", position: { x: 880,  y: 340 }, data: { kind: "agent",        title: "وكيل الحوكمة",        subtitle: "قواعد الاعتماد التلقائي", icon: GitBranch } },
      { id: "a4",     type: "arch", position: { x: 880,  y: 480 }, data: { kind: "agent",        title: "وكيل الإرشاد",        subtitle: "رفيق التأهيل 90 يوم", icon: Cpu } },

      { id: "t1",     type: "arch", position: { x: 1180, y: 60  }, data: { kind: "tool",         title: "محرك السياسات",       subtitle: "RAG على لوائح HR", icon: Layers } },
      { id: "t2",     type: "arch", position: { x: 1180, y: 200 }, data: { kind: "tool",         title: "نموذج التنبؤ",         subtitle: "LLM + ML للقرار", icon: BrainCircuit } },
      { id: "t3",     type: "arch", position: { x: 1180, y: 340 }, data: { kind: "guard",        title: "طبقة الحوكمة",         subtitle: "Explainability · Red-Flags", icon: ShieldCheck } },
      { id: "t4",     type: "arch", position: { x: 1180, y: 480 }, data: { kind: "data",         title: "قاعدة البيانات",       subtitle: "Postgres · RLS · Vector", icon: Database } },

      { id: "back",   type: "arch", position: { x: 580,  y: 540 }, data: { kind: "orchestrator", title: "قرار + شرح",          subtitle: "JSON موقّع يعود للواجهة", icon: Network } },
    ];

    const edge = (id: string, source: string, target: string, color = "hsl(var(--primary))"): Edge => ({
      id, source, target,
      animated: true,
      style: { stroke: color, strokeWidth: 1.6, opacity: 0.85 },
    });

    const edges: Edge[] = [
      edge("e1", "ui", "gw"),
      edge("e2", "gw", "orch"),
      edge("e3a", "orch", "a1", "hsl(40 95% 60%)"),
      edge("e3b", "orch", "a2", "hsl(40 95% 60%)"),
      edge("e3c", "orch", "a3", "hsl(40 95% 60%)"),
      edge("e3d", "orch", "a4", "hsl(40 95% 60%)"),
      edge("e4a", "a1", "t1", "hsl(150 70% 55%)"),
      edge("e4b", "a2", "t2", "hsl(150 70% 55%)"),
      edge("e4c", "a3", "t3", "hsl(150 70% 55%)"),
      edge("e4d", "a4", "t4", "hsl(150 70% 55%)"),
      edge("e5a", "a1", "back", "hsl(190 90% 55%)"),
      edge("e5b", "a2", "back", "hsl(190 90% 55%)"),
      edge("e5c", "a3", "back", "hsl(190 90% 55%)"),
      edge("e5d", "a4", "back", "hsl(190 90% 55%)"),
      edge("e6", "back", "ui", "hsl(var(--primary))"),
    ];

    return { nodes, edges };
  }, []);
}

/* ---------- Concept Cards ---------- */
const PILLARS = [
  { icon: Bot,          title: "نظام متعدد الوكلاء (Multi-Agent)",  text: "منسّق مركزي يوجّه المهام لأربعة وكلاء متخصصين: الطلبات، التحليلات، الحوكمة، والتأهيل." },
  { icon: BrainCircuit, title: "اتخاذ قرار ذاتي مفسّر",              text: "كل قرار تلقائي يُرفق بسبب ومستوى ثقة وحدود مخاطر — قابل للمراجعة لحظياً." },
  { icon: ShieldCheck,  title: "حوكمة قبل التنفيذ",                  text: "قواعد حساسية (منخفضة/متوسطة/عالية) تحدد ما يُعتمد آلياً وما يُمرَّر للمدير." },
  { icon: Sparkles,     title: "تجربة استباقية",                      text: "كشف الإشارات الحمراء، تتبع المزاج، واقتراح الإجراءات قبل أن يطلبها المستخدم." },
];

const CAPS = [
  "اعتماد آلي للطلبات منخفضة المخاطر بثقة ≥ 92%",
  "محاكي «ماذا لو» لقرارات الميزانية والإجازات",
  "كشف الإشارات الحمراء (احتراق وظيفي · انحراف رواتب)",
  "رفيق التأهيل 90 يوم بمسارات تكيّفية",
  "تتبع ROI لحظي للأتمتة",
  "شرح كل قرار AI (Explainable AI)",
];

/* ---------- Main View ---------- */
export function ArchitectureView() {
  const { nodes, edges } = useArchGraph();

  return (
    <div dir="rtl" className="flex flex-col h-full bg-[#0b1020] text-white overflow-hidden">
      {/* ambient grid bg */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--primary)),transparent_40%)]" />

      {/* Header */}
      <div className="relative px-6 md:px-10 py-6 border-b border-white/10 bg-gradient-to-l from-primary/10 via-transparent to-violet-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/40">
            <Workflow className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Technical Blueprint</p>
            <h2 className="text-2xl md:text-3xl font-black">الهيكلية التقنية ومسار الوكيل</h2>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Concept side */}
        <aside className="lg:col-span-4 border-l border-white/10 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">Agentic Solution Concept</p>
            <h3 className="text-xl font-black mt-1">مفهوم الوكيل الذكي «رائد»</h3>
            <p className="text-sm text-white/65 leading-relaxed mt-2">
              «رائد» وكيل ذكي مؤسسي للموارد البشرية يحوّل HR من ردّ فعل إلى استباق.
              يفهم نية المستخدم بالعربية، يخطط خطوات التنفيذ، يستدعي الأدوات المناسبة،
              ويتخذ قرارات مفسّرة ضمن حدود حوكمة صارمة — كل ذلك في أقل من ثانيتين.
            </p>
          </div>

          <div className="space-y-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                    <p.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold">{p.title}</p>
                </div>
                <p className="text-[12px] text-white/60 mt-2 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-4">
            <p className="text-xs font-bold text-primary mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> القدرات الرئيسية
            </p>
            <ul className="space-y-1.5">
              {CAPS.map((c) => (
                <li key={c} className="text-[12px] text-white/75 flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              ["React 18", "Vite · TS"],
              ["Tailwind", "RTL-first"],
              ["LLM Gateway", "Lovable AI"],
              ["Postgres", "RLS · Vector"],
              ["RAG", "Policy Index"],
              ["Edge Funcs", "Serverless"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">{k}</p>
                <p className="font-bold mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Diagram */}
        <div className="lg:col-span-8 relative min-h-[520px]" dir="ltr">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            panOnScroll
            className="!bg-transparent"
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="rgba(255,255,255,0.08)" />
            <Controls className="!bg-white/10 !border-white/10 !text-white [&_button]:!bg-transparent [&_button]:!text-white [&_button]:!border-white/10" />
          </ReactFlow>

          {/* legend */}
          <div dir="rtl" className="absolute bottom-3 right-3 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur px-3 py-2 text-[10px]">
            {[
              ["طلب المستخدم", "hsl(var(--primary))"],
              ["تخطيط الوكلاء", "hsl(40 95% 60%)"],
              ["استدعاء الأدوات", "hsl(150 70% 55%)"],
              ["إعادة القرار", "hsl(190 90% 55%)"],
            ].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5 text-white/80">
                <span className="h-2 w-4 rounded-full" style={{ background: c as string }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
