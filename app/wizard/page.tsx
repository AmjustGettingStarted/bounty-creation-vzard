"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1FormData } from "@/lib/schemas";
import { useBountyWizard } from "@/lib/context/BountyWizardContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function WizardPage() {
  const { state, setField, validateStep, goToStep } = useBountyWizard();

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: state.data.title || "",
      description: state.data.description || "",
      type: state.data.type || undefined,
      dominant_core: state.data.dominant_core || undefined,
      mode: state.data.mode || undefined,
      location: state.data.location || "",
    },
  });

  const mode = form.watch("mode");

  // Clear location when mode changes to digital
  useEffect(() => {
    if (mode === "digital") {
      form.setValue("location", "");
      setField("location", "");
    }
  }, [mode, form, setField]);

  // Update context when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined) {
          setField(key, val);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setField]);

  const onSubmit = (data: Step1FormData) => {
    // Update all fields in context
    Object.entries(data).forEach(([key, value]) => {
      setField(key, value);
    });

    // Validate step 1
    if (validateStep(1)) {
      goToStep(2);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold mb-6">Step 1: Basics</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dominant_core"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dominant Core</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dominant core" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Water">Water</SelectItem>
                    <SelectItem value="Earth">Earth</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="digital" id="digital" />
                      <label htmlFor="digital">Digital</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physical" id="physical" />
                      <label htmlFor="physical">Physical</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === "physical" && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            variant={"ghost"}
            disabled={form.formState.isSubmitting}
            className=""
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
  );
}
