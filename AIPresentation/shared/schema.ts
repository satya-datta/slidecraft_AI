import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  slides: jsonb("slides").notNull().$type<Slide[]>(),
  theme: text("theme").notNull().default("professional"),
  settings: jsonb("settings").notNull().$type<PresentationSettings>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  presentationId: integer("presentation_id").references(() => presentations.id),
});

export const slideImages = pgTable("slide_images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  slideIndex: integer("slide_index").notNull(),
  presentationId: integer("presentation_id").references(() => presentations.id),
});

// Types
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

// Insert schemas
export const insertPresentationSchema = createInsertSchema(presentations).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
});

export const insertSlideImageSchema = createInsertSchema(slideImages).omit({
  id: true,
});

// Types
export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertSlideImage = z.infer<typeof insertSlideImageSchema>;

export type Presentation = typeof presentations.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type SlideImageRecord = typeof slideImages.$inferSelect;
