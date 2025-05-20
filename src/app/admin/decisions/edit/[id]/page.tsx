
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { getDecisionById, updateDecision } from "@/lib/actions/decisions";
import { getAISummaryForDecision } from "@/lib/actions/ai";
import { Loader2, CalendarIcon, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
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

export default function EditDecisionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const decisionId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [decisionNotFound, setDecisionNotFound] = useState(false);

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

  useEffect(() => {
    if (decisionId) {
      setIsLoadingData(true);
      getDecisionById(decisionId)
        .then(data => {
          if (data) {
            const formDataToReset = {
              ...data,
              decisionDate: new Date(data.decisionDate),
              categories: data.categories ? data.categories.join(', ') : "",
              tags: data.tags ? data.tags.join(', ') : "",
            };
            form.reset(formDataToReset);
            setDecisionNotFound(false);
          } else {
            setDecisionNotFound(true);
            toast({
              title: "Error",
              description: "Decision not found.",
              variant: "destructive",
            });
          }
        })
        .catch(error => {
          console.error("Failed to fetch decision:", error);
          toast({
            title: "Error",
            description: "Failed to load decision data.",
            variant: "destructive",
          });
          setDecisionNotFound(true);
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  }, [decisionId, form, toast]);

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

  const onSubmit: SubmitHandler<DecisionFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const decisionUpdateData: Partial<Omit<Decision, "id" | "createdAt" | "updatedAt">> = {
        ...data, 
      };
      const result = await updateDecision(decisionId, decisionUpdateData);
      if ("error" in result) {
        toast({ title: "Error updating decision", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Decision Updated", description: `"${result.title}" has been successfully updated.` });
        router.push("/admin/decisions");
      }
    } catch (error) {
      toast({ title: "Submission Error", description: "An unexpected error occurred while updating the decision.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading decision data...</p>
      </div>
    );
  }

  if (decisionNotFound) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="text-2xl mt-4">Decision Not Found</CardTitle>
          <CardDescription>The decision you are trying to edit does not exist or could not be loaded.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/admin/decisions">Back to Decisions</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <FileText className="mr-3 h-8 w-8" /> Edit Decision
        </h2>
        <Button variant="outline" asChild>
          <Link href="/admin/decisions">Cancel</Link>
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Decision Details</CardTitle>
              <CardDescription>Modify the information for the official decision.</CardDescription>
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
                        <Input placeholder="e.g., Urbanisme, Transport" {...field} 
                         value={field.value || ""} 
                        />
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
                         <Input placeholder="e.g., circulation, budget" {...field} 
                          value={field.value || ""} 
                         />
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isAiSummaryLoading}>
                {(isSubmitting || isAiSummaryLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
