import { Sparkles, Bell, ChevronDown } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-warm shadow-coral">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">المساعد الذكي</span>
            <span className="text-xs text-muted-foreground">الموارد البشرية</span>
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

          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
          </Button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
            ع.م
          </div>
        </div>
      </div>
    </header>
  );
}
