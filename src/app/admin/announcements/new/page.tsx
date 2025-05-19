
"use client";

import { useState, type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAISuggestions } from "@/lib/actions/ai";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import type { Announcement } from "@/types";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
  imageUrl: z.string().url("Image URL must be a valid URL.").optional().or(z.literal("")),
  summary: z.string().optional(),
  categories: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  tags: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  status: z.enum(["draft", "published"]),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function NewAnnouncementPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      summary: "",
      categories: "", 
      tags: "",       
      status: "draft", // Default status
    },
  });

  const handleAiSuggest = async () => {
    const contentValue = form.getValues("content");
    if (!contentValue || contentValue.trim().length < 20) {
      toast({
        title: "Content too short",
        description: "Please provide more content for AI suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await getAISuggestions({ content: contentValue });
      if ("error" in result) {
        toast({
          title: "AI Suggestion Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        form.setValue("summary", result.summary);
        form.setValue("categories", result.categories.join(', '));
        form.setValue("tags", result.tags.join(', '));
        toast({
          title: "AI Suggestions Applied",
          description: "Summary, categories, and tags have been populated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch AI suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFormSubmit = async (data: AnnouncementFormData, submitStatus: 'draft' | 'published') => {
    setIsSubmitting(true);
    try {
      const announcementData: Omit<Announcement, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        status: submitStatus,
      };
      const result = await createAnnouncement(announcementData);

      if ("error" in result) {
        toast({
          title: "Error creating announcement",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: submitStatus === 'published' ? "Announcement Published" : "Announcement Saved",
          description: `"${result.title}" has been successfully ${submitStatus === 'published' ? 'published' : 'saved as a draft'}.`,
        });
        form.reset(); 
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentImageUrl = form.watch("imageUrl");

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Create New Announcement</h2>
      {/* Removed onSubmit from form tag, using button clicks to trigger submit with status */}
      <Form {...form}>
        <form className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Main Content</CardTitle>
                  <CardDescription>Enter the primary details for your announcement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Announcement Title" {...field} />
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
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full content of the announcement..." {...field} rows={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                        {currentImageUrl && (
                          <div className="mt-2 rounded-md overflow-hidden border aspect-video max-w-sm relative">
                            <Image src={currentImageUrl} alt="Announcement image preview" layout="fill" objectFit="cover" data-ai-hint="public information event"/>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Assistant</CardTitle>
                  <CardDescription>Generate summary, categories, and tags using AI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button type="button" onClick={handleAiSuggest} disabled={isAiLoading || isSubmitting} className="w-full">
                    {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Suggest Metadata
                  </Button>
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Summary</FormLabel>
                        <FormControl>
                          <Textarea placeholder="AI generated summary..." {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => ( 
                      <FormItem>
                        <FormLabel>AI Categories</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Urbanisme, Événement" {...field} 
                           value={field.value || ""} 
                          />
                        </FormControl>
                        <FormDescription>Comma-separated values.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => ( 
                      <FormItem>
                        <FormLabel>AI Tags</FormLabel>
                        <FormControl>
                           <Input placeholder="e.g., réunion, mairie, projet" {...field} 
                            value={field.value || ""} 
                           />
                        </FormControl>
                        <FormDescription>Comma-separated values.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle> {/* Changed title */}
                </CardHeader>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={form.handleSubmit(data => handleFormSubmit(data, "draft"))} 
                      disabled={isSubmitting || isAiLoading} 
                      className="w-full"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save as Draft
                    </Button>
                    <Button 
                      type="button" 
                      onClick={form.handleSubmit(data => handleFormSubmit(data, "published"))} 
                      disabled={isSubmitting || isAiLoading} 
                      className="w-full"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish
                    </Button>
                </CardFooter>
               </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
