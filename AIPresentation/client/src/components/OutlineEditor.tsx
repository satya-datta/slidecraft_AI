import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import SlideCard from "./SlideCard";
import { apiRequest } from "@/lib/api";
import type { Presentation, Slide } from "@/types";

interface Props {
  presentation?: Presentation;
  onRepromptSlide: (slideIndex: number) => void;
}

export default function OutlineEditor({ presentation, onRepromptSlide }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePresentationMutation = useMutation({
    mutationFn: async (updates: Partial<Presentation>) => {
      if (!presentation?.id) throw new Error("No presentation ID");
      
      const response = await apiRequest("PATCH", `/api/presentations/${presentation.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presentations", presentation?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update presentation",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const handleSlideUpdate = (slideIndex: number, updatedSlide: Slide) => {
    if (!presentation) return;
    
    const updatedSlides = [...presentation.slides];
    updatedSlides[slideIndex] = updatedSlide;
    
    updatePresentationMutation.mutate({ slides: updatedSlides });
  };

  const handleDeleteSlide = (slideIndex: number) => {
    if (!presentation) return;
    
    const updatedSlides = presentation.slides.filter((_, index) => index !== slideIndex);
    updatePresentationMutation.mutate({ slides: updatedSlides });
  };

  const handleAddSlide = () => {
    if (!presentation) return;
    
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: "New Slide",
      bullets: ["Add your content here"],
      layout: "title-bullets",
      images: [],
      notes: ""
    };
    
    const updatedSlides = [...presentation.slides, newSlide];
    updatePresentationMutation.mutate({ slides: updatedSlides });
  };

  if (!presentation) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Presentation Loaded</h3>
        <p className="text-slate-600">Create a new presentation to start building your slides</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Presentation Outline</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last updated: 2 minutes ago</span>
          </div>
        </div>
        <p className="text-slate-600 mt-1">Edit titles, bullet points, and add images for each slide</p>
      </div>

      <div className="space-y-4">
        {presentation.slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            slideIndex={index}
            onUpdate={(updatedSlide) => handleSlideUpdate(index, updatedSlide)}
            onDelete={() => handleDeleteSlide(index)}
            onReprompt={() => onRepromptSlide(index)}
            presentationId={presentation.id}
          />
        ))}

        {/* Add Slide Button */}
        <div className="mt-6">
          <Button
            onClick={handleAddSlide}
            variant="outline"
            className="w-full border-2 border-dashed border-slate-300 rounded-xl py-8 text-center hover:border-primary hover:bg-primary/5 transition-colors group h-auto"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-primary/10 rounded-full flex items-center justify-center group-hover:text-primary transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-slate-600 group-hover:text-primary font-medium">Add New Slide</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
