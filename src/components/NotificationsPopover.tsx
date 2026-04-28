import { useState } from "react";
import { Bell, Sparkles, FileCheck2, BookOpen, Inbox, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRole } from "@/context/RoleContext";
import { employeeNotifications, managerNotifications, AppNotification } from "@/data/hrData";
import { cn } from "@/lib/utils";

const iconMap = {
  agent: Sparkles,
  request: FileCheck2,
  policy: BookOpen,
  approval: Inbox,
};

export function NotificationsPopover() {
  const { role } = useRole();
  const [items, setItems] = useState<AppNotification[]>(
    role === "employee" ? employeeNotifications : managerNotifications
  );
  // re-seed when role changes
  const [lastRole, setLastRole] = useState(role);
  if (lastRole !== role) {
    setItems(role === "employee" ? employeeNotifications : managerNotifications);
    setLastRole(role);
  }

  const unread = items.filter((n) => n.unread).length;
  const markAll = () => setItems((xs) => xs.map((x) => ({ ...x, unread: false })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="الإشعارات">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-2 left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground num">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 rounded-2xl overflow-hidden" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
          <div>
            <p className="text-sm font-bold">الإشعارات</p>
            <p className="text-[11px] text-muted-foreground">
              {role === "employee" ? "وضع الموظف" : "وضع المدير"} ·{" "}
              <span className="num">{unread}</span> غير مقروء
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              تعليم الكل
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">لا إشعارات</div>
          ) : (
            items.map((n) => {
              const Icon = iconMap[n.kind];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors",
                    n.unread && "bg-primary-soft/30"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold leading-tight">{n.title}</p>
                      {n.unread && <span className="h-1.5 w-1.5 shrink-0 mt-1 rounded-full bg-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.detail}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
