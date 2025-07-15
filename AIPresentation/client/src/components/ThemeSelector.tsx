import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Palette, Play, Minus, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Presentation, PresentationSettings } from "@/types";

interface Props {
  presentation?: Presentation;
}

const themes = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean & Corporate",
    gradient: "from-blue-600 to-blue-700",
    colors: ["bg-blue-600", "bg-slate-100", "bg-slate-800"]
  },
  {
    id: "modern",
    name: "Modern", 
    description: "Vibrant & Creative",
    gradient: "from-purple-500 to-pink-500",
    colors: ["bg-purple-500", "bg-pink-500", "bg-white border border-slate-200"]
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple & Elegant", 
    gradient: "from-slate-400 to-slate-600",
    colors: ["bg-slate-800", "bg-slate-300", "bg-white border border-slate-200"]
  },
  {
    id: "academic",
    name: "Academic",
    description: "Research & Educational",
    gradient: "from-emerald-600 to-teal-600", 
    colors: ["bg-emerald-600", "bg-teal-100", "bg-slate-700"]
  }
];

export default function ThemeSelector({ presentation }: Props) {
  const [selectedTheme, setSelectedTheme] = useState(presentation?.theme || "professional");
  const [settings, setSettings] = useState<PresentationSettings>(
    presentation?.settings || {
      ratio: "16:9",
      fontSize: "medium",
      animations: true
    }
  );
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePresentationMutation = useMutation({
    mutationFn: async (updates: { theme?: string; settings?: PresentationSettings }) => {
      if (!presentation?.id) throw new Error("No presentation ID");
      
      const response = await apiRequest("PATCH", `/api/presentations/${presentation.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presentations", presentation?.id] });
      toast({
        title: "Settings Updated",
        description: "Presentation settings have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    if (presentation?.id) {
      updatePresentationMutation.mutate({ theme: themeId });
    }
  };

  const handleSettingsChange = (newSettings: Partial<PresentationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    if (presentation?.id) {
      updatePresentationMutation.mutate({ settings: updatedSettings });
    }
  };

  const adjustFontSize = (direction: "up" | "down") => {
    const sizes = ["small", "medium", "large"];
    const currentIndex = sizes.indexOf(settings.fontSize);
    let newIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
    newIndex = Math.max(0, Math.min(sizes.length - 1, newIndex));
    
    handleSettingsChange({ fontSize: sizes[newIndex] as "small" | "medium" | "large" });
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          <Palette className="w-5 h-5 mr-2 text-secondary inline" />
          Presentation Themes
        </h2>
        
        {/* Theme Grid */}
        <div className="space-y-3 mb-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                selectedTheme === theme.id 
                  ? "border-primary bg-primary/5" 
                  : "border-slate-300 hover:border-primary"
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-6 bg-gradient-to-r ${theme.gradient} rounded`}></div>
                <div>
                  <h3 className="font-medium text-slate-800 text-sm">{theme.name}</h3>
                  <p className="text-xs text-slate-500">{theme.description}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                {theme.colors.map((color, index) => (
                  <div key={index} className={`w-3 h-3 rounded-sm ${color}`}></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Presentation Settings */}
        <div className="pt-6 border-t border-slate-200">
          <h3 className="font-medium text-slate-800 mb-3">Settings</h3>
          
          {/* Slide Ratio */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-slate-700 mb-2">Slide Ratio</Label>
            <Select
              value={settings.ratio}
              onValueChange={(value: "16:9" | "4:3" | "1:1") => handleSettingsChange({ ratio: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-slate-700 mb-2">Font Size</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustFontSize("down")}
                disabled={settings.fontSize === "small"}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="flex-1 text-center text-sm font-medium capitalize">
                {settings.fontSize}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustFontSize("up")}
                disabled={settings.fontSize === "large"}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Animation Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700">Slide Animations</Label>
            <Switch
              checked={settings.animations}
              onCheckedChange={(checked) => handleSettingsChange({ animations: checked })}
            />
          </div>
        </div>

        {/* Preview Button */}
        <div className="mt-6">
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => {
              toast({
                title: "Preview Mode",
                description: "Presentation preview would open here",
              });
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Preview Slides
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
