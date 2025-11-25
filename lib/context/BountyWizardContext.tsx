"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BountyWizardContextType {
  // Add your context state and methods here
}

const BountyWizardContext = createContext<BountyWizardContextType | undefined>(
  undefined
);

export function BountyWizardProvider({ children }: { children: ReactNode }) {
  // Add your state and logic here

  return (
    <BountyWizardContext.Provider value={{}}>
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

