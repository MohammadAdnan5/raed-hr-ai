import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Mock HR data store (in-memory per invocation) ---
const EMPLOYEE = {
  id: "EMP-1042",
  name: "خالد العتيبي",
  role: "مهندس برمجيات أول",
  department: "الهندسة",
  joinDate: "2021-03-14",
  salary: 22000,
  manager: "م. أحمد القحطاني",
  leaveBalance: { annual: 13, sick: 28, emergency: 4 },
  email: "Alz3bei.mohammad2022@gmail.com",
};

const POLICIES = [
  { id: "P-01", title: "سياسة الإجازة السنوية", body: "للموظف 21 يوم إجازة سنوية مدفوعة، تُحتسب من تاريخ التعيين، وتُجدّد في يناير كل عام." },
  { id: "P-02", title: "سياسة العمل عن بُعد", body: "يُسمح بيومين عن بُعد أسبوعياً بموافقة المدير المباشر، شرط حضور اجتماعات الفريق الأساسية." },
  { id: "P-03", title: "سياسة خطاب تعريف بالراتب", body: "يُصدر خطاب التعريف خلال 10 دقائق إلكترونياً، ويوقّع رقمياً من إدارة الموارد البشرية." },
  { id: "P-04", title: "سياسة نهاية الخدمة", body: "تُحتسب مكافأة نهاية الخدمة وفق نظام العمل السعودي: نصف شهر عن أول 5 سنوات وشهر كامل عن كل سنة بعدها." },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-2.5-flash");

    const tools = {
      getEmployeeProfile: tool({
        description:
          "يُرجع الملف الشخصي للموظف الحالي (الاسم، القسم، تاريخ التعيين، الراتب، رصيد الإجازات).",
        inputSchema: z.object({}),
        execute: async () => EMPLOYEE,
      }),

      searchPolicy: tool({
        description:
          "يبحث في سياسات الموارد البشرية بكلمة مفتاحية ويُرجع السياسات المطابقة.",
        inputSchema: z.object({
          query: z.string().describe("الكلمة المفتاحية للبحث في السياسات"),
        }),
        execute: async ({ query }) => {
          const q = query.toLowerCase();
          const hits = POLICIES.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.body.toLowerCase().includes(q)
          );
          return { count: hits.length, results: hits.length ? hits : POLICIES };
        },
      }),

      requestLeave: tool({
        description:
          "يُقدّم طلب إجازة للموظف. يحتاج موافقة بشرية قبل التنفيذ.",
        inputSchema: z.object({
          type: z.enum(["annual", "sick", "emergency", "unpaid"]),
          startDate: z.string().describe("تاريخ البداية YYYY-MM-DD"),
          endDate: z.string().describe("تاريخ النهاية YYYY-MM-DD"),
          reason: z.string().optional(),
        }),
        execute: async ({ type, startDate, endDate, reason }) => {
          const days =
            Math.round(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                86400000
            ) + 1;
          return {
            requestId: `REQ-${Math.floor(2000 + Math.random() * 1000)}`,
            status: "pending_manager_approval",
            type,
            startDate,
            endDate,
            days,
            reason: reason ?? "—",
            sentTo: EMPLOYEE.manager,
          };
        },
      }),

      issueSalaryCertificate: tool({
        description:
          "يُصدر خطاب تعريف بالراتب موجّهاً إلى جهة معيّنة (بنك/سفارة/جهة حكومية).",
        inputSchema: z.object({
          recipient: z.string().describe("الجهة المستفيدة، مثل: البنك الأهلي"),
          language: z.enum(["ar", "en"]).default("ar"),
        }),
        execute: async ({ recipient, language }) => {
          return {
            documentId: `DOC-${Math.floor(2050 + Math.random() * 50)}`,
            type: "خطاب تعريف بالراتب",
            recipient,
            language,
            status: "ready",
            signedBy: "إدارة الموارد البشرية - راعد",
            deliveredTo: EMPLOYEE.email,
            issuedAt: new Date().toISOString(),
          };
        },
      }),

      simulateSalaryChange: tool({
        description:
          "يُحاكي تأثير تغيير راتب أو علاوة على الصافي الشهري والسنوي ومكافأة نهاية الخدمة.",
        inputSchema: z.object({
          newGrossSalary: z.number().describe("الراتب الإجمالي الجديد بالريال"),
          yearsOfService: z.number().min(0).default(3),
        }),
        execute: async ({ newGrossSalary, yearsOfService }) => {
          const gosi = Math.round(newGrossSalary * 0.1);
          const net = newGrossSalary - gosi;
          const eos =
            yearsOfService <= 5
              ? (newGrossSalary / 2) * yearsOfService
              : (newGrossSalary / 2) * 5 + newGrossSalary * (yearsOfService - 5);
          return {
            currency: "SAR",
            gross: newGrossSalary,
            gosi,
            net,
            yearly: net * 12,
            endOfServiceReward: Math.round(eos),
            comparedToCurrent: newGrossSalary - EMPLOYEE.salary,
          };
        },
      }),
    };

    const result = streamText({
      model,
      system: `أنت "راعد" — وكيل ذكي للموارد البشرية في شركة سعودية.
- تُجيب باللغة العربية الفصحى المبسّطة، بنبرة ودودة ومهنية.
- استخدم الأدوات المتاحة (tools) كلما احتاج المستخدم بيانات أو إجراءً فعلياً، ولا تختلق المعلومات.
- قبل تنفيذ أي إجراء حسّاس (طلب إجازة، إصدار خطاب)، استدعِ الأداة مباشرة — الواجهة تعرض النتيجة للمستخدم.
- اشرح خطواتك بإيجاز قبل وبعد استدعاء الأداة.
- معلومات الموظف الحالي يمكن جلبها عبر getEmployeeProfile.`,
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(50),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (e) {
    console.error("raed-agent error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
