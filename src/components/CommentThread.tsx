import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/grievance-utils";
import type { Comment } from "@/types/grievance";

interface CommentThreadProps {
  grievanceId: string;
  isAdmin?: boolean;
}

export default function CommentThread({ grievanceId, isAdmin = false }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isRequestInfo, setIsRequestInfo] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`comments:${grievanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `grievance_id=eq.${grievanceId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grievanceId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('comments')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('created_at', { ascending: true });

      // If not admin, only show public comments
      if (!isAdmin) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          grievance_id: grievanceId,
          content: newComment.trim(),
          is_public: isPublic,
          is_request_info: isRequestInfo,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment posted successfully",
      });

      setNewComment("");
      setIsPublic(false);
      setIsRequestInfo(false);
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Comments & Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              No comments yet
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${
                    comment.is_public ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {comment.is_public ? (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      {comment.is_request_info && (
                        <Badge variant="default" className="text-xs">
                          Info Request
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={submitting}
              />

              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is-public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      disabled={submitting}
                    />
                    <Label htmlFor="is-public" className="text-sm cursor-pointer">
                      Public (visible to student)
                    </Label>
                  </div>
                  {isPublic && (
                    <div className="flex items-center gap-2 ml-6">
                      <Switch
                        id="is-request-info"
                        checked={isRequestInfo}
                        onCheckedChange={setIsRequestInfo}
                        disabled={submitting}
                      />
                      <Label htmlFor="is-request-info" className="text-sm cursor-pointer">
                        Request more information
                      </Label>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
