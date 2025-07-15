export interface Slide {
  id: string;
  title: string;
  bullets: string[];
  layout: "title-bullets" | "image-text" | "full-image";
  images: string[];
  notes?: string;
}

export interface PresentationSettings {
  ratio: "16:9" | "4:3" | "1:1";
  fontSize: "small" | "medium" | "large";
  animations: boolean;
}

export interface Presentation {
  id: number;
  title: string;
  prompt: string;
  slides: Slide[];
  theme: string;
  settings: PresentationSettings;
  createdAt: Date;
}

export interface Document {
  id: number;
  filename: string;
  content: string;
  type: string;
  presentationId: number;
}

export interface SlideImageRecord {
  id: number;
  filename: string;
  url: string;
  slideIndex: number;
  presentationId: number;
}
