import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, FileUp, CloudUpload, X, FileText, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Presentation } from "@/types";

interface Props {
  presentation?: Presentation;
}

export default function PromptInput({ presentation }: Props) {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState(presentation?.prompt || "");
  const [aiModel, setAiModel] = useState("groq-mixtral");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateOutlineMutation = useMutation({
    mutationFn: async (data: { prompt: string; documents: File[]; aiModel: string }) => {
      const formData = new FormData();
      formData.append("prompt", data.prompt);
      formData.append("aiModel", data.aiModel);
      
      data.documents.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await fetch("/api/presentations/generate-outline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate outline");
      }

      return response.json();
    },
    onSuccess: (newPresentation) => {
      toast({
        title: "Outline Generated",
        description: "Your presentation outline has been created successfully.",
      });
      setLocation(`/builder/${newPresentation.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/presentations", newPresentation.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate outline. Please check your API keys and try again.",
        variant: "destructive",
      });
      console.error("Generate outline error:", error);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate your presentation.",
        variant: "destructive",
      });
      return;
    }

    generateOutlineMutation.mutate({
      prompt,
      documents: uploadedFiles,
      aiModel,
    });
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create Presentation</h2>
        
        {/* Prompt Input */}
        <div className="mb-6">
          <Label className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <Lightbulb className="w-4 h-4 mr-2 text-accent" />
            Describe your presentation
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a 10-slide presentation about sustainable energy solutions for businesses, including market trends, technologies, and implementation strategies..."
            className="h-32 resize-none"
          />
        </div>

        {/* Document Upload */}
        <div className="mb-6">
          <Label className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <FileUp className="w-4 h-4 mr-2 text-secondary" />
            Upload documents (optional)
          </Label>
          
          <div className="relative">
            <Input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="space-y-2">
                <CloudUpload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600">Drop files here or click to upload</p>
                <p className="text-xs text-slate-500">Supports PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>
          
          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-700">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-red-500 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={generateOutlineMutation.isPending}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-3 shadow-sm"
        >
          {generateOutlineMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generate Outline
            </>
          )}
        </Button>

        {/* AI Model Selection */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Label className="block text-sm font-medium text-slate-700 mb-2">AI Model</Label>
          <Select value={aiModel} onValueChange={setAiModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groq-mixtral">Groq - Mixtral 8x7B (Fast)</SelectItem>
              <SelectItem value="together-llama">Together.ai - Llama 2 70B</SelectItem>
              <SelectItem value="openrouter-mistral">OpenRouter - Mistral 7B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
