
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

interface RecentActivityItem {
  id: string;
  title: string;
  updatedAt: Date;
  status: 'draft' | 'published';
  type: 'Announcement' | 'Event' | 'Decision';
  editUrl: string;
}

export default async function DashboardPage() {
  const allAnnouncements = await getAnnouncements();
  const allEvents = await getEvents();
  const allDecisions = await getDecisions();

  const totalAnnouncementsCount = allAnnouncements.length;
  const totalEventsCount = allEvents.length;
  const totalDecisionsCount = allDecisions.length;

  const mappedAnnouncements: RecentActivityItem[] = allAnnouncements.map(item => ({
    ...item,
    type: 'Announcement',
    editUrl: `/admin/announcements/edit/${item.id}`,
  }));
  const mappedEvents: RecentActivityItem[] = allEvents.map(item => ({
    ...item,
    type: 'Event',
    editUrl: `/admin/events/edit/${item.id}`,
  }));
  const mappedDecisions: RecentActivityItem[] = allDecisions.map(item => ({
    ...item,
    type: 'Decision',
    editUrl: `/admin/decisions/edit/${item.id}`,
  }));

  const combinedActivity: RecentActivityItem[] = [
    ...mappedAnnouncements,
    ...mappedEvents,
    ...mappedDecisions,
  ];

  const recentActivity = combinedActivity
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);


  // Data for Announcements by Category Chart
  const announcementsByCategoryCount: { [key: string]: number } = {};
  allAnnouncements.forEach(ann => {
    ann.categories?.forEach(categoryName => {
      // Ensure we only count categories that are in our defined list
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
    .filter(item => item.count > 0) // Only include categories with data
    .sort((a,b) => b.count - a.count); // Sort for better chart readability

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
            {recentActivity.length > 0 ? (
                <ul className="space-y-3">
                {recentActivity.map((item: RecentActivityItem) => (
                    <li key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md hover:bg-secondary">
                    <div>
                        <p className="font-medium text-sm">{item.title} <span className="text-xs text-muted-foreground">({item.type})</span></p>
                        <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                        {item.status === "draft" && <span className="ml-2 text-amber-600">(Draft)</span>}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={item.editUrl}>
                        View/Edit
                        <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                    </Button>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">No recent activity to display. Start by creating or updating content.</p>
            )}
            </CardContent>
        </Card>
        <Card className="md:col-span-1 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Announcements by Category</CardTitle>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <AnnouncementsByCategoryChart data={categoryChartData} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

