# City Simulation Game

## Overview

This project is a browser-based city simulation game built with React and TypeScript. Players can build and manage a virtual city by placing different zones (residential, commercial, industrial) and infrastructure (roads, power lines, water pipes) on a grid-based map. The game features a real-time simulation engine that calculates city growth, population dynamics, happiness levels, and pollution metrics. The application uses a full-stack architecture with Express.js backend and React frontend, though the current implementation focuses primarily on the client-side simulation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Component-based UI architecture using functional components and hooks
- **Canvas-based Rendering**: Custom 2D canvas renderer for the city grid and buildings, optimized for real-time updates
- **Zustand State Management**: Multiple stores handling game state (city data, simulation state, audio controls)
- **Tailwind CSS**: Utility-first styling with Radix UI component library for consistent UI elements
- **Vite Build System**: Fast development server and optimized production builds

### Game Engine Design
- **Grid-based City Model**: 50x30 grid system where each cell can contain zones, buildings, and infrastructure
- **Simulation Engine**: Time-based city growth system that runs every 3 seconds when active
- **Real-time Rendering**: Canvas-based renderer that updates at 60fps for smooth visual feedback
- **Tool System**: Building tools for placing residential, commercial, industrial zones and infrastructure

### State Management Pattern
- **Modular Stores**: Separate Zustand stores for city data, game state, and audio controls
- **Reactive Updates**: Automatic re-rendering when simulation data changes
- **Subscription-based Architecture**: Components subscribe to specific state changes to minimize re-renders

### Backend Architecture
- **Express.js Server**: REST API foundation with middleware setup for logging and error handling
- **Memory Storage**: In-memory data storage for user management (designed to be replaced with database)
- **Drizzle ORM Integration**: Database schema definition using Drizzle with PostgreSQL support
- **Development/Production Split**: Vite integration for development with separate production build process

### Component Architecture
- **UI Layering**: Game canvas as base layer with floating UI panels (toolbar, stats, happiness indicator)
- **Event-driven Interactions**: Canvas click handlers for building placement with tool validation
- **Responsive Design**: Mobile-friendly interface with touch support for canvas interactions

### Build and Development
- **TypeScript Configuration**: Strict type checking with path aliases for clean imports
- **ESM Modules**: Modern ES module system throughout the stack
- **Hot Reload**: Fast development iteration with Vite's hot module replacement
- **Production Optimization**: Separate client and server builds with bundling and minification

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection for production deployments
- **drizzle-orm**: Type-safe database ORM with migration support
- **express**: Web application framework for REST API endpoints
- **react**: Frontend UI framework with hooks and context
- **zustand**: Lightweight state management library

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI components (dialogs, buttons, forms, etc.)
- **tailwindcss**: Utility-first CSS framework with custom design system
- **@fontsource/inter**: Professional typography with Inter font family
- **class-variance-authority**: Type-safe component variant system
- **clsx**: Utility for conditional CSS class names

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### Game-Specific Libraries
- **@tanstack/react-query**: Server state management and caching (prepared for API integration)
- **date-fns**: Date manipulation utilities for time-based game mechanics

### Database and Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Drizzle migrations**: Database schema versioning and deployment system