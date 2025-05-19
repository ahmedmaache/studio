
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Megaphone, FileText, Users, Library, ExternalLink } from "lucide-react";
import { getAnnouncements } from "@/lib/actions/announcements";
import Link from "next/link";
import type { Announcement } from "@/types";

export default async function DashboardPage() {
  const allAnnouncements = await getAnnouncements(); // Already sorted by createdAt desc in action
  const publishedAnnouncementsCount = allAnnouncements.filter(ann => ann.status === 'published').length;
  const draftAnnouncementsCount = allAnnouncements.filter(ann => ann.status === 'draft').length;
  const totalAnnouncementsCount = allAnnouncements.length;

  // For recent activity, sort by updatedAt
  const recentAnnouncements = [...allAnnouncements]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Announcements
            </CardTitle>
            <Megaphone className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedAnnouncementsCount}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Announcements
            </CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftAnnouncementsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Announcements
            </CardTitle>
            <Library className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnnouncementsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Citizens
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,580</div>
            <p className="text-xs text-muted-foreground">
              (Static Data)
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <List className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {recentAnnouncements.length > 0 ? (
            <ul className="space-y-3">
              {recentAnnouncements.map((announcement: Announcement) => (
                <li key={announcement.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md hover:bg-secondary">
                  <div>
                    <p className="font-medium text-sm">{announcement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(announcement.updatedAt).toLocaleDateString()}
                       {announcement.status === "draft" && <span className="ml-2 text-amber-600">(Draft)</span>}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/announcements/edit/${announcement.id}`}>
                      View/Edit
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No recent activity to display. Start by creating or updating an announcement.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
