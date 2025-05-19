
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditDecisionPage() {
  const params = useParams();
  const decisionId = params.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Decision {decisionId}</h2>
        <Button variant="outline" asChild>
          <Link href="/admin/decisions">Cancel</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Decision Details</CardTitle>
          <CardDescription>Modify the information for the decision. (Form to be implemented)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Form fields pre-filled with decision data will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
