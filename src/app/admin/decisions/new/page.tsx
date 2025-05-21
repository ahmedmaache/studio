
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createDecision } from "@/lib/actions/decisions";
import { getAISummaryForDecision } from "@/lib/actions/ai";
import { Loader2, CalendarIcon, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Decision } from "@/types";

const decisionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  decisionDate: z.date({ required_error: "Decision date is required." }),
  status: z.enum(["draft", "published"]),
  summary: z.string().optional(),
  categories: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  tags: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  referenceNumber: z.string().optional(),
  attachmentUrl: z.string().url("Attachment URL must be a valid URL (e.g., https://example.com/doc.pdf).").optional().or(z.literal("")),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

export default function NewDecisionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      title: "",
      content: "",
      decisionDate: undefined,
      status: "draft",
      summary: "",
      categories: "",
      tags: "",
      referenceNumber: "",
      attachmentUrl: "",
    },
  });

  const handleAiSuggestSummary = async () => {
    const decisionContentValue = form.getValues("content");
    if (!decisionContentValue || decisionContentValue.trim().length < 20) {
      toast({
        title: "Content too short",
        description: "Please provide more decision content (at least 20 characters) for AI summary generation.",
        variant: "destructive",
      });
      return;
    }
    setIsAiSummaryLoading(true);
    try {
      const result = await getAISummaryForDecision({ decisionContent: decisionContentValue });
      if ("error" in result) {
        toast({ title: "AI Summary Error", description: result.error, variant: "destructive" });
      } else {
        form.setValue("summary", result.summary);
        toast({ title: "AI Summary Suggested", description: "Summary field has been populated." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch AI summary.", variant: "destructive" });
    } finally {
      setIsAiSummaryLoading(false);
    }
  };

  const handleFormSubmit = async (data: DecisionFormData, submitStatus: 'draft' | 'published') => {
    setIsSubmitting(true);
    try {
      const decisionData: Omit<Decision, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        status: submitStatus,
      };
      const result = await createDecision(decisionData);

      if ("error" in result) {
        toast({
          title: "Error creating decision",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: submitStatus === 'published' ? "Decision Published" : "Decision Saved as Draft",
          description: `"${result.title}" has been successfully ${submitStatus === 'published' ? 'published' : 'saved as a draft'}.`,
        });
        form.reset();
        router.push("/admin/decisions");
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred while creating the decision.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <FileText className="mr-3 h-8 w-8" /> Create New Decision
        </h2>
        <Button variant="outline" asChild>
          <Link href="/admin/decisions">Cancel</Link>
        </Button>
      </div>
      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Decision Details</CardTitle>
              <CardDescription>Fill in the information for the new official decision.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Arrêté municipal n°2024-XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Content / Abstract</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed content or abstract of the decision..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                        <FormLabel>Summary (Optional)</FormLabel>
                        <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAiSuggestSummary}
                        disabled={isAiSummaryLoading || isSubmitting}
                        >
                        {isAiSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Suggest with AI
                        </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="A brief, citizen-friendly summary of the decision..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="decisionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Decision Date</FormLabel>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AM-2024-001, DEL-2024-015" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Urbanisme, Transport" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Comma-separated values. Use thematic categories relevant for notifications.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., circulation, budget, sécurité" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Comma-separated values.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="attachmentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachment URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/decision.pdf" {...field} />
                    </FormControl>
                    <FormDescription>Link to the official PDF document, if available.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(data => handleFormSubmit(data, "draft"))}
                disabled={isSubmitting || isAiSummaryLoading}
                className="w-full sm:w-auto"
              >
                {(isSubmitting || isAiSummaryLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(data => handleFormSubmit(data, "published"))}
                disabled={isSubmitting || isAiSummaryLoading}
                className="w-full sm:w-auto"
              >
                {(isSubmitting || isAiSummaryLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Decision
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
