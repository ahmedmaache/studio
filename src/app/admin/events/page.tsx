
"use client";

import { useState, useEffect } from "react";
import type { Event } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Edit3, Trash2, Loader2, CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getEvents, deleteEvent } from "@/lib/actions/events";

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load events.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, [toast]);

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteEvent(eventToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Event deleted successfully.",
        });
        setEvents(prev => prev.filter(evt => evt.id !== eventToDelete.id));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setEventToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">Manage and view all upcoming and past events.</p>
        </div>
        <Link href="/admin/events/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No Events Yet</CardTitle>
            <CardDescription>Start by creating your first event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/events/new" passHref>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="w-16 h-12 rounded-md overflow-hidden relative border">
                        <Image 
                          src={event.imageUrl || "https://placehold.co/64x48.png"} 
                          alt={event.title} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint="community event"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {event.location}
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.status === "published" ? "default" : "secondary"}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/admin/events/edit/${event.id}`} passHref>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteClick(event)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {eventToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event titled &quot;{eventToDelete.title}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
