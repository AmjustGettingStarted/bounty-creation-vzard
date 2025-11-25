"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Step1FormData, step2Schema } from "@/lib/schemas";
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

  const validateStep = useCallback((stepNumber: number): boolean => {
    try {
      switch (stepNumber) {
        case 1:
          step1Schema.parse(state.data);
          return true;
        case 2:
          step2Schema.parse(state.data);
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
