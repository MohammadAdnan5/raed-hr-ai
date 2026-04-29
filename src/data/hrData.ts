// Demo data — front-end only POC for Smart HR Assistant
export type Role = "employee" | "manager";

export type LeaveType = "annual" | "sick" | "emergency" | "unpaid";

export const leaveBalances = {
  annual: { used: 8, total: 21, label: "إجازة سنوية" },
  sick: { used: 2, total: 30, label: "إجازة مرضية" },
  emergency: { used: 1, total: 5, label: "إجازة طارئة" },
};

export type RequestStatus = "pending" | "approved" | "rejected" | "in_progress";

export interface HRRequest {
  id: string;
  type: string;
  title: string;
  status: RequestStatus;
  date: string;
  details?: string;
  requester?: string;
  requesterRole?: string;
  aiSummary?: string;
  aiRecommendation?: "approve" | "review" | "reject";
  aiReasoning?: string[];
}

export const myRequests: HRRequest[] = [
  {
    id: "REQ-2041",
    type: "وثيقة",
    title: "خطاب تعريف بالراتب",
    status: "in_progress",
    date: "اليوم، ١٠:٢٤ ص",
    details: "موجه إلى البنك الأهلي",
  },
  {
    id: "REQ-2038",
    type: "إجازة",
    title: "إجازة سنوية — ٣ أيام",
    status: "approved",
    date: "أمس",
    details: "من ١٢ مايو إلى ١٤ مايو",
  },
  {
    id: "REQ-2031",
    type: "وثيقة",
    title: "شهادة عمل",
    status: "approved",
    date: "قبل ٣ أيام",
  },
  {
    id: "REQ-2025",
    type: "تحديث بيانات",
    title: "تحديث رقم الجوال",
    status: "approved",
    date: "الأسبوع الماضي",
  },
];

export const pendingApprovals: HRRequest[] = [
  {
    id: "REQ-2052",
    type: "إجازة سنوية",
    title: "طلب إجازة ٥ أيام",
    status: "pending",
    date: "منذ ١٢ دقيقة",
    requester: "نورة العتيبي",
    requesterRole: "مصممة منتج",
    details: "من ٢٠ مايو إلى ٢٤ مايو",
    aiSummary: "نورة لديها رصيد كافٍ (١٥ يوماً متاح)، ولا تتعارض إجازتها مع مواعيد التسليم القادمة، ولا أحد آخر في الفريق على إجازة بنفس الفترة.",
    aiRecommendation: "approve",
    aiReasoning: [
      "تحققتُ من رصيد الإجازة: ١٥ يوماً متاحة ✓",
      "راجعتُ تقويم الفريق: لا تعارض مع تسليمات حرجة ✓",
      "تحققتُ من تداخل الإجازات: لا أحد على إجازة بنفس الفترة ✓",
      "طبّقتُ سياسة الإجازات (المادة ٣): الطلب مطابق ✓",
    ],
  },
  {
    id: "REQ-2049",
    type: "عمل عن بُعد",
    title: "طلب عمل عن بُعد ليوم واحد",
    status: "pending",
    date: "منذ ساعة",
    requester: "خالد المطيري",
    requesterRole: "مهندس برمجيات",
    details: "يوم الخميس ١٦ مايو",
    aiSummary: "خالد استخدم ٣ من أصل ٤ أيام عمل عن بُعد المسموحة شهرياً. لا اجتماعات حضورية مجدولة في ذلك اليوم.",
    aiRecommendation: "approve",
    aiReasoning: [
      "رصيد العمل عن بُعد: ١ يوم متبقٍ هذا الشهر ✓",
      "لا اجتماعات حضورية مجدولة ✓",
      "أداء آخر ٣٠ يوم: ضمن المتوسط ✓",
    ],
  },
  {
    id: "REQ-2047",
    type: "وثيقة",
    title: "تأييد رسمي للحصول على تأشيرة",
    status: "pending",
    date: "منذ ٣ ساعات",
    requester: "ريم الزهراني",
    requesterRole: "محللة بيانات",
    aiSummary: "طلب وثيقة قياسي. جهّزتُ المسودة تلقائياً وفق القالب المعتمد، بانتظار اعتمادك للتوقيع الإلكتروني.",
    aiRecommendation: "approve",
    aiReasoning: [
      "تم إنشاء المسودة من القالب المعتمد ✓",
      "تم التحقق من بيانات الموظفة ✓",
      "جاهز للتوقيع الإلكتروني فور الاعتماد ✓",
    ],
  },
];

export const quickActions = [
  { id: "leave", label: "تقديم إجازة", icon: "calendar", description: "سنوية، مرضية، طارئة" },
  { id: "doc", label: "طلب وثيقة", icon: "file", description: "تعريف، شهادة، تأييد" },
  { id: "policy", label: "اسأل عن سياسة", icon: "book", description: "إجازات، حضور، مزايا" },
  { id: "salary", label: "كشف الراتب", icon: "wallet", description: "آخر شهر متاح" },
];

export const policySnippets = [
  {
    q: "كم يوماً يمكنني ترحيلها من إجازتي السنوية؟",
    a: "يمكنك ترحيل حتى ١٠ أيام من رصيدك السنوي إلى السنة التالية، وفق المادة ٧ من سياسة الإجازات.",
    source: "سياسة الإجازات — المادة ٧",
  },
  {
    q: "ما مدة فترة التجربة؟",
    a: "فترة التجربة ٩٠ يوماً قابلة للتمديد مرة واحدة بنفس المدة باتفاق الطرفين.",
    source: "لائحة العمل — المادة ٢",
  },
];

export const stats = {
  responseTime: "٤ ث",
  resolved: "٧٨٪",
  openRequests: 2,
  thisMonth: 12,
};

// ===== Agentic capabilities =====
export type AgentActivityType = "auto_resolved" | "policy_check" | "scheduled" | "drafted" | "monitored";

export interface AgentActivity {
  id: string;
  type: AgentActivityType;
  title: string;
  detail: string;
  time: string;
}

export const employeeAgentActivity: AgentActivity[] = [
  {
    id: "act-1",
    type: "auto_resolved",
    title: "أصدرتُ خطاب التعريف تلقائياً",
    detail: "تحققتُ من بياناتك، أنشأتُ المسودة، ووقّعتُها رقمياً. جاهز في بريدك.",
    time: "قبل ٨ دقائق",
  },
  {
    id: "act-2",
    type: "policy_check",
    title: "ذكّرتك بإجازة منتهية الصلاحية",
    detail: "لديك ٣ أيام ستسقط نهاية ديسمبر — اقترحتُ تواريخ مناسبة.",
    time: "اليوم",
  },
  {
    id: "act-3",
    type: "scheduled",
    title: "جدولتُ اجتماع تقييم الأداء",
    detail: "نسّقتُ مع مديرك ووجدتُ موعداً يناسب الطرفين: الأحد ٢ م.",
    time: "أمس",
  },
];

export const managerAgentActivity: AgentActivity[] = [
  {
    id: "mact-1",
    type: "auto_resolved",
    title: "اعتمدتُ ٤ طلبات روتينية نيابةً عنك",
    detail: "ضمن الحدود المعتمدة (إجازات < ٣ أيام، رصيد كافٍ، لا تعارض).",
    time: "اليوم",
  },
  {
    id: "mact-2",
    type: "monitored",
    title: "رصدتُ تراكم إجازات في فريقك",
    detail: "٣ أعضاء لديهم أكثر من ١٥ يوماً غير مستخدمة — أعددتُ خطة توزيع مقترحة.",
    time: "قبل ساعتين",
  },
  {
    id: "mact-3",
    type: "drafted",
    title: "صغتُ ردوداً على ٢ طلبات حساسة",
    detail: "بانتظار مراجعتك قبل الإرسال.",
    time: "صباح اليوم",
  },
];

// ===== Agent plans (multi-step reasoning) =====
export interface AgentStep {
  id: string;
  label: string;
  status: "done" | "active" | "pending" | "needs_approval";
  detail?: string;
}

export interface AgentPlan {
  id: string;
  goal: string;
  context: string;
  steps: AgentStep[];
}

// ===== Notifications (role-aware) =====
export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  kind: "agent" | "request" | "policy" | "approval";
}

export const employeeNotifications: AppNotification[] = [
  { id: "n1", kind: "agent", title: "خطاب التعريف جاهز للتنزيل", detail: "أنجزتُه نيابةً عنك ووقّعتُه رقمياً.", time: "قبل ٨ د", unread: true },
  { id: "n2", kind: "request", title: "تمت الموافقة على إجازتك", detail: "REQ-2038 — من ١٢ إلى ١٤ مايو.", time: "أمس", unread: true },
  { id: "n3", kind: "policy", title: "تذكير: ٣ أيام إجازة قد تسقط", detail: "تنتهي صلاحيتها نهاية ديسمبر.", time: "اليوم", unread: false },
];

export const managerNotifications: AppNotification[] = [
  { id: "mn1", kind: "approval", title: "٣ طلبات بانتظار قرارك", detail: "جميعها يحمل توصية بالاعتماد.", time: "الآن", unread: true },
  { id: "mn2", kind: "agent", title: "اعتمدتُ ٤ طلبات روتينية", detail: "ضمن قواعد الموافقة الآلية المفعّلة.", time: "اليوم", unread: true },
  { id: "mn3", kind: "policy", title: "تنبيه: تراكم إجازات في الفريق", detail: "٣ أعضاء لديهم >١٥ يوماً غير مستخدمة.", time: "قبل ساعتين", unread: false },
];

// ===== Auto-approval policy rules (manager governance) =====
export interface AutoRule {
  id: string;
  name: string;
  condition: string;
  scope: string;
  enabled: boolean;
  triggeredCount: number;
  riskLevel: "low" | "medium";
}

export const autoApprovalRules: AutoRule[] = [
  {
    id: "rule-1",
    name: "إجازات سنوية قصيرة",
    condition: "≤ ٢ يوم + رصيد كافٍ + لا تعارض في التقويم",
    scope: "كل أعضاء الفريق",
    enabled: true,
    triggeredCount: 18,
    riskLevel: "low",
  },
  {
    id: "rule-2",
    name: "وثائق قياسية",
    condition: "خطاب تعريف، شهادة عمل (قوالب معتمدة)",
    scope: "كل الموظفين",
    enabled: true,
    triggeredCount: 24,
    riskLevel: "low",
  },
  {
    id: "rule-3",
    name: "عمل عن بُعد ضمن الحد الشهري",
    condition: "≤ ٤ أيام/شهر + لا اجتماعات حضورية",
    scope: "الفرق التقنية فقط",
    enabled: true,
    triggeredCount: 11,
    riskLevel: "low",
  },
  {
    id: "rule-4",
    name: "تحديث بيانات شخصية بسيطة",
    condition: "جوال، عنوان، حالة اجتماعية",
    scope: "كل الموظفين",
    enabled: false,
    triggeredCount: 0,
    riskLevel: "low",
  },
  {
    id: "rule-5",
    name: "موافقة على إجازة طويلة",
    condition: "> ٧ أيام متتالية",
    scope: "—",
    enabled: false,
    triggeredCount: 0,
    riskLevel: "medium",
  },
];

// ===== Policies library (employee-side knowledge base) =====
export interface PolicyDoc {
  id: string;
  category: string;
  title: string;
  summary: string;
  articles: { ref: string; text: string }[];
  updatedAt: string;
}

export const policiesLibrary: PolicyDoc[] = [
  {
    id: "pol-leave",
    category: "الإجازات",
    title: "سياسة الإجازات",
    summary: "ينظّم الرصيد السنوي، الإجازات المرضية والطارئة، وقواعد الترحيل.",
    updatedAt: "تحديث: مارس ٢٠٢٥",
    articles: [
      { ref: "المادة ٣", text: "رصيد الإجازة السنوية ٢١ يوم عمل، يُحتسب تناسبياً للموظفين الجدد." },
      { ref: "المادة ٧", text: "يمكن ترحيل حتى ١٠ أيام إلى السنة التالية، وتسقط الزيادة." },
      { ref: "المادة ١٢", text: "الإجازة المرضية تُمنح بشهادة طبية معتمدة، حتى ٣٠ يوماً سنوياً." },
    ],
  },
  {
    id: "pol-remote",
    category: "العمل المرن",
    title: "سياسة العمل عن بُعد",
    summary: "حدود وأيام العمل عن بُعد لكل فريق ومتطلبات التواجد.",
    updatedAt: "تحديث: فبراير ٢٠٢٥",
    articles: [
      { ref: "المادة ٢", text: "يُسمح بـ ٤ أيام عمل عن بُعد شهرياً للفرق التقنية." },
      { ref: "المادة ٤", text: "يجب التواجد الحضوري في أيام الاجتماعات الأسبوعية." },
    ],
  },
  {
    id: "pol-benefits",
    category: "المزايا",
    title: "دليل المزايا والتأمين",
    summary: "التأمين الصحي، بدلات السكن والمواصلات، ومزايا الأسرة.",
    updatedAt: "تحديث: يناير ٢٠٢٥",
    articles: [
      { ref: "التأمين", text: "الفئة (أ) لدى بوبا تشمل الموظف وأسرته (الزوج/ة و٣ أبناء)." },
      { ref: "البدلات", text: "بدل سكن ٢٥٪ من الراتب الأساسي، بدل مواصلات ١٠٪." },
    ],
  },
  {
    id: "pol-conduct",
    category: "السلوك",
    title: "ميثاق سلوك العمل",
    summary: "قيم الشركة، السرية، ومنع تضارب المصالح.",
    updatedAt: "تحديث: ديسمبر ٢٠٢٤",
    articles: [
      { ref: "المادة ١", text: "الالتزام بسرية معلومات العملاء والشركة." },
      { ref: "المادة ٥", text: "الإفصاح عن أي تضارب مصالح فور حدوثه." },
    ],
  },
];

// ===== Payslip data =====
export interface Payslip {
  id: string;
  month: string;
  year: string;
  basic: number;
  housing: number;
  transport: number;
  bonus?: number;
  gosi: number;
  tax: number;
  net: number;
  status: "paid" | "scheduled";
  payDate: string;
}

export const payslips: Payslip[] = [
  { id: "ps-2025-04", month: "أبريل", year: "٢٠٢٥", basic: 14000, housing: 3500, transport: 1400, bonus: 1000, gosi: 1395, tax: 0, net: 18505, status: "paid", payDate: "٢٧ أبريل ٢٠٢٥" },
  { id: "ps-2025-03", month: "مارس", year: "٢٠٢٥", basic: 14000, housing: 3500, transport: 1400, gosi: 1395, tax: 0, net: 17505, status: "paid", payDate: "٢٧ مارس ٢٠٢٥" },
  { id: "ps-2025-02", month: "فبراير", year: "٢٠٢٥", basic: 14000, housing: 3500, transport: 1400, gosi: 1395, tax: 0, net: 17505, status: "paid", payDate: "٢٧ فبراير ٢٠٢٥" },
  { id: "ps-2025-01", month: "يناير", year: "٢٠٢٥", basic: 14000, housing: 3500, transport: 1400, gosi: 1395, tax: 0, net: 17505, status: "paid", payDate: "٢٧ يناير ٢٠٢٥" },
];

// ===== Document tracking (closing the loop on requests) =====
export interface DocStatusStep { label: string; done: boolean; time?: string }

export interface TrackedDocument {
  id: string;
  type: string;
  recipient?: string;
  requestedAt: string;
  status: "processing" | "ready" | "delivered";
  steps: DocStatusStep[];
  downloadUrl?: string; // mock — generated on the fly
}

// ===== Manager: ROI tracker =====
export interface ROIMetric {
  label: string;
  value: string;
  unit: string;
  delta: string;
  positive: boolean;
}
export const roiSummary = {
  hoursSavedWeek: 18,
  riyalEquivalent: 5400,
  autoResolvedRate: 72,
  avgResponseMin: 4,
  trend: [12, 14, 11, 16, 18, 15, 18], // last 7 days
};
export const roiBreakdown: ROIMetric[] = [
  { label: "ساعات موفّرة", value: "١٨", unit: "ساعة/أسبوع", delta: "+٢٢٪", positive: true },
  { label: "ما يعادل", value: "٥,٤٠٠", unit: "ريال", delta: "+١,٢٠٠", positive: true },
  { label: "حُلّ ذاتياً", value: "٧٢٪", unit: "من الطلبات", delta: "+٨٪", positive: true },
  { label: "متوسط الرد", value: "٤", unit: "ثوانٍ", delta: "−١.٢ث", positive: true },
];

// ===== Manager: Sentiment Radar =====
export interface SentimentSlice {
  team: string;
  mood: number; // 0..100
  stress: number; // 0..100
  signals: string[];
}
export const sentimentRadar: SentimentSlice[] = [
  { team: "المبيعات", mood: 58, stress: 78, signals: ["زيادة في كلمات الإرهاق", "طلبات إجازات قصيرة متكررة"] },
  { team: "الهندسة", mood: 74, stress: 52, signals: ["نبرة محايدة", "نشاط طبيعي"] },
  { team: "التسويق", mood: 81, stress: 38, signals: ["نبرة إيجابية", "احتفاء بإنجاز إطلاق"] },
  { team: "الدعم", mood: 62, stress: 70, signals: ["تأخر في الردود", "زيادة الطلبات بعد ساعات العمل"] },
];
export const sentimentOverall = { mood: 69, stress: 60, weekDelta: -4 };

// ===== Manager: Smart Escalation (Red Flags) =====
export interface RedFlag {
  id: string;
  severity: "high" | "critical";
  category: "استقالة" | "شكوى" | "تظلّم" | "صحة نفسية";
  who: string;
  team: string;
  summary: string;
  detected: string;
  suggestedAction: string;
}
export const redFlags: RedFlag[] = [
  {
    id: "rf-1",
    severity: "critical",
    category: "استقالة",
    who: "سارة الحربي",
    team: "المبيعات",
    summary: "نية انفصال محتملة — أشارت في حوار خاص إلى البحث عن فرص أخرى وطلبت شهادة خبرة.",
    detected: "قبل ٣٥ دقيقة",
    suggestedAction: "اجتماع ١:١ خلال ٤٨ ساعة",
  },
  {
    id: "rf-2",
    severity: "high",
    category: "شكوى",
    who: "موظف من الدعم",
    team: "الدعم",
    summary: "شكوى عبر القناة المجهولة حول توزيع المناوبات — تكررت من ٣ موظفين هذا الأسبوع.",
    detected: "قبل ساعتين",
    suggestedAction: "مراجعة جدول المناوبات + جلسة مفتوحة",
  },
  {
    id: "rf-3",
    severity: "high",
    category: "صحة نفسية",
    who: "خالد المطيري",
    team: "الهندسة",
    summary: "ساعات عمل تتجاوز ١١ ساعة/يوم لمدة أسبوعين، مع رفض إجازة مقترحة من الوكيل.",
    detected: "اليوم",
    suggestedAction: "فرض إجازة استرداد + إعادة توزيع المهام",
  },
];

// ===== Employee: Proactive Perks =====
export interface UnusedPerk {
  id: string;
  title: string;
  detail: string;
  cta: string;
  icon: "training" | "wellness" | "leave" | "insurance";
  expiresIn?: string;
}
export const unusedPerks: UnusedPerk[] = [
  {
    id: "perk-1",
    title: "ميزانية التدريب لم تُستخدم",
    detail: "لديك ٤,٠٠٠ ريال في برنامج التطوير المهني — متاحة حتى نهاية السنة المالية.",
    cta: "اقترح لي دورات",
    icon: "training",
    expiresIn: "ينتهي خلال ٦٢ يوم",
  },
  {
    id: "perk-2",
    title: "فحص طبي شامل مجاني",
    detail: "تأمينك يشمل فحصاً سنوياً مجانياً لم تستخدمه منذ ١٤ شهراً.",
    cta: "احجز موعد",
    icon: "wellness",
  },
  {
    id: "perk-3",
    title: "٣ أيام إجازة قد تسقط",
    detail: "تنتهي صلاحيتها نهاية ديسمبر — اقترحتُ تواريخ مناسبة لجدولك.",
    cta: "شاهد التواريخ المقترحة",
    icon: "leave",
    expiresIn: "تسقط نهاية ديسمبر",
  },
];

// ===== Employee: Onboarding Buddy =====
export interface OnboardingTask {
  id: string;
  day: number;
  title: string;
  description: string;
  done: boolean;
  category: "policy" | "social" | "setup" | "training";
}
export const onboardingProgress = { day: 7, totalDays: 90, completed: 5, total: 14 };
export const onboardingTasks: OnboardingTask[] = [
  { id: "ob-1", day: 1, title: "اقرأ ميثاق سلوك العمل", description: "٣ دقائق فقط — الأساسيات التي تحفظ بيئة آمنة للجميع.", done: true, category: "policy" },
  { id: "ob-2", day: 1, title: "تعرّف على مزايا التأمين", description: "ما الذي يغطيه تأمينك الصحي ومتى تستخدمه.", done: true, category: "policy" },
  { id: "ob-3", day: 2, title: "اضبط بياناتك المصرفية", description: "حتى يصلك أول راتب في موعده.", done: true, category: "setup" },
  { id: "ob-4", day: 3, title: "قابل فريقك افتراضياً", description: "جدولتُ لك مكالمة قصيرة مع كل عضو.", done: true, category: "social" },
  { id: "ob-5", day: 5, title: "أكمل تدريب الأمن السيبراني", description: "إلزامي خلال أول أسبوعين.", done: true, category: "training" },
  { id: "ob-6", day: 7, title: "اجتماع تقييم الانطباع الأول", description: "اليوم ٢ م مع مديرك المباشر.", done: false, category: "social" },
  { id: "ob-7", day: 14, title: "اختر هدفاً لربع السنة", description: "سنناقشه في تقييم نهاية فترة التجربة.", done: false, category: "training" },
  { id: "ob-8", day: 30, title: "تقييم نهاية الشهر الأول", description: "جلسة قصيرة مع مديرك ومع HR.", done: false, category: "policy" },
];

// ===== Employee: What-If Simulator scenarios =====
export interface SimScenario {
  id: string;
  question: string;
  result: { label: string; value: string; tone: "info" | "warn" | "ok" }[];
  policyRefs: string[];
}
export const whatIfPresets = [
  "ماذا لو أخذتُ ٥ أيام إجازة بدون راتب؟",
  "ماذا لو عملتُ ٣ أيام عن بُعد الأسبوع القادم؟",
  "ماذا لو استقلتُ نهاية الشهر؟",
  "ماذا لو رحّلتُ ٧ أيام إجازة للسنة القادمة؟",
];

export const initialTrackedDocs: TrackedDocument[] = [
  {
    id: "DOC-2041",
    type: "خطاب تعريف بالراتب",
    recipient: "البنك الأهلي السعودي",
    requestedAt: "اليوم، ١٠:٢٤ ص",
    status: "ready",
    steps: [
      { label: "استلام الطلب", done: true, time: "١٠:٢٤ ص" },
      { label: "التحقق من البيانات", done: true, time: "١٠:٢٥ ص" },
      { label: "إنشاء المسودة", done: true, time: "١٠:٢٧ ص" },
      { label: "التوقيع الرقمي", done: true, time: "١٠:٢٨ ص" },
      { label: "جاهز للتنزيل", done: true, time: "١٠:٢٩ ص" },
    ],
  },
  {
    id: "DOC-2031",
    type: "شهادة عمل",
    requestedAt: "قبل ٣ أيام",
    status: "delivered",
    steps: [
      { label: "استلام الطلب", done: true },
      { label: "إنشاء المسودة", done: true },
      { label: "التوقيع الرقمي", done: true },
      { label: "تم التسليم", done: true },
    ],
  },
];

export const samplePlans: Record<string, AgentPlan> = {
  leave: {
    id: "plan-leave",
    goal: "تقديم طلب إجازة سنوية ٥ أيام",
    context: "طلبك: إجازة من ٢٠ إلى ٢٤ مايو",
    steps: [
      { id: "s1", label: "التحقق من رصيد الإجازة", status: "done", detail: "متاح ١٣ يوماً ✓" },
      { id: "s2", label: "فحص تعارض التقويم مع الفريق", status: "done", detail: "لا يوجد تعارض ✓" },
      { id: "s3", label: "مطابقة سياسة الإجازات", status: "done", detail: "مطابق للمادة ٣ ✓" },
      { id: "s4", label: "تجهيز نموذج الطلب", status: "active" },
      { id: "s5", label: "الإرسال للمدير للاعتماد", status: "needs_approval", detail: "يحتاج تأكيدك" },
      { id: "s6", label: "تحديث التقويم وإشعار الفريق", status: "pending" },
    ],
  },
  document: {
    id: "plan-doc",
    goal: "إصدار خطاب تعريف بالراتب",
    context: "موجه إلى البنك الأهلي",
    steps: [
      { id: "s1", label: "جلب بيانات التوظيف من النظام", status: "done" },
      { id: "s2", label: "تطبيق قالب البنك المعتمد", status: "done" },
      { id: "s3", label: "إنشاء المسودة", status: "active" },
      { id: "s4", label: "التوقيع الرقمي من HR", status: "pending" },
      { id: "s5", label: "إرسال نسخة لبريدك", status: "pending" },
    ],
  },
};
