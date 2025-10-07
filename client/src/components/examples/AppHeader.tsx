import AppHeader from '../AppHeader';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppHeaderExample() {
  return (
    <SidebarProvider>
      <AppHeader />
    </SidebarProvider>
  );
}
