# SlideCraft AI - Replit Configuration

## Overview

SlideCraft AI is an AI-powered presentation builder that enables users to create professional slide presentations from natural language prompts and uploaded documents. The application combines React/TypeScript frontend with Express.js backend, using modern web technologies to deliver a seamless presentation creation experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming

### Monorepo Structure
The application uses a monorepo structure with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common TypeScript types and database schemas

## Key Components

### Frontend Architecture
- **React Router**: wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Comprehensive shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: Multer integration for document and image uploads

### Backend Architecture
- **RESTful API**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL
- **File Storage**: In-memory storage implementation (development)
- **AI Integration**: Prepared for LLM integration (Groq/Mixtral)

### Database Schema
Three main entities:
1. **Presentations**: Core presentation data with JSON slide content
2. **Documents**: Uploaded files associated with presentations
3. **Slide Images**: Image attachments for specific slides

## Data Flow

### Presentation Creation Flow
1. User enters prompt and optionally uploads documents
2. Backend processes documents and sends to AI service
3. AI generates structured slide outline
4. Frontend displays editable outline in slide cards
5. User can modify slides, add images, and apply themes
6. Export functionality generates PDF/PPTX files

### Real-time Updates
- Client-side state management with optimistic updates
- Server state synchronization via TanStack Query
- Form validation using Zod schemas shared between client/server

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **multer**: File upload handling

### AI/ML Integration
- Prepared for Groq/Mixtral LLM integration
- Document processing capabilities
- Structured prompt generation

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation
- Replit-specific development enhancements
- Environment variable configuration for database

### Production Build Process
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Single deployment artifact with static file serving

### Database Strategy
- PostgreSQL database (Neon serverless recommended)
- Drizzle migrations for schema management
- Environment-based configuration
- Connection pooling for production scalability

### Key Architectural Decisions

**Monorepo with Shared Types**: Chosen for type safety between frontend and backend, enabling shared Zod schemas and TypeScript interfaces.

**Drizzle ORM**: Selected for type-safe database operations with excellent TypeScript integration and migration support.

**shadcn/ui Component System**: Provides consistent, accessible UI components with Tailwind CSS styling and easy customization.

**TanStack Query**: Handles complex server state management, caching, and synchronization between client and server.

**File Upload Strategy**: Multer for handling multipart form data with configurable storage backends for different deployment environments.