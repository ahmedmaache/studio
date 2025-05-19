
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
import type { Announcement } from "@/types";
import { availableCategories } from "@/types"; 
import { Send, MessageSquare, Smartphone, MessageCircle, Loader2, Sparkles } from "lucide-react";
import { getAIDraftedMessage } from "@/lib/actions/ai";

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [sendPush, setSendPush] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getAnnouncements();
      setAnnouncements(data.filter(ann => ann.status === 'published')); 
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

  const handleAiDraftMessage = async () => {
    const selectedAnn = announcements.find(ann => ann.id === selectedAnnouncementId);
    if (!selectedAnn) {
      toast({ title: "Select Announcement", description: "Please select an announcement to draft a message for.", variant: "destructive" });
      return;
    }

    const channels: string[] = [];
    if (sendSms) channels.push("SMS");
    if (sendPush) channels.push("Push Notification");
    if (sendWhatsapp) channels.push("WhatsApp");

    if (channels.length === 0) {
      toast({ title: "Select Channel", description: "Please select at least one communication channel for AI drafting.", variant: "destructive" });
      return;
    }

    setIsAiDrafting(true);
    try {
      const result = await getAIDraftedMessage({
        announcementSummary: selectedAnn.summary || selectedAnn.title,
        selectedChannels: channels,
      });
      if ("error" in result) {
        toast({ title: "AI Drafting Error", description: result.error, variant: "destructive" });
      } else {
        setMessage(result.suggestedMessage);
        toast({ title: "AI Message Suggested", description: "Message content has been populated by AI." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch AI message suggestion.", variant: "destructive" });
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleSend = async () => {
    if (!selectedAnnouncementId && !message) {
      toast({ title: "Error", description: "Please select an announcement or write a custom message.", variant: "destructive" });
      return;
    }
    if (selectedCategories.length === 0) {
      toast({ title: "Error", description: "Please select at least one target category.", variant: "destructive" });
      return;
    }
    if (!sendSms && !sendPush && !sendWhatsapp) {
      toast({ title: "Error", description: "Please select at least one channel (SMS, Push, or WhatsApp).", variant: "destructive" });
      return;
    }

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sentChannels: string[] = [];
    if (sendSms) sentChannels.push("SMS");
    if (sendPush) sentChannels.push("Push");
    if (sendWhatsapp) sentChannels.push("WhatsApp");
    
    toast({
      title: "Communication Sent (Simulated)",
      description: `Message: "${message}" sent to citizens subscribed to ${selectedCategories.join(', ')} via ${sentChannels.join(' and ')}.`,
    });
    
    setIsSending(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const selectedAnnForAIDraft = announcements.find(ann => ann.id === selectedAnnouncementId);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">InfoCitoyen Connect</h2>
      <p className="text-muted-foreground">
        Draft, schedule, and send announcements via SMS, WhatsApp, or Push notification.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>Select an announcement or write/generate a custom message for citizens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="message-content">Message</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAiDraftMessage} 
                disabled={isAiDrafting || !selectedAnnForAIDraft || (!sendSms && !sendPush && !sendWhatsapp)}
              >
                {isAiDrafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest with AI
              </Button>
            </div>
            <Textarea
              id="message-content"
              placeholder="Enter your message here or use AI to suggest..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-sm text-muted-foreground mt-1">Max 160 characters for SMS. WhatsApp & Push allow longer messages.</p>
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
                <Checkbox id="send-whatsapp" checked={sendWhatsapp} onCheckedChange={(checked) => setSendWhatsapp(!!checked)} />
                <Label htmlFor="send-whatsapp" className="flex items-center gap-1 font-normal cursor-pointer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
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
          <Button variant="outline" disabled={isSending || isAiDrafting}>Schedule (Future)</Button>
          <Button onClick={handleSend} disabled={isSending || isAiDrafting}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

