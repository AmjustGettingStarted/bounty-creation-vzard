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
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  route: string;
}

const steps: Step[] = [
  { id: 1, name: "Basics", route: "/wizard" },
  { id: 2, name: "Rewards", route: "/wizard/step2" },
  { id: 3, name: "Backer", route: "/wizard/step3" },
];

export function AppSidebar({ side }: { side: "left" | "right" }) {
  const pathname = usePathname();
  const router = useRouter();

  // Find the matching step - returns null if pathname doesn't match any step route
  const matchingStep = steps.find((step) => step.route === pathname);
  const currentStepId = matchingStep?.id ?? null;

  // A step is completed if it's before the current step (only if we have a valid current step)
  const isStepCompleted = (stepId: number) => {
    if (currentStepId === null) return false;
    return stepId < currentStepId;
  };

  const isStepDisabled = (stepId: number) => {
    if (currentStepId === null) return false;
    return stepId > currentStepId;
  };

  const goToStep = (stepNumber: number) => {
    const step = steps.find((s) => s.id === stepNumber);
    if (step && !isStepDisabled(stepNumber)) {
      router.push(step.route);
    }
  };

  return (
    <Sidebar side={side}>
      <SidebarContent className="bg-white dark:bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Steps</SidebarGroupLabel>
          <SidebarGroupContent >
            <SidebarMenu>
              {steps.map((step) => {
                const disabled = isStepDisabled(step.id);

                // Only highlight if pathname exactly matches this step's route
                const isVisibleActive = pathname === step.route;

                return (
                  <SidebarMenuItem key={step.id}>
                    <SidebarMenuButton
                      onClick={() => goToStep(step.id)}
                      disabled={disabled}
                      isActive={isVisibleActive}
                      tooltip={disabled ? "Complete previous steps first" : step.name}
                      className={cn(
                        isVisibleActive && "!bg-primary !text-primary-foreground hover:!bg-primary/90"
                      )}
                    >
                      <span>Step {step.id} : </span>
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

