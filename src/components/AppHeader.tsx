import { ChevronDown } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/raed-wordmark.png";
import { NotificationsPopover } from "./NotificationsPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { role, setRole } = useRole();

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

          <NotificationsPopover />

          <img src={logo} alt="رائد" className="h-9 w-9 rounded-full object-contain bg-secondary p-1" />
        </div>
      </div>
    </header>
  );
}
