
"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
        <Button variant="outline" asChild>
          <Link href="/admin/events">Cancel</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Event: {eventId}</CardTitle>
          <CardDescription>Modify the details for this event.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Event editing form will be here for event ID: {eventId}.</p>
          {/* TODO: Implement event editing form */}
        </CardContent>
      </Card>
    </div>
  );
}
