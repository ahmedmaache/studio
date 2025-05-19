"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getAnnouncements } from "@/lib/actions/announcements";
import type { Announcement, Category } from "@/types";
import { availableCategories } from "@/types"; // Import available categories
import { Send, MessageSquare, Smartphone, Loader2 } from "lucide-react";

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [sendPush, setSendPush] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getAnnouncements();
      setAnnouncements(data.filter(ann => ann.status === 'published')); // Only published announcements
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (selectedAnnouncementId) {
      const selectedAnn = announcements.find(ann => ann.id === selectedAnnouncementId);
      if (selectedAnn) {
        setMessage(selectedAnn.summary || selectedAnn.title);
      }
    } else {
      setMessage("");
    }
  }, [selectedAnnouncementId, announcements]);

  const handleSend = async () => {
    if (!selectedAnnouncementId && !message) {
      toast({ title: "Error", description: "Please select an announcement or write a custom message.", variant: "destructive" });
      return;
    }
    if (selectedCategories.length === 0) {
      toast({ title: "Error", description: "Please select at least one target category.", variant: "destructive" });
      return;
    }
    if (!sendSms && !sendPush) {
      toast({ title: "Error", description: "Please select at least one channel (SMS or Push).", variant: "destructive" });
      return;
    }

    setIsSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Communication Sent (Simulated)",
      description: `Message: "${message}" sent to citizens subscribed to ${selectedCategories.join(', ')} via ${sendSms ? 'SMS' : ''}${sendSms && sendPush ? ' and ' : ''}${sendPush ? 'Push' : ''}.`,
    });
    
    // Reset form part
    // setSelectedAnnouncementId(undefined);
    // setSelectedCategories([]);
    // setMessage("");
    // setSendSms(false);
    // setSendPush(true);
    setIsSending(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">InfoCitoyen Connect</h2>
      <p className="text-muted-foreground">
        Draft, schedule, and send announcements via SMS or Push notification.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>Select an announcement or write a custom message for citizens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="announcement-select">Select Announcement (Optional)</Label>
            <Select value={selectedAnnouncementId} onValueChange={setSelectedAnnouncementId}>
              <SelectTrigger id="announcement-select">
                <SelectValue placeholder="Choose an existing announcement" />
              </SelectTrigger>
              <SelectContent>
                {announcements.map((ann) => (
                  <SelectItem key={ann.id} value={ann.id}>
                    {ann.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message-content">Message</Label>
            <Textarea
              id="message-content"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-sm text-muted-foreground mt-1">Max 160 characters for SMS, longer for push.</p>
          </div>

          <div>
            <Label>Target Audience (Categories)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-md">
              {availableCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="font-normal cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Channels</Label>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="send-sms" checked={sendSms} onCheckedChange={(checked) => setSendSms(!!checked)} />
                <Label htmlFor="send-sms" className="flex items-center gap-1 font-normal cursor-pointer">
                  <MessageSquare className="h-4 w-4" /> SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="send-push" checked={sendPush} onCheckedChange={(checked) => setSendPush(!!checked)} />
                <Label htmlFor="send-push" className="flex items-center gap-1 font-normal cursor-pointer">
                  <Smartphone className="h-4 w-4" /> Push Notification
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" disabled={isSending}>Schedule (Future)</Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
