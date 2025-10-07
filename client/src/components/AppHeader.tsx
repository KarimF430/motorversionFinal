import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-primary text-primary-foreground border-b border-primary-border">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" className="text-primary-foreground hover-elevate" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground text-primary rounded font-bold flex items-center justify-center text-sm">
            MO
          </div>
          <h1 className="text-xl font-semibold">MotorOctane Admin</h1>
        </div>
      </div>
      <div className="text-sm">
        Welcome, <span className="font-medium">Admin</span>
      </div>
    </header>
  );
}
