"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema, type Step3FormData } from "@/lib/schemas";
import { useBountyWizard } from "@/lib/context/BountyWizardContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step3Page() {
  const { state, setField, validateStep, goToStep, markStepCompleted } = useBountyWizard();
  const router = useRouter();

  // Helper to get nested value from state.data
  const getNestedValue = (path: string) => {
    const keys = path.split(".");
    let value: any = state.data;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  };

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      has_backer: getNestedValue("has_backer") || false,
      backer: getNestedValue("has_backer")
        ? {
            name: getNestedValue("backer.name") || "",
            logo: getNestedValue("backer.logo") || "",
            message: getNestedValue("backer.message") || "",
          }
        : undefined,
      terms_accepted: getNestedValue("terms_accepted") || false,
    },
  });

  const has_backer = form.watch("has_backer");

  // Clear backer fields when has_backer is turned off
  useEffect(() => {
    if (!has_backer) {
      form.setValue("backer", undefined);
      // Remove backer from context
      setField("backer", undefined);
    }
  }, [has_backer, form, setField]);

  // Update context when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.has_backer !== undefined) {
        setField("has_backer", value.has_backer);
      }
      if (value.has_backer && value.backer) {
        if (value.backer.name !== undefined) {
          setField("backer.name", value.backer.name);
        }
        if (value.backer.logo !== undefined) {
          setField("backer.logo", value.backer.logo);
        }
        if (value.backer.message !== undefined) {
          setField("backer.message", value.backer.message);
        }
      } else if (!value.has_backer) {
        setField("backer", undefined);
      }
      if (value.terms_accepted !== undefined) {
        setField("terms_accepted", value.terms_accepted);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setField]);

  const onSubmit = async (data: Step3FormData) => {
    // Update all fields in context
    setField("has_backer", data.has_backer);
    if (data.has_backer && data.backer) {
      setField("backer.name", data.backer.name || "");
      setField("backer.logo", data.backer.logo || "");
      setField("backer.message", data.backer.message || "");
    } else {
      setField("backer", undefined);
    }
    setField("terms_accepted", data.terms_accepted);

    // Validate step 3
    const result = await validateStep(3);
    if (result.valid) {
      markStepCompleted(3, true);
      router.push("/wizard/confirmation");
    }
  };

  const handleBack = () => {
    goToStep(2);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold mb-6">Step 3: Backer</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* BACKER INFORMATION SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Backer Information</h2>

            <FormField
              control={form.control}
              name="has_backer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Has Backer</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {has_backer && (
              <>
                <FormField
                  control={form.control}
                  name="backer.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter backer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backer.logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backer Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backer.message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backer Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter backer message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* TERMS & CONDITIONS SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Terms & Conditions</h2>

            <FormField
              control={form.control}
              name="terms_accepted"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I accept the terms and conditions
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* BUTTONS */}
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
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

