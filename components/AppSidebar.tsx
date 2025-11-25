"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Step {
  id: number;
  name: string;
  route: string;
}

const steps: Step[] = [
  { id: 1, name: "Basics", route: "/wizard" },
  { id: 2, name: "Rewards", route: "/wizard/confirmation" },
  { id: 3, name: "Backer", route: "/wizard/result" },
];

export function AppSidebar({ side }: { side: "left" | "right" }) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current step based on route
  const currentStep = steps.find((step) => step.route === pathname)?.id || 1;

  // A step is completed if it's before the current step
  const isStepCompleted = (stepId: number) => stepId < currentStep;
  const isStepActive = (stepId: number) => stepId === currentStep;
  const isStepDisabled = (stepId: number) => stepId > currentStep;

  const goToStep = (stepNumber: number) => {
    const step = steps.find((s) => s.id === stepNumber);
    if (step && (isStepCompleted(stepNumber) || isStepActive(stepNumber))) {
      router.push(step.route);
    }
  };

  return (
    <Sidebar side={side}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Steps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {steps.map((step) => {
                const completed = isStepCompleted(step.id);
                const active = isStepActive(step.id);
                const disabled = isStepDisabled(step.id);

                return (
                  <SidebarMenuItem key={step.id}>
                    <SidebarMenuButton
                      onClick={() => goToStep(step.id)}
                      disabled={disabled}
                      isActive={active}
                      tooltip={disabled ? "Complete previous steps first" : step.name}
                    >
                      <span>Step {step.id}</span>
                      <span>{step.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

