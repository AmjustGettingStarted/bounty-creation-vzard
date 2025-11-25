import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BountyWizardProvider } from "@/lib/context/BountyWizardContext";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BountyWizardProvider>
      <SidebarProvider>
        <AppSidebar side="left" />
        <SidebarInset>
          <header className="flex h-16 items-center border-b px-4">
            <SidebarTrigger />
          </header>

          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </BountyWizardProvider>
  );
}

