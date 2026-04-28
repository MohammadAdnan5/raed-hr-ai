import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BentoGrid } from "@/components/BentoGrid";
import { ChatPanel } from "@/components/ChatPanel";
import { LeaveDialog } from "@/components/LeaveDialog";
import { DocumentDialog } from "@/components/DocumentDialog";
import { PoliciesDialog } from "@/components/PoliciesDialog";
import { PayslipDialog } from "@/components/PayslipDialog";
import { DocumentTrackerDialog } from "@/components/DocumentTrackerDialog";
import { ManagerView } from "@/components/ManagerView";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { initialTrackedDocs, TrackedDocument } from "@/data/hrData";

function IndexInner() {
  const { role } = useRole();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [trackedDocs, setTrackedDocs] = useState<TrackedDocument[]>(initialTrackedDocs);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <BentoGrid
                onOpenLeave={() => setLeaveOpen(true)}
                onOpenDocument={() => setDocOpen(true)}
                onOpenPolicies={() => setPoliciesOpen(true)}
                onOpenPayslip={() => setPayslipOpen(true)}
                onOpenTracker={openTracker}
                trackedDocs={trackedDocs}
              />
            </div>
            <aside className="lg:col-span-1 order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
              <ChatPanel
                onOpenLeave={() => setLeaveOpen(true)}
                onOpenDocument={() => setDocOpen(true)}
                onOpenPolicies={() => setPoliciesOpen(true)}
                onOpenPayslip={() => setPayslipOpen(true)}
              />
            </aside>
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
    </div>
  );
}

const Index = () => (
  <RoleProvider>
    <IndexInner />
  </RoleProvider>
);

export default Index;
