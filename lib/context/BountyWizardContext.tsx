"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Step1FormData } from "@/lib/schemas";
import { step1Schema } from "@/lib/schemas";
import { z } from "zod";

interface WizardState {
  data: Partial<Step1FormData> & Record<string, any>;
  currentStep: number;
}

interface BountyWizardContextType {
  state: WizardState;
  setField: (fieldName: string, value: any) => void;
  validateStep: (stepNumber: number) => boolean;
  goToStep: (stepNumber: number) => void;
}

const BountyWizardContext = createContext<BountyWizardContextType | undefined>(
  undefined
);

export function BountyWizardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    data: {},
    currentStep: 1,
  });

  const setField = useCallback((fieldName: string, value: any) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldName]: value,
      },
    }));
  }, []);

  const validateStep = useCallback((stepNumber: number): boolean => {
    try {
      switch (stepNumber) {
        case 1:
          step1Schema.parse(state.data);
          return true;
        default:
          return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
      }
      return false;
    }
  }, [state.data]);

  const goToStep = useCallback((stepNumber: number) => {
    const routes: Record<number, string> = {
      1: "/wizard",
      2: "/wizard/confirmation",
      3: "/wizard/result",
    };
    
    const route = routes[stepNumber];
    if (route) {
      setState((prev) => ({ ...prev, currentStep: stepNumber }));
      router.push(route);
    }
  }, [router]);

  return (
    <BountyWizardContext.Provider
      value={{
        state,
        setField,
        validateStep,
        goToStep,
      }}
    >
      {children}
    </BountyWizardContext.Provider>
  );
}

export function useBountyWizard() {
  const context = useContext(BountyWizardContext);
  if (context === undefined) {
    throw new Error(
      "useBountyWizard must be used within a BountyWizardProvider"
    );
  }
  return context;
}
