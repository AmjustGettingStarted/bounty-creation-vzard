"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Step1FormData, step2Schema, step3Schema } from "@/lib/schemas";
import { step1Schema } from "@/lib/schemas";
import { z } from "zod";

interface WizardState {
  data: Partial<Step1FormData> & Record<string, any>;
  currentStep: number;
  completedSteps: Record<number, boolean>;
}

interface BountyWizardContextType {
  state: WizardState;
  setField: (fieldName: string, value: any) => void;
  validateStep: (stepNumber: number) => Promise<{ valid: boolean }>;
  goToStep: (stepNumber: number | "confirmation" | "result") => void;
  markStepCompleted: (stepNumber: number, completed: boolean) => void;
}

const BountyWizardContext = createContext<BountyWizardContextType | undefined>(
  undefined
);

export function BountyWizardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    data: {},
    currentStep: 1,
    completedSteps: {},
  });

  const setField = useCallback((fieldName: string, value: any) => {
    setState((prev) => {
      const newData = { ...prev.data };
      
      // Handle nested paths like "reward.amount"
      if (fieldName.includes(".")) {
        const keys = fieldName.split(".");
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
          }
          current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
      } else {
        newData[fieldName] = value;
      }
      
      return {
        ...prev,
        data: newData,
      };
    });
  }, []);

  const validateStep = useCallback(async (stepNumber: number): Promise<{ valid: boolean }> => {
    try {
      switch (stepNumber) {
        case 1:
          step1Schema.parse(state.data);
          return { valid: true };
        case 2:
          step2Schema.parse(state.data);
          return { valid: true };
        case 3:
          step3Schema.parse(state.data);
          return { valid: true };
        default:
          return { valid: true };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
      }
      return { valid: false };
    }
  }, [state.data]);

  const markStepCompleted = useCallback((stepNumber: number, completed: boolean) => {
    setState((prev) => ({
      ...prev,
      completedSteps: {
        ...prev.completedSteps,
        [stepNumber]: completed,
      },
    }));
  }, []);

  const goToStep = useCallback((stepNumber: number | "confirmation" | "result") => {
    const routes: Record<number | string, string> = {
      1: "/wizard",
      2: "/wizard/step2",
      3: "/wizard/step3",
      confirmation: "/wizard/confirmation",
      result: "/wizard/result",
    };
    
    const route = routes[stepNumber];
    if (route) {
      if (typeof stepNumber === "number") {
        setState((prev) => ({ ...prev, currentStep: stepNumber }));
      }
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
        markStepCompleted,
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
