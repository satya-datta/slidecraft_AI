import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, X, Plus, Bot, Trash2, Image as ImageIcon } from "lucide-react";
import type { Slide } from "@/types";

interface Props {
  slide: Slide;
  slideIndex: number;
  onUpdate: (slide: Slide) => void;
  onDelete: () => void;
  onReprompt: () => void;
  presentationId: number;
}

export default function SlideCard({ slide, slideIndex, onUpdate, onDelete, onReprompt, presentationId }: Props) {
  const [localSlide, setLocalSlide] = useState(slide);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("slideIndex", slideIndex.toString());

      const response = await fetch(`/api/presentations/${presentationId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return response.json();
    },
    onSuccess: (imageData) => {
      const updatedSlide = {
        ...localSlide,
        images: [...localSlide.images, imageData.url]
      };
      setLocalSlide(updatedSlide);
      onUpdate(updatedSlide);
      
      toast({
        title: "Image Uploaded",
        description: "Image has been added to the slide.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      console.error("Image upload error:", error);
    },
  });

  const handleTitleChange = (title: string) => {
    const updatedSlide = { ...localSlide, title };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handleBulletChange = (bulletIndex: number, value: string) => {
    const updatedBullets = [...localSlide.bullets];
    updatedBullets[bulletIndex] = value;
    
    const updatedSlide = { ...localSlide, bullets: updatedBullets };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handleAddBullet = () => {
    const updatedSlide = {
      ...localSlide,
      bullets: [...localSlide.bullets, "New bullet point"]
    };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    const updatedSlide = {
      ...localSlide,
      bullets: localSlide.bullets.filter((_, index) => index !== bulletIndex)
    };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handleLayoutChange = (layout: Slide["layout"]) => {
    const updatedSlide = { ...localSlide, layout };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const removeImage = (imageIndex: number) => {
    const updatedSlide = {
      ...localSlide,
      images: localSlide.images.filter((_, index) => index !== imageIndex)
    };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-semibold text-sm">
              {slideIndex + 1}
            </div>
            <div>
              <h3 className="font-medium text-slate-800">{localSlide.title || "Untitled Slide"}</h3>
              <p className="text-xs text-slate-500">{slideIndex === 0 ? "Title slide" : "Content slide"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReprompt}
              className="text-secondary hover:text-secondary/80 hover:bg-secondary/10"
              title="Re-prompt this slide"
            >
              <Bot className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50"
              title="Delete slide"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slide Title */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-slate-700 mb-2">Slide Title</Label>
          <Input
            value={localSlide.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Bullet Points */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-slate-700 mb-2">Key Points</Label>
          <div className="space-y-2">
            {localSlide.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center space-x-2">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                <Input
                  value={bullet}
                  onChange={(e) => handleBulletChange(bulletIndex, e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBullet(bulletIndex)}
                  className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={handleAddBullet}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium h-8"
            >
              <Plus className="w-3 h-3" />
              <span>Add bullet point</span>
            </Button>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-4">
          <Label className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <ImageIcon className="w-4 h-4 mr-2" />
            Slide Images
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {/* Uploaded Images */}
            {localSlide.images.map((imageUrl, imageIndex) => (
              <div key={imageIndex} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Slide ${slideIndex + 1} image ${imageIndex + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(imageIndex)}
                  className="absolute top-1 right-1 h-5 w-5 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            {/* Upload Area */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer h-24 flex flex-col items-center justify-center">
                <Plus className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Add image</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Selection */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">Layout</Label>
          <div className="flex space-x-2">
            <Button
              variant={localSlide.layout === "title-bullets" ? "default" : "outline"}
              onClick={() => handleLayoutChange("title-bullets")}
              className="flex-1 text-xs h-auto py-2"
            >
              Title + Bullets
            </Button>
            <Button
              variant={localSlide.layout === "image-text" ? "default" : "outline"}
              onClick={() => handleLayoutChange("image-text")}
              className="flex-1 text-xs h-auto py-2"
            >
              Image + Text
            </Button>
            <Button
              variant={localSlide.layout === "full-image" ? "default" : "outline"}
              onClick={() => handleLayoutChange("full-image")}
              className="flex-1 text-xs h-auto py-2"
            >
              Full Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
