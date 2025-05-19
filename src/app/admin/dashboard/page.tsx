
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, FileText, Users, Library } from "lucide-react";
import { getAnnouncements } from "@/lib/actions/announcements";

export default async function DashboardPage() {
  const allAnnouncements = await getAnnouncements();
  const publishedAnnouncementsCount = allAnnouncements.filter(ann => ann.status === 'published').length;
  const draftAnnouncementsCount = allAnnouncements.filter(ann => ann.status === 'draft').length;
  const totalAnnouncementsCount = allAnnouncements.length;

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
            {/* <p className="text-xs text-muted-foreground">
              +10% from last month
            </p> */}
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
            {/* <p className="text-xs text-muted-foreground">
              +2 new today
            </p> */}
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
            {/* <p className="text-xs text-muted-foreground">
              Managed in the system
            </p> */}
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
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display. More statistics and features will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

