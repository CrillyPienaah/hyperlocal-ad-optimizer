# Hyperlocal Ad Optimizer

## Overview

This is a full-stack web application for hyperlocal advertising optimization. The system helps local businesses create, manage, and optimize their advertising campaigns with a focus on geographic targeting and AI-powered content generation. Built with a modern tech stack including React, Express.js, Drizzle ORM, and PostgreSQL.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Custom components built with Radix UI primitives and Tailwind CSS
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with JSON responses
- **External Services**: OpenAI integration for AI-powered content generation
- **Session Management**: Express sessions with PostgreSQL session store

### Key Components

#### Database Schema
- **Businesses Table**: Stores business profiles with comprehensive onboarding data including location, industry, target audience, and budget preferences
- **Campaigns Table**: Manages advertising campaigns with targeting parameters, budgets, and status tracking
- **Campaign Metrics Table**: Tracks performance data for analytics and optimization

#### Core Features
1. **Business Onboarding**: Multi-step process collecting business details, location data, audience targeting, and budget preferences
2. **Campaign Management**: Create, edit, and monitor advertising campaigns with geographic targeting
3. **AI Content Generation**: OpenAI-powered ad copy generation and copywriting assistance
4. **Channel Planning**: Intelligent recommendation system for advertising channels based on business profile
5. **Analytics Dashboard**: Performance tracking with metrics visualization
6. **Geographic Targeting**: Hyperlocal advertising with radius-based targeting

## Data Flow

1. **User Onboarding**: Business information flows through multi-step forms to create comprehensive business profiles
2. **Campaign Creation**: Campaign data is validated and stored with targeting parameters and budget constraints
3. **AI Integration**: Business context is sent to OpenAI API for personalized content generation
4. **Analytics Processing**: Campaign metrics are aggregated for dashboard visualization and performance insights
5. **Channel Recommendations**: Business profile data is analyzed to suggest optimal advertising channels

## External Dependencies

### Production Dependencies
- **Database**: PostgreSQL via Neon Database serverless
- **AI Services**: OpenAI API for content generation
- **UI Components**: Extensive Radix UI component library
- **Charting**: Chart.js for analytics visualization
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation

### Development Dependencies
- **Build Tools**: Vite, ESBuild for bundling
- **Development Server**: TSX for TypeScript execution
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Uses TSX for running TypeScript directly
- **Dev Server**: Vite dev server with Hot Module Replacement
- **Database**: Connects to remote PostgreSQL instance via DATABASE_URL

### Production Deployment
- **Build Process**: 
  1. Vite builds the client-side React application
  2. ESBuild bundles the server-side Express application
- **Static Serving**: Express serves built client files in production
- **Database**: Production PostgreSQL database via environment variables
- **Scaling**: Configured for autoscale deployment on Replit

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string
- **OPENAI_API_KEY**: Required for AI content generation features
- **PORT**: Server port configuration (defaults to 5000)

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.