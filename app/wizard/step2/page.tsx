"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, type Step2FormData } from "@/lib/schemas";
import { useBountyWizard } from "@/lib/context/BountyWizardContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SDG_OPTIONS = [
  "No Poverty",
  "Zero Hunger",
  "Good Health",
  "Quality Education",
  "Gender Equality",
  "Clean Water",
];

export default function Step2Page() {
  const { state, setField, validateStep, goToStep, markStepCompleted } = useBountyWizard();

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

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      reward: {
        currency: getNestedValue("reward.currency") || undefined,
        amount: getNestedValue("reward.amount") || undefined,
        winners: getNestedValue("reward.winners") || undefined,
      },
      timeline: {
        expiration_date: (() => {
          const dateValue = getNestedValue("timeline.expiration_date");
          if (!dateValue) return undefined;
          // Handle both Date objects and date strings
          return dateValue instanceof Date ? dateValue : new Date(dateValue);
        })(),
        estimated_completion: {
          days: getNestedValue("timeline.estimated_completion.days") ?? 0,
          hours: getNestedValue("timeline.estimated_completion.hours") ?? 0,
          minutes: getNestedValue("timeline.estimated_completion.minutes") ?? 0,
        },
      },
      hasImpactCertificate: getNestedValue("hasImpactCertificate") || false,
      impactBriefMessage: getNestedValue("impactBriefMessage") || "",
      sdgs: getNestedValue("sdgs") || [],
    },
  });

  const hasImpactCertificate = form.watch("hasImpactCertificate");

  // Clear impactBriefMessage when hasImpactCertificate is false
  useEffect(() => {
    if (!hasImpactCertificate) {
      form.setValue("impactBriefMessage", "");
      setField("impactBriefMessage", "");
    }
  }, [hasImpactCertificate, form, setField]);

  // Update context when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Handle nested objects
      if (value.reward) {
        Object.entries(value.reward).forEach(([key, val]) => {
          if (val !== undefined) {
            setField(`reward.${key}`, val);
          }
        });
      }
      if (value.timeline) {
        if (value.timeline.expiration_date) {
          setField("timeline.expiration_date", value.timeline.expiration_date);
        }
        if (value.timeline.estimated_completion) {
          Object.entries(value.timeline.estimated_completion).forEach(([key, val]) => {
            if (val !== undefined) {
              setField(`timeline.estimated_completion.${key}`, val);
            }
          });
        }
      }
      if (value.hasImpactCertificate !== undefined) {
        setField("hasImpactCertificate", value.hasImpactCertificate);
      }
      if (value.impactBriefMessage !== undefined) {
        setField("impactBriefMessage", value.impactBriefMessage);
      }
      if (value.sdgs !== undefined) {
        setField("sdgs", value.sdgs);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setField]);

  const onSubmit = async (data: Step2FormData) => {
    // Update all fields in context
    if (data.reward) {
      Object.entries(data.reward).forEach(([key, value]) => {
        setField(`reward.${key}`, value);
      });
    }
    if (data.timeline) {
      if (data.timeline.expiration_date) {
        setField("timeline.expiration_date", data.timeline.expiration_date);
      }
      if (data.timeline.estimated_completion) {
        Object.entries(data.timeline.estimated_completion).forEach(([key, value]) => {
          setField(`timeline.estimated_completion.${key}`, value);
        });
      }
    }
    setField("hasImpactCertificate", data.hasImpactCertificate);
    if (data.impactBriefMessage) {
      setField("impactBriefMessage", data.impactBriefMessage);
    }
    setField("sdgs", data.sdgs);

    // Validate step 2
    const result = await validateStep(2);
    if (result.valid) {
      markStepCompleted(2, true);
      goToStep(3);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold mb-6">Step 2: Rewards</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* REWARD SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Rewards</h2>

            <FormField
              control={form.control}
              name="reward.currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reward.amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reward.winners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winners</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter number of winners"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* TIMELINE SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Timeline</h2>

            <FormField
              control={form.control}
              name="timeline.expiration_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="timeline.estimated_completion.days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline.estimated_completion.hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline.estimated_completion.minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* IMPACT CERTIFICATE SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Impact Certificate</h2>

            <FormField
              control={form.control}
              name="hasImpactCertificate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Has Impact Certificate</FormLabel>
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

            {hasImpactCertificate && (
              <FormField
                control={form.control}
                name="impactBriefMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Brief Message</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter impact brief message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* SDG SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">SDGs</h2>

            <FormField
              control={form.control}
              name="sdgs"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Select SDGs</FormLabel>
                  </div>
                  {SDG_OPTIONS.map((sdg) => (
                    <FormField
                      key={sdg}
                      control={form.control}
                      name="sdgs"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={sdg}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(sdg)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, sdg])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== sdg)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{sdg}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
  );
}

