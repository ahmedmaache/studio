import { getAnnouncements } from "@/lib/actions/announcements";
import type { Announcement } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AnnouncementsListPage() {
  const announcements = await getAnnouncements();

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
                  <TableHead>Published</TableHead>
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
                        {announcement.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {announcement.categories?.join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      {announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleDateString() : "Draft"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive">
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
    </div>
  );
}
