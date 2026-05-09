# Raed — Agentic HR Assistant

> Arabic-first, RTL HR copilot. Two surfaces: a polished **demo** (`/`) and a **real working agent** (`/real`).

This README is written for hackathon judges. It is intentionally honest about what is **real AI** vs **scripted UX simulation**, and answers — per agent — the four recurring questions: *which orchestrator, which vector DB, which LLM, and how was any ML model trained?*

---

## 1. What it is

Raed is an HR assistant for Saudi enterprises. An employee asks for a salary letter, a leave, or a policy in Arabic; the agent plans, calls tools, asks the human for approval on sensitive steps, and returns a result. Managers get a parallel surface for batch approvals, ROI, and red-flag signals.

## 2. Two surfaces

| Surface | Route | What it is | Status |
|---|---|---|---|
| **Demo** | `/` | Product-vision UX: chat, agent plans, manager dashboard, governance, sentiment, ROI | **Simulated** — scripted logic, hardcoded fixtures |
| **Real agent** | `/real` | Live multi-tool agent: streaming chat, tool calls visible inline, threads | **Real** — Vercel AI SDK + Lovable AI Gateway |

Why two? The demo shows where the product is going (governance, red-flags, sentiment radar, ROI). `/real` shows the agent backbone we have already built. The roadmap is to converge them — replace each scripted block on `/` with a real tool on the `/real` agent.

## 3. Tech stack at a glance

| Layer | Choice |
|---|---|
| Frontend | React 18 · Vite 5 · TypeScript · Tailwind · shadcn/ui · RTL-first |
| Real agent runtime | Supabase Edge Function (Deno) |
| Agent SDK | **Vercel AI SDK** (`ai@6`) — `streamText`, `tool()`, `stepCountIs` |
| LLM provider | **Lovable AI Gateway** (OpenAI-compatible) |
| LLM model | **`google/gemini-2.5-flash`** |
| Provider adapter | `@ai-sdk/openai-compatible` |
| Schema validation | `zod@4` |
| UI for agent | AI Elements (`Conversation`, `Message`, `Tool`, `PromptInput`) |
| State on `/real` | `@ai-sdk/react` `useChat` + in-memory threads |
| Backend (managed) | Supabase (Postgres, Auth, Edge Functions, Email) |
| Email (real) | Lovable Emails — `send-transactional-email` edge function |

## 4. Architecture (high level)

```text
 Browser (/real)                 Edge Function                 Lovable AI Gateway
 ┌──────────────┐  POST /raed-  ┌────────────────────┐  HTTPS  ┌──────────────────┐
 │ useChat()    │──messages────▶│  streamText({      │────────▶│ google/gemini-   │
 │ AI Elements  │  (UIMessage)  │    model, tools,   │         │  2.5-flash       │
 │ Tool blocks  │◀──UI stream───│    stopWhen: 50 }) │◀────────│                  │
 └──────────────┘               │   ┌──────────────┐ │         └──────────────────┘
                                │   │ 5 tools (zod)│ │
                                │   └──────────────┘ │
                                └────────────────────┘
                                       │
                                       ▼  (current: in-memory)
                                 mock employee + 4 policies
                                 (RAG-ready slot for pgvector)
```

---

## 5. The Agents

We document **5 agents** below. For each one: role, file, how it actually decides, and per-agent answers to the four judge questions.

---

### 5.1 Raed Real Agent — the only true LLM agent

- **Role**: Conversational HR agent. Plans, calls tools, streams back natural-language answers in Arabic.
- **Where it lives**: `supabase/functions/raed-agent/index.ts`, UI in `src/pages/Real.tsx`.
- **How it decides**:
  - `streamText({ model, tools, stopWhen: stepCountIs(50) })` runs a multi-step **tool-calling loop**. The LLM picks the next tool from its schema, the function executes, the result is fed back, the LLM either calls another tool or writes the final answer.
  - 5 real tools, each with a `zod` `inputSchema` and an `execute()`:
    - `getEmployeeProfile` — returns the current employee.
    - `searchPolicy` — keyword search over a small policy array.
    - `requestLeave` — drafts a leave request, status `pending_manager_approval` (human-in-the-loop).
    - `issueSalaryCertificate` — produces a signed certificate metadata object.
    - `simulateSalaryChange` — computes net, GOSI, end-of-service per Saudi labor law.
  - System prompt enforces: Arabic, never fabricate, prefer tools over guessing.
- **Per-agent answers**:
  - **Orchestrator framework**: **Vercel AI SDK** (`npm:ai@6.0.177`). The agent loop is `streamText` + `stopWhen: stepCountIs(50)`. No LangChain, no custom router.
  - **Vector DB**: **None today.** `searchPolicy` does `String.includes` over 4 in-memory policies. Honest framing: *RAG-ready, not RAG-yet*. Upgrade path = move policies to Postgres + pgvector and swap the tool's `execute()` to a similarity query — the agent loop does not change.
  - **LLM**: provider = **Lovable AI Gateway** (OpenAI-compatible endpoint at `https://ai.gateway.lovable.dev/v1`, adapter `@ai-sdk/openai-compatible`). Model = **`google/gemini-2.5-flash`**. Picked for: low latency on tool-calling, strong Arabic, gateway cost.
  - **ML prediction**: **None.** This agent is pure LLM tool-calling — no trained classifier, no embeddings model deployed yet.

**Why this counts as an agent (not just a function call):**
1. **Autonomy** — chooses *which* tool to call, in *what order*, *how many times* (up to 50 steps).
2. **Tool use** — five typed tools, schema-validated.
3. **Stateful loop** — each tool result is fed back into the next decision.
4. **Human-in-the-loop** — sensitive actions return a `pending_manager_approval` status the UI must confirm.

---

### 5.2 Chat Triage Agent (demo) — *simulated*

- **Role**: Single-turn router on `/` that turns user text into a scripted reply or an `AgentPlan` card.
- **Where it lives**: `src/components/ChatPanel.tsx` — `generateReply`, `isInScope`, `isPrivacyRisk`.
- **How it decides**: Arabic keyword matching + a regex privacy guardrail. No LLM is called.
- **Per-agent answers**:
  - Orchestrator: **none** — plain `if/else`.
  - Vector DB: **none**.
  - LLM: **none**.
  - ML: **none**.
- **Honest label**: this is **simulated agent UX**, kept because it lets us prototype the conversation shape before wiring every branch to the real agent.

---

### 5.3 Plan Executor Agent (demo) — *simulated state machine*

- **Role**: Renders a multi-step plan card that ticks itself forward and pauses on steps that need human approval.
- **Where it lives**: `src/components/AgentPlan.tsx` (+ fixtures in `src/data/hrData.ts`, `samplePlans`).
- **How it decides**: React state machine, `pending → active → done`, auto-advances every **1400 ms** via `setTimeout`. Stops when it hits a `needs_approval` step until the user clicks "Approve".
- **Per-agent answers**:
  - Orchestrator: **local React state**.
  - Vector DB / LLM / ML: **none**.
- This component exists to **demo the human-in-the-loop UX** that the real agent already supports through tool outputs like `pending_manager_approval`.

---

### 5.4 Manager Approval Agent (demo) — *fixture-driven*

- **Role**: Shows pending HR requests with an "AI recommendation" (`approve` / `review` / `reject`) and an Arabic summary.
- **Where it lives**: `src/components/ManagerView.tsx`, fixtures in `pendingApprovals` (`src/data/hrData.ts`).
- **How it decides**: `aiRecommendation`, `aiSummary`, and `aiReasoning` are **hardcoded** in the fixtures. "Bulk approve safe" filters by `aiRecommendation === "approve"`.
- **Per-agent answers**:
  - Orchestrator / LLM / Vector DB: **none**.
  - ML: **none today**. To make this real, we would call the Raed Real Agent with a new `recommendApproval` tool that takes `{ requestType, requesterTenure, leaveBalance, policyContext }` and returns a structured `{ recommendation, confidence, reasons[] }` object — Gemini handles this well with a constrained `zod` output schema.

---

### 5.5 Analytics & Signals (demo) — *charts on fixed data*

- **Role**: ROI tracker, sentiment radar, red-flags banner.
- **Where it lives**: `src/components/ROITracker.tsx`, `SentimentRadar.tsx`, `RedFlagsAlert.tsx`. Data from `src/data/hrData.ts`.
- **How it decides**: Recharts rendering of pre-computed numbers. **No model.**
- **What a real ML version would need**:
  - **Attrition / red-flag classifier**: ≥6 months of HRIS data per employee — tenure, leave patterns, perf scores, manager changes, salary delta — labeled by `left_within_6mo`. Baseline = gradient-boosted trees (XGBoost / LightGBM). Served as a Supabase edge function returning `{ risk: 0..1, top_features[] }`.
  - **Sentiment radar**: requires opt-in pulse-survey text → Gemini classification with a fixed taxonomy (`workload`, `manager`, `growth`, `comp`, `culture`).
  - Neither is trained today.

---

## 6. Judge FAQ — fast answers

### Per-agent table

| Question | 5.1 Real Agent | 5.2 Triage | 5.3 Plan Exec | 5.4 Mgr Approval | 5.5 Analytics |
|---|---|---|---|---|---|
| Orchestrator framework | Vercel AI SDK | none (rules) | React state machine | none (fixtures) | none |
| Vector DB | none (in-memory; pgvector-ready) | none | none | none | none |
| LLM provider | Lovable AI Gateway | — | — | — | — |
| LLM model | `google/gemini-2.5-flash` | — | — | — | — |
| ML model trained? | no — pure tool-calling | no | no | no | no (roadmap: GBM) |

### Common follow-ups

- **"Is each one really an agent?"** Only **5.1** satisfies the strict definition (autonomy + tool use + decision loop). The others are **agentic UX simulations** that exist to communicate the product vision; we ship them clearly labeled.
- **"Where is the loop / who picks the next tool?"** `streamText` in `supabase/functions/raed-agent/index.ts`, with `stopWhen: stepCountIs(50)`. The model picks; the runtime executes; results feed back.
- **"How do you prevent unsafe actions?"** Tool outputs return statuses like `pending_manager_approval`; the UI gates execution. The demo `AgentPlan` mirrors this with `needs_approval` steps.
- **"Why no vector DB yet?"** Policy corpus is 4 documents — keyword search is honestly enough. The tool boundary is designed so swapping in pgvector is a one-file change.
- **"Why Gemini 2.5 Flash and not GPT-5?"** Latency on tool-calling, Arabic quality, and Lovable Gateway cost. The provider is OpenAI-compatible, so swapping is a single string change in `raed-agent/index.ts`.
- **"Cost / rate-limit handling?"** Gateway returns `402` (credits) and `429` (rate). Surfaced via `error` from `useChat` on `/real`.
- **"Data privacy?"** No real PII. One mock employee. Production path uses Supabase RLS (already enabled on the project) with `user_id` foreign keys.

---

## 7. Run locally

```bash
bun install
bun dev
```

- `/` — demo surface (works offline, no keys needed)
- `/real` — calls the deployed `raed-agent` edge function. `LOVABLE_API_KEY` is already provisioned by Lovable Cloud.

---

## 8. Known limitations & roadmap

| Today | Next |
|---|---|
| `searchPolicy` is in-memory keyword | pgvector + embeddings (`text-embedding-*`) |
| Single mock employee | Supabase `employees` table + RLS, auth-gated |
| Manager recommendations are fixtures | New `recommendApproval` tool on the real agent (structured `zod` output) |
| Red-flag signals are static | XGBoost classifier on HRIS data, served from edge function |
| `/` and `/real` are separate | Merge — `/` UX powered end-to-end by the real agent |
| Salary letter email is real but to a fixed inbox | Per-employee delivery via Supabase Auth identity |

---

**TL;DR for judges**: We have one real agent (`/real`, Vercel AI SDK + Gemini 2.5 Flash + 5 tools through Lovable AI Gateway) and a richer simulated UX (`/`) that shows where the agent is heading. No vector DB and no trained ML model yet — both have a one-file integration path, and we are honest about it.
