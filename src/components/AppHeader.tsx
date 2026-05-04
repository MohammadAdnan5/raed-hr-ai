import { useState } from "react";
import { ChevronDown, Workflow } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import logo from "@/assets/raed-wordmark.png";
import { NotificationsPopover } from "./NotificationsPopover";
import { ArchitectureView } from "./ArchitectureView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { role, setRole } = useRole();
  const [archOpen, setArchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-auto items-center justify-center px-1">
            <img src={logo} alt="رائد" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">مساعد الموارد البشرية الذكي</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role switcher — POC only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <span className="h-2 w-2 rounded-full bg-success" />
                {role === "employee" ? "وضع الموظف" : "وضع المدير"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setRole("employee")}>
                وضع الموظف
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRole("manager")}>
                وضع المدير
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {role === "manager" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setArchOpen(true)}
              className="rounded-full relative group"
              aria-label="الهيكلية التقنية ومسار الوكيل"
              title="الهيكلية التقنية ومسار الوكيل"
            >
              <Workflow className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
          )}

          <NotificationsPopover />

          <img src={logo} alt="رائد" className="h-9 w-9 rounded-full object-contain bg-secondary p-1" />
        </div>
      </div>

      <Dialog open={archOpen} onOpenChange={setArchOpen}>
        <DialogContent className="max-w-[98vw] w-[1400px] h-[92vh] p-0 overflow-hidden border-white/10 bg-[#0b1020] [&>button]:text-white [&>button]:z-50">
          <ArchitectureView />
        </DialogContent>
      </Dialog>
    </header>
  );
}
