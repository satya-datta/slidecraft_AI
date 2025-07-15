import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  presentationId: number | null;
  slideIndex: number | null;
}

export default function SlidePromptModal({ isOpen, onClose, presentationId, slideIndex }: Props) {
  const [reprompt, setReprompt] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const repromptMutation = useMutation({
    mutationFn: async ({ reprompt, aiModel }: { reprompt: string; aiModel: string }) => {
      if (!presentationId || slideIndex === null) {
        throw new Error("Missing presentation ID or slide index");
      }

      const response = await apiRequest(
        "POST", 
        `/api/presentations/${presentationId}/slides/${slideIndex}/reprompt`,
        { reprompt, aiModel }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Slide Updated",
        description: "The slide has been updated with AI-generated content.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/presentations", presentationId] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update slide. Please try again.",
        variant: "destructive",
      });
      console.error("Reprompt error:", error);
    },
  });

  const handleClose = () => {
    setReprompt("");
    onClose();
  };

  const handleSubmit = () => {
    if (!reprompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to modify the slide.",
        variant: "destructive",
      });
      return;
    }

    repromptMutation.mutate({
      reprompt,
      aiModel: "groq-mixtral", // Default model for re-prompting
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-secondary" />
            <span>Re-prompt Slide</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <Bot className="w-4 h-4 mr-2 text-secondary" />
              How should this slide be modified?
            </Label>
            <Textarea
              value={reprompt}
              onChange={(e) => setReprompt(e.target.value)}
              placeholder="e.g., Make it more technical, add statistics, focus on benefits for hospitals..."
              className="h-24 resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={repromptMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={repromptMutation.isPending}
              className="flex-1 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white"
            >
              {repromptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Apply AI
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
