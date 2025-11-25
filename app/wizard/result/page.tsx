"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBountyWizard } from "@/lib/context/BountyWizardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultPage() {
  const { state, resetWizard } = useBountyWizard();
  const router = useRouter();
  const [jsonString, setJsonString] = useState("");

  useEffect(() => {
    // Check if all steps are completed
    const step1Valid = state.completedSteps[1] || false;
    const step2Valid = state.completedSteps[2] || false;
    const step3Valid = state.completedSteps[3] || false;

    // If not all steps completed, redirect to wizard
    if (!step1Valid || !step2Valid || !step3Valid) {
      router.push("/wizard");
      return;
    }

    // Prepare data for JSON display, handling date conversion
    const dataToDisplay = { ...state.data };
    
    // Convert timeline.expiration_date to Date if it's a string
    if (dataToDisplay.timeline?.expiration_date) {
      const dateValue = dataToDisplay.timeline.expiration_date;
      if (typeof dateValue === "string") {
        dataToDisplay.timeline.expiration_date = new Date(dateValue);
      }
    }

    // Format the JSON payload with proper date serialization
    const formattedJson = JSON.stringify(
      dataToDisplay,
      (key, value) => {
        // Convert Date objects to ISO strings for JSON display
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      },
      2
    );
    
    setJsonString(formattedJson);
  }, [state, router]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      // You could add a toast notification here if needed
    } catch (error) {
      console.error("Failed to copy JSON:", error);
    }
  };

  const handleStartOver = () => {
    resetWizard();
  };

  // If redirecting, show nothing
  if (!state.completedSteps[1] || !state.completedSteps[2] || !state.completedSteps[3]) {
    return null;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold mb-6">Bounty Created Successfully</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bounty Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full rounded-md border p-4 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap break-words">{jsonString}</pre>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCopyJson}
          className="flex-1"
        >
          Copy JSON
        </Button>
        <Button
          type="button"
          onClick={handleStartOver}
          className="flex-1"
        >
          Start Over
        </Button>
      </div>
    </div>
  );
}
