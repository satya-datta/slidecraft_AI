import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPresentationSchema, insertDocumentSchema, insertSlideImageSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate outline from prompt and documents
  app.post("/api/presentations/generate-outline", upload.array('documents'), async (req, res) => {
    try {
      const { prompt, aiModel = "groq-mixtral" } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Parse uploaded documents
      let documentContext = "";
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          // Simple text extraction for demo - in production would use pdf-parse, mammoth etc.
          documentContext += `\n\nDocument: ${file.originalname}\nContent: ${file.buffer.toString('utf-8')}\n`;
        }
      }

      // Call LLM API to generate outline
      const outline = await generateOutlineWithLLM(prompt, documentContext, aiModel);
      
      // Create presentation
      const presentation = await storage.createPresentation({
        title: outline.title || "Untitled Presentation",
        prompt,
        slides: outline.slides,
        theme: "professional",
        settings: {
          ratio: "16:9",
          fontSize: "medium",
          animations: true
        }
      });

      res.json(presentation);
    } catch (error) {
      console.error("Error generating outline:", error);
      res.status(500).json({ error: "Failed to generate outline" });
    }
  });

  // Re-prompt a specific slide
  app.post("/api/presentations/:id/slides/:slideIndex/reprompt", async (req, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const slideIndex = parseInt(req.params.slideIndex);
      const { reprompt, aiModel = "groq-mixtral" } = req.body;

      const presentation = await storage.getPresentation(presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }

      if (slideIndex >= presentation.slides.length) {
        return res.status(400).json({ error: "Invalid slide index" });
      }

      const currentSlide = presentation.slides[slideIndex];
      const updatedSlide = await repromptSlideWithLLM(currentSlide, reprompt, aiModel);
      
      const updatedSlides = [...presentation.slides];
      updatedSlides[slideIndex] = updatedSlide;

      const updated = await storage.updatePresentation(presentationId, {
        slides: updatedSlides
      });

      res.json(updated);
    } catch (error) {
      console.error("Error re-prompting slide:", error);
      res.status(500).json({ error: "Failed to re-prompt slide" });
    }
  });

  // Update presentation
  app.patch("/api/presentations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updated = await storage.updatePresentation(id, updates);
      if (!updated) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating presentation:", error);
      res.status(500).json({ error: "Failed to update presentation" });
    }
  });

  // Upload slide image
  app.post("/api/presentations/:id/images", upload.single('image'), async (req, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const { slideIndex } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // In production, you'd upload to cloud storage and get a URL
      // For demo, we'll create a data URL
      const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const slideImage = await storage.createSlideImage({
        filename: req.file.originalname,
        url: dataUrl,
        slideIndex: parseInt(slideIndex),
        presentationId
      });

      res.json(slideImage);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Export presentation
  app.post("/api/presentations/:id/export", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { format } = req.body; // 'pdf' or 'pptx'
      
      const presentation = await storage.getPresentation(id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }

      // In production, implement actual export logic with libraries like:
      // - PptxGenJS for PowerPoint export
      // - html2pdf.js for PDF export
      
      res.json({ 
        message: `Export to ${format.toUpperCase()} initiated`,
        downloadUrl: `/api/presentations/${id}/download/${format}`
      });
    } catch (error) {
      console.error("Error exporting presentation:", error);
      res.status(500).json({ error: "Failed to export presentation" });
    }
  });

  // Get presentation
  app.get("/api/presentations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const presentation = await storage.getPresentation(id);
      
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      
      res.json(presentation);
    } catch (error) {
      console.error("Error fetching presentation:", error);
      res.status(500).json({ error: "Failed to fetch presentation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock LLM API calls - in production, integrate with Groq, Together.ai, OpenRouter
async function generateOutlineWithLLM(prompt: string, documentContext: string, aiModel: string) {
  // This would call the actual LLM API
  const apiKey = process.env.GROQ_API_KEY || process.env.TOGETHER_API_KEY || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("No AI API key configured");
  }

  // Mock response for development - replace with actual API call
  return {
    title: "AI in Healthcare: Transforming Patient Care",
    slides: [
      {
        id: "slide-1",
        title: "AI in Healthcare: Transforming Patient Care",
        bullets: [
          "Revolutionary impact on diagnosis and treatment",
          "Improving patient outcomes through precision medicine",
          "Enhancing efficiency and reducing costs"
        ],
        layout: "title-bullets" as const,
        images: [],
        notes: "Introduction slide setting the stage for the presentation"
      },
      {
        id: "slide-2", 
        title: "Current AI Applications in Healthcare",
        bullets: [
          "Diagnostic imaging and radiology analysis",
          "Drug discovery and development acceleration", 
          "Personalized treatment recommendations",
          "Predictive analytics for patient risk assessment"
        ],
        layout: "title-bullets" as const,
        images: [],
        notes: "Overview of existing AI implementations"
      },
      {
        id: "slide-3",
        title: "Benefits and Impact",
        bullets: [
          "Faster and more accurate diagnoses",
          "Reduced medical errors and improved safety",
          "Cost reduction through automation",
          "Better resource allocation and planning"
        ],
        layout: "title-bullets" as const,
        images: [],
        notes: "Quantifiable benefits of AI adoption"
      }
    ]
  };
}

async function repromptSlideWithLLM(currentSlide: any, reprompt: string, aiModel: string) {
  // Mock implementation - would call actual LLM API
  return {
    ...currentSlide,
    title: currentSlide.title + " (Updated)",
    bullets: currentSlide.bullets.map((bullet: string) => bullet + " - Enhanced"),
    notes: `Updated based on prompt: ${reprompt}`
  };
}
