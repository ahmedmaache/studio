
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NewDecisionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Create New Decision</h2>
         <Button variant="outline" asChild>
          <Link href="/admin/decisions">Cancel</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Decision Details</CardTitle>
          <CardDescription>Fill in the information for the new decision. (Form to be implemented)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Form fields for title, content, decision date, reference number, attachment URL, status, etc., will be here.</p>
           <p className="text-muted-foreground mt-2">AI assistant for summary, categories, and tags can also be integrated.</p>
        </CardContent>
      </Card>
    </div>
  );
}
