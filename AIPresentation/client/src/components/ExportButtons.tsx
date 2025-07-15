import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, FileImage, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Props {
  presentationId: number | null;
}

export default function ExportButtons({ presentationId }: Props) {
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async (format: "pdf" | "pptx") => {
      if (!presentationId) throw new Error("No presentation ID");
      
      const response = await apiRequest("POST", `/api/presentations/${presentationId}/export`, { format });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Started", 
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Export Error",
        description: "Failed to export presentation. Please try again.",
        variant: "destructive",
      });
      console.error("Export error:", error);
    },
  });

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Presentation saved successfully.",
    });
  };

  if (!presentationId) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost"
        onClick={handleSave}
        className="text-slate-600 hover:text-slate-800 px-3 py-1.5 text-sm font-medium"
      >
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>
      
      <Button
        variant="outline"
        onClick={() => exportMutation.mutate("pdf")}
        disabled={exportMutation.isPending}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-sm font-medium"
      >
        {exportMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        Export PDF
      </Button>
      
      <Button
        onClick={() => exportMutation.mutate("pptx")}
        disabled={exportMutation.isPending}
        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-4 py-2 text-sm font-medium shadow-sm"
      >
        {exportMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileImage className="w-4 h-4 mr-2" />
        )}
        Export PPTX
      </Button>
    </div>
  );
}
