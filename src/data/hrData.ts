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
