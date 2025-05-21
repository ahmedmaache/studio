
"use client";

import { useState, useEffect } from "react";
import type { Decision } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Edit3, Trash2, Loader2, FileText, Download } from "lucide-react";
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
import { getDecisions, deleteDecision } from "@/lib/actions/decisions";

export default function DecisionsListPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<Decision | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDecisions() {
      setIsLoading(true);
      try {
        const data = await getDecisions();
        setDecisions(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load decisions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDecisions();
  }, [toast]);

  const handleDeleteClick = (decision: Decision) => {
    setDecisionToDelete(decision);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!decisionToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteDecision(decisionToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Decision deleted successfully.",
        });
        setDecisions(prev => prev.filter(dec => dec.id !== decisionToDelete.id));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete decision.",
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
      setDecisionToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading decisions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <FileText className="mr-3 h-8 w-8" /> Decisions
          </h2>
          <p className="text-muted-foreground">Manage and view all official decisions.</p>
        </div>
        <Link href="/admin/decisions/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Decision
          </Button>
        </Link>
      </div>

      {decisions.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No Decisions Yet</CardTitle>
            <CardDescription>Start by creating your first decision.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/decisions/new" passHref>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Decision
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reference No.</TableHead>
                  <TableHead>Decision Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((decision) => (
                  <TableRow key={decision.id}>
                    <TableCell className="font-medium max-w-md truncate">{decision.title}</TableCell>
                    <TableCell>{decision.referenceNumber || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(decision.decisionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={decision.status === "published" ? "default" : "secondary"}>
                        {decision.status.charAt(0).toUpperCase() + decision.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {decision.attachmentUrl ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={decision.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-3 w-3" /> View
                          </a>
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/admin/decisions/edit/${decision.id}`} passHref>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteClick(decision)}
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

      {decisionToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this decision?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the decision titled &quot;{decisionToDelete.title}&quot;.
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
