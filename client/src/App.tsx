import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { ModelFormProvider } from "@/contexts/ModelFormContext";
import Dashboard from "@/pages/Dashboard";
import BrandList from "@/pages/BrandList";
import BrandForm from "@/pages/BrandForm";
import ModelList from "@/pages/ModelList";
import ModelFormPage1 from "@/pages/ModelFormPage1";
import ModelFormPage2 from "@/pages/ModelFormPage2";
import ModelFormPage3 from "@/pages/ModelFormPage3";
import ModelFormPage4 from "@/pages/ModelFormPage4";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/brands" component={BrandList} />
      <Route path="/brands/new" component={BrandForm} />
      <Route path="/brands/:id/edit" component={BrandForm} />
      <Route path="/models" component={ModelList} />
      <Route path="/models/new" component={ModelFormPage1} />
      <Route path="/models/new/page2" component={ModelFormPage2} />
      <Route path="/models/new/page3" component={ModelFormPage3} />
      <Route path="/models/new/page4" component={ModelFormPage4} />
      <Route path="/models/:id/edit" component={ModelFormPage1} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModelFormProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ModelFormProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
