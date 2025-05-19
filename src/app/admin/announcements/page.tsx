
"use client";

import { useState, useEffect } from "react";
import type { Announcement } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
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
import { getAnnouncements, deleteAnnouncement } from "@/lib/actions/announcements";

export default function AnnouncementsListPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAnnouncements() {
      setIsLoading(true);
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load announcements.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnnouncements();
  }, [toast]);

  const handleDeleteClick = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!announcementToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteAnnouncement(announcementToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Announcement deleted successfully.",
        });
        setAnnouncements(prev => prev.filter(ann => ann.id !== announcementToDelete.id));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete announcement.",
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
      setAnnouncementToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">Manage and view all published and draft announcements.</p>
        </div>
        <Link href="/admin/announcements/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </Link>
      </div>

      {announcements.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Announcements Yet</CardTitle>
            <CardDescription>Start by creating your first announcement.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/announcements/new" passHref>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Announcement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div className="w-16 h-12 rounded-md overflow-hidden relative border">
                        <Image 
                          src={announcement.imageUrl || "https://placehold.co/100x80.png"} 
                          alt={announcement.title} 
                          layout="fill" 
                          objectFit="cover"
                          data-ai-hint="community event"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      <Badge variant={announcement.status === "published" ? "default" : "secondary"}>
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {Array.isArray(announcement.categories) ? announcement.categories.join(", ") : announcement.categories || "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(announcement.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/admin/announcements/edit/${announcement.id}`} passHref>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteClick(announcement)}
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

      {announcementToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this announcement?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the announcement titled &quot;{announcementToDelete.title}&quot;.
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
