## Goal

Rewrite `README.md` (in English) so a hackathon judge can quickly understand:
1. What "Raed" actually is and which parts are real vs simulated.
2. Each "agent" in the system, what it does, the real packages/files behind it, and — per agent — answers to four recurring judge questions:
   - Orchestration framework
   - Vector database
   - LLM provider + model
   - How any "ML prediction" was trained and on what data

The tone is technical but light — short sections, bullet lists, and direct file references. No marketing fluff.

## Honest framing

The project ships **two surfaces** and the README will say so explicitly:

- **`/` — Demo surface (simulated agentic UX)**: `ChatPanel.tsx`, `AgentPlan.tsx`, `ManagerView.tsx`, `AgentActivityFeed.tsx`. Decisions are scripted (`if/else` keyword matching, `setTimeout` step advancement, hardcoded `aiRecommendation` in `hrData.ts`). No LLM call, no vector DB, no trained model.
- **`/real` — Real agentic surface**: `src/pages/Real.tsx` + `supabase/functions/raed-agent/index.ts`. Vercel AI SDK agent loop (`streamText` + `stopWhen: stepCountIs(50)`) with 5 real `tool()` definitions, calling `google/gemini-2.5-flash` through Lovable AI Gateway.

Being upfront about this is the right answer for judges and removes risk of being caught overclaiming.

## README structure (new file)

```text
# Raed — Agentic HR Assistant (Arabic, RTL)

1. What it is (3 lines)
2. Two surfaces: /demo and /real (table)
3. Tech stack at a glance (table)
4. Architecture diagram (ASCII, ~10 lines)
5. The Agents — one section per agent
6. Judge FAQ (global answers + per-agent quick table)
7. Run locally
8. Known limitations & roadmap
```

### Per-agent section template

For each agent, four short blocks:

- **Role** — one sentence
- **Where it lives** — file path(s) with line refs
- **How it decides** — the actual logic (be honest: keyword routing, LLM tool-calling, scripted state machine, etc.)
- **Per-agent answers** to the four judge questions (Orchestrator / Vector DB / LLM / ML training)

### Agents to document (5)

1. **Raed Real Agent** (`/real`)
   - File: `supabase/functions/raed-agent/index.ts`
   - Logic: AI SDK `streamText` loop, 5 tools (`getEmployeeProfile`, `searchPolicy`, `requestLeave`, `issueSalaryCertificate`, `simulateSalaryChange`).
   - Orchestrator: **Vercel AI SDK** (`npm:ai@6`) — multi-step tool-calling loop via `stopWhen: stepCountIs(50)`.
   - Vector DB: **none** — `searchPolicy` does in-memory `String.includes` over a 4-row policy array. Honest note: "RAG-ready, not RAG-yet".
   - LLM: `google/gemini-2.5-flash` via **Lovable AI Gateway** (OpenAI-compatible adapter, `@ai-sdk/openai-compatible`).
   - ML training: none — pure LLM tool-calling.

2. **Chat Triage Agent** (demo)
   - File: `src/components/ChatPanel.tsx` (`generateReply`, `isInScope`, `isPrivacyRisk`).
   - Logic: Arabic keyword router → returns a scripted reply or a pre-built `AgentPlan`. Privacy guardrail is a regex.
   - Orchestrator / Vector DB / LLM / ML: **none — rule-based simulation** (clearly stated).

3. **Plan Executor Agent** (demo)
   - File: `src/components/AgentPlan.tsx` + `src/data/hrData.ts` (`samplePlans`).
   - Logic: state machine `pending → active → done`, auto-advances every 1400 ms, pauses on `needs_approval` (human-in-the-loop UX).
   - Orchestrator: local React state machine. No LLM, no vector DB.

4. **Manager Approval Agent** (demo)
   - File: `src/components/ManagerView.tsx` + `pendingApprovals` in `hrData.ts`.
   - Logic: `aiRecommendation` and `aiSummary` are **hardcoded fixtures**. Bulk-approve filters by recommendation field.
   - LLM/ML: none — fixtures designed to demo the UX of a recommendation agent.

5. **Analytics / Sentiment / Red-Flags signals**
   - Files: `ROITracker.tsx`, `SentimentRadar.tsx`, `RedFlagsAlert.tsx`.
   - Logic: render pre-computed values from `hrData.ts` (Recharts).
   - ML: none today. README will state which inputs a real model would need (sample size, features, target).

### Judge FAQ block (global, plus a small per-agent table)

A compact Q&A so judges find the answer in 5 seconds:

| Question | `/real` agent | `/demo` agents |
|---|---|---|
| Orchestrator framework | Vercel AI SDK (`npm:ai`) | None — React state + rules |
| Vector DB | None (in-memory policy array; ready to plug pgvector) | None |
| LLM provider | Lovable AI Gateway | None |
| LLM model | `google/gemini-2.5-flash` | None |
| ML prediction | None — LLM tool-calling only | None — fixtures |

Below the table, 2–3 sentences each on:
- **Why no vector DB yet**: tiny policy corpus (4 docs); upgrade path = pgvector + `searchPolicy` swapped to a similarity query, no agent-loop changes needed.
- **Why Gemini 2.5 Flash**: low latency for tool-calling, Arabic quality, Lovable Gateway cost.
- **What an ML upgrade would look like**: e.g. an attrition-risk classifier feeding `RedFlagsAlert` — would need ≥6 months of HRIS data (tenure, leave patterns, perf scores, manager changes) and a gradient-boosted baseline.

### Likely judge questions to pre-empt (added as a final section)

- "Is each agent really an agent, or just a function?" → table mapping each agent to the **agentic property** it satisfies (autonomy, tool use, planning, human-in-the-loop) and the ones it doesn't.
- "Where is the loop / who decides the next tool?" → point at `streamText` + `stopWhen` in `raed-agent/index.ts`.
- "How do you prevent unsafe actions?" → tool definitions return `pending_manager_approval` status; UI requires explicit confirm; demo `AgentPlan` blocks on `needs_approval`.
- "Why two surfaces?" → demo = product-vision UX; `/real` = working agent backbone — convergence on the roadmap.
- "Cost / rate-limit handling?" → Lovable AI Gateway returns 402/429; surfaced via `error` from `useChat`.
- "Data privacy?" → mock employee only, no PII; production path = Supabase RLS (already enabled on the project).

## Files to touch

- `README.md` — full rewrite in English, ~250–350 lines.
- No code changes.

## One open question

The current README is a single TODO line. Should I:
- **(A)** Keep it 100% English (recommended for judges), or
- **(B)** English primary + a short Arabic TL;DR at the top?
