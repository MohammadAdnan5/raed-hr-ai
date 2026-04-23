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
  },
  {
    id: "REQ-2047",
    type: "وثيقة",
    title: "تأييد رسمي للحصول على تأشيرة",
    status: "pending",
    date: "منذ ٣ ساعات",
    requester: "ريم الزهراني",
    requesterRole: "محللة بيانات",
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
