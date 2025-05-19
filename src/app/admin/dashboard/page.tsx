
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Megaphone, FileText, Users, Library, ExternalLink, BarChart3, CalendarDays } from "lucide-react";
import { getAnnouncements } from "@/lib/actions/announcements";
import { getEvents } from "@/lib/actions/events";
import { getDecisions } from "@/lib/actions/decisions";
import Link from "next/link";
import type { Announcement, Event, Decision } from "@/types";
import { availableCategories } from "@/types";
import { AnnouncementsByCategoryChart } from "@/components/admin/charts/announcements-by-category-chart";

export default async function DashboardPage() {
  const allAnnouncements = await getAnnouncements();
  const allEvents = await getEvents();
  const allDecisions = await getDecisions();

  const totalAnnouncementsCount = allAnnouncements.length;
  const totalEventsCount = allEvents.length;
  const totalDecisionsCount = allDecisions.length;

  // For recent activity, sort by updatedAt (currently only announcements)
  const recentAnnouncements = [...allAnnouncements]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Data for Announcements by Category Chart
  const announcementsByCategoryCount: { [key: string]: number } = {};
  allAnnouncements.forEach(ann => {
    ann.categories?.forEach(categoryName => {
      if (availableCategories.some(c => c.name === categoryName)) {
        announcementsByCategoryCount[categoryName] = (announcementsByCategoryCount[categoryName] || 0) + 1;
      }
    });
  });

  const categoryChartData = availableCategories
    .map(category => ({
      name: category.name,
      count: announcementsByCategoryCount[category.name] || 0,
    }))
    .filter(item => item.count > 0) 
    .sort((a,b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Announcements
            </CardTitle>
            <Megaphone className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnnouncementsCount}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Events
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEventsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Decisions
            </CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDecisionsCount}</div>
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
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
        <Card className="md:col-span-1 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Announcements by Category</CardTitle>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {categoryChartData.length > 0 ? (
                <AnnouncementsByCategoryChart data={categoryChartData} />
              ) : (
                 <p className="text-muted-foreground text-center py-8">No announcements with categories to display in chart.</p>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
