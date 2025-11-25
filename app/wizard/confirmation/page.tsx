"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBountyWizard } from "@/lib/context/BountyWizardContext";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
  const { state, submit, goToStep } = useBountyWizard();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = await submit();
      // Payload is returned, submission successful
      router.push("/wizard/result");
    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    goToStep(3);
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Confirmation</h1>
      <p className="text-muted-foreground">
        Review your bounty details before submitting.
      </p>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Submitting..." : "Submit Bounty"}
        </Button>
      </div>
    </div>
  );
}
