import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4">
          <SidebarTrigger className="ml-auto" />
        </header>

        <main className="p-6">{children}</main>
      </SidebarInset>

      <AppSidebar side="right" />
    </SidebarProvider>
  );
}

