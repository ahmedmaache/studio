import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BellRing, Users, ListChecks, Mail, MessageSquare } from "lucide-react";
import { availableCategories, type Category, type UserSubscription } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for subscriptions
const mockSubscriptions: UserSubscription[] = [
  { id: 'sub1', userId: 'user123', citizenName: 'Ali Bennani', subscribedCategories: ['Urbanisme', 'Événements Locaux'], prefersSms: true, prefersPush: true, phoneNumber: '+213xxxxxxxxx', pushToken: 'token1' },
  { id: 'sub2', userId: 'user456', citizenName: 'Fatima Zohra', subscribedCategories: ['Santé Publique'], prefersSms: false, prefersPush: true, pushToken: 'token2' },
  { id: 'sub3', userId: 'user789', citizenName: 'Karim Belkacem', subscribedCategories: ['Annonces Officielles', 'Transport'], prefersSms: true, prefersPush: false, phoneNumber: '+213yyyyyyyyy' },
];


export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Citizen Subscriptions</h2>
          <p className="text-muted-foreground">
            Manage citizen subscriptions for SMS and push notifications.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Categories</CardTitle>
          <CardDescription>
            Citizens can subscribe to notifications for these categories. This list is for reference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableCategories.map((category) => (
              <li key={category.id} className="p-3 border rounded-md bg-secondary/50">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <span className="font-medium">{category.name}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Note: Actual citizen subscription management occurs through the citizen mobile application. This section provides an overview and tools for targeted communication.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscribed Citizens</CardTitle>
          <CardDescription>A list of citizens who have subscribed to notifications (mock data).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen Name</TableHead>
                <TableHead>Subscribed Categories</TableHead>
                <TableHead>SMS</TableHead>
                <TableHead>Push</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.citizenName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sub.subscribedCategories.map(cat => <Badge key={cat} variant="outline">{cat}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.prefersSms ? 
                      <Badge variant="default">Enabled</Badge> : 
                      <Badge variant="outline">Disabled</Badge>}
                  </TableCell>
                  <TableCell>
                    {sub.prefersPush ? 
                      <Badge variant="default">Enabled</Badge> : 
                      <Badge variant="outline">Disabled</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
