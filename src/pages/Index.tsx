import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BentoGrid } from "@/components/BentoGrid";
import { ChatPanel } from "@/components/ChatPanel";
import { LeaveDialog } from "@/components/LeaveDialog";
import { DocumentDialog } from "@/components/DocumentDialog";
import { ManagerView } from "@/components/ManagerView";
import { RoleProvider, useRole } from "@/context/RoleContext";

function IndexInner() {
  const { role } = useRole();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

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
              />
            </div>
            <aside className="lg:col-span-1 order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
              <ChatPanel
                onOpenLeave={() => setLeaveOpen(true)}
                onOpenDocument={() => setDocOpen(true)}
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
              />
            </aside>
          </div>
        )}
      </main>

      <LeaveDialog open={leaveOpen} onOpenChange={setLeaveOpen} />
      <DocumentDialog open={docOpen} onOpenChange={setDocOpen} />
    </div>
  );
}

const Index = () => (
  <RoleProvider>
    <IndexInner />
  </RoleProvider>
);

export default Index;
