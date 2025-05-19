
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
        <Button variant="outline" asChild>
          <Link href="/admin/events">Cancel</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Event Details</CardTitle>
          <CardDescription>Fill in the information for the new event.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Event creation form will be here.</p>
          {/* TODO: Implement event creation form */}
        </CardContent>
      </Card>
    </div>
  );
}
