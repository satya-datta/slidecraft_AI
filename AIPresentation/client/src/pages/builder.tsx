import { useState } from "react";
import { useParams } from "wouter";
import PromptInput from "@/components/PromptInput";
import OutlineEditor from "@/components/OutlineEditor";
import ThemeSelector from "@/components/ThemeSelector";
import ExportButtons from "@/components/ExportButtons";
import SlidePromptModal from "@/components/SlidePromptModal";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Presentation } from "@/types";

export default function Builder() {
  const params = useParams();
  const presentationId = params.id ? parseInt(params.id) : null;
  
  const [isSlidePromptModalOpen, setIsSlidePromptModalOpen] = useState(false);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);

  const { data: presentation, isLoading } = useQuery<Presentation>({
    queryKey: ["/api/presentations", presentationId],
    enabled: !!presentationId,
  });

  const handleRepromptSlide = (slideIndex: number) => {
    setSelectedSlideIndex(slideIndex);
    setIsSlidePromptModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800">SlideCraft AI</h1>
              <Badge variant="secondary" className="bg-accent/10 text-accent">Beta</Badge>
            </div>

            <ExportButtons presentationId={presentationId} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Prompt Input */}
          <div className="lg:col-span-3">
            <PromptInput presentation={presentation} />
          </div>

          {/* Center - Outline Editor */}
          <div className="lg:col-span-6">
            <OutlineEditor 
              presentation={presentation} 
              onRepromptSlide={handleRepromptSlide}
            />
          </div>

          {/* Right Sidebar - Theme Selector */}
          <div className="lg:col-span-3">
            <ThemeSelector presentation={presentation} />
          </div>
        </div>
      </div>

      {/* Slide Prompt Modal */}
      <SlidePromptModal
        isOpen={isSlidePromptModalOpen}
        onClose={() => setIsSlidePromptModalOpen(false)}
        presentationId={presentationId}
        slideIndex={selectedSlideIndex}
      />
    </div>
  );
}
