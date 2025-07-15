import { 
  presentations, 
  documents, 
  slideImages, 
  type Presentation, 
  type Document, 
  type SlideImageRecord,
  type InsertPresentation, 
  type InsertDocument, 
  type InsertSlideImage 
} from "@shared/schema";

export interface IStorage {
  // Presentations
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  getPresentation(id: number): Promise<Presentation | undefined>;
  updatePresentation(id: number, updates: Partial<InsertPresentation>): Promise<Presentation | undefined>;
  deletePresentation(id: number): Promise<boolean>;
  
  // Documents
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByPresentationId(presentationId: number): Promise<Document[]>;
  
  // Slide Images
  createSlideImage(slideImage: InsertSlideImage): Promise<SlideImageRecord>;
  getSlideImagesByPresentationId(presentationId: number): Promise<SlideImageRecord[]>;
  deleteSlideImage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private presentations: Map<number, Presentation>;
  private documents: Map<number, Document>;
  private slideImages: Map<number, SlideImageRecord>;
  private currentPresentationId: number;
  private currentDocumentId: number;
  private currentSlideImageId: number;

  constructor() {
    this.presentations = new Map();
    this.documents = new Map();
    this.slideImages = new Map();
    this.currentPresentationId = 1;
    this.currentDocumentId = 1;
    this.currentSlideImageId = 1;
  }

  async createPresentation(insertPresentation: InsertPresentation): Promise<Presentation> {
    const id = this.currentPresentationId++;
    const presentation: Presentation = { 
      ...insertPresentation, 
      id,
      createdAt: new Date()
    };
    this.presentations.set(id, presentation);
    return presentation;
  }

  async getPresentation(id: number): Promise<Presentation | undefined> {
    return this.presentations.get(id);
  }

  async updatePresentation(id: number, updates: Partial<InsertPresentation>): Promise<Presentation | undefined> {
    const existing = this.presentations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.presentations.set(id, updated);
    return updated;
  }

  async deletePresentation(id: number): Promise<boolean> {
    return this.presentations.delete(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id,
      presentationId: insertDocument.presentationId || null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocumentsByPresentationId(presentationId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.presentationId === presentationId
    );
  }

  async createSlideImage(insertSlideImage: InsertSlideImage): Promise<SlideImageRecord> {
    const id = this.currentSlideImageId++;
    const slideImage: SlideImageRecord = { 
      ...insertSlideImage, 
      id,
      presentationId: insertSlideImage.presentationId || null
    };
    this.slideImages.set(id, slideImage);
    return slideImage;
  }

  async getSlideImagesByPresentationId(presentationId: number): Promise<SlideImageRecord[]> {
    return Array.from(this.slideImages.values()).filter(
      img => img.presentationId === presentationId
    );
  }

  async deleteSlideImage(id: number): Promise<boolean> {
    return this.slideImages.delete(id);
  }
}

export const storage = new MemStorage();
