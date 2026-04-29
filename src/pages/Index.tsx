import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BentoGrid } from "@/components/BentoGrid";
import { ChatPanel } from "@/components/ChatPanel";
import { LeaveDialog } from "@/components/LeaveDialog";
import { DocumentDialog } from "@/components/DocumentDialog";
import { PoliciesDialog } from "@/components/PoliciesDialog";
import { PayslipDialog } from "@/components/PayslipDialog";
import { DocumentTrackerDialog } from "@/components/DocumentTrackerDialog";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { OnboardingBuddy } from "@/components/OnboardingBuddy";
import { ManagerView } from "@/components/ManagerView";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { initialTrackedDocs, TrackedDocument } from "@/data/hrData";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function IndexInner() {
  const { role } = useRole();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [trackedDocs, setTrackedDocs] = useState<TrackedDocument[]>(initialTrackedDocs);
  const [onboardingOn, setOnboardingOn] = useState(true);

  const addTrackedDoc = (doc: TrackedDocument) => {
    setTrackedDocs((d) => [doc, ...d]);
  };

  const openTracker = () => setTrackerOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-6 md:py-8">
        <h1 className="sr-only">المساعد الذكي للموارد البشرية</h1>

        {role === "employee" ? (
          <div className="space-y-4">
            {/* Onboarding Buddy banner — always at the top for new hires */}
            <OnboardingBuddy enabled={onboardingOn} onToggle={setOnboardingOn} />
            {!onboardingOn && (
              <button
                onClick={() => setOnboardingOn(true)}
                className="flex items-center gap-2 text-xs text-primary font-medium hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" /> فعّل رفيق الموظف الجديد
              </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 order-2 lg:order-1">
                <BentoGrid
                  onOpenLeave={() => setLeaveOpen(true)}
                  onOpenDocument={() => setDocOpen(true)}
                  onOpenPolicies={() => setPoliciesOpen(true)}
                  onOpenPayslip={() => setPayslipOpen(true)}
                  onOpenTracker={openTracker}
                  onOpenSimulator={() => setSimOpen(true)}
                  trackedDocs={trackedDocs}
                />
              </div>
              <aside className="lg:col-span-1 order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
                <ChatPanel
                  onOpenLeave={() => setLeaveOpen(true)}
                  onOpenDocument={() => setDocOpen(true)}
                  onOpenPolicies={() => setPoliciesOpen(true)}
                  onOpenPayslip={() => setPayslipOpen(true)}
                  onOpenSimulator={() => setSimOpen(true)}
                />
              </aside>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <ManagerView />
            </div>
            <aside className="lg:col-span-1 order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
              <ChatPanel
                onOpenLeave={() => setLeaveOpen(true)}
                onOpenDocument={() => setDocOpen(true)}
                onOpenPolicies={() => setPoliciesOpen(true)}
                onOpenPayslip={() => setPayslipOpen(true)}
                onOpenSimulator={() => setSimOpen(true)}
              />
            </aside>
          </div>
        )}
      </main>

      <LeaveDialog open={leaveOpen} onOpenChange={setLeaveOpen} />
      <DocumentDialog
        open={docOpen}
        onOpenChange={setDocOpen}
        onSubmitted={addTrackedDoc}
        onOpenTracker={openTracker}
      />
      <PoliciesDialog open={policiesOpen} onOpenChange={setPoliciesOpen} />
      <PayslipDialog open={payslipOpen} onOpenChange={setPayslipOpen} />
      <DocumentTrackerDialog open={trackerOpen} onOpenChange={setTrackerOpen} docs={trackedDocs} />
      <WhatIfSimulator open={simOpen} onOpenChange={setSimOpen} />
    </div>
  );
}

const Index = () => (
  <RoleProvider>
    <IndexInner />
  </RoleProvider>
);

export default Index;
