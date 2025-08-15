# Tennis AI Prediction Platform

## Overview

This is an AI-driven tennis match prediction platform that leverages a multi-agent system to analyze tennis matches and generate predictions. The platform combines real-time data analysis, advanced AI modeling, and a sophisticated web interface to provide comprehensive tennis match predictions with detailed reasoning and confidence levels.

The system is designed to analyze 15+ different factors affecting tennis match outcomes, including recent performance, surface suitability, playing styles, physical condition, statistical patterns, and contextual information. Each analysis factor is handled by specialized AI agents working in coordination to produce highly accurate predictions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Architecture
The application follows a monorepo structure with shared TypeScript schemas and utilities between client and server. The codebase uses modern ES modules throughout with strict TypeScript configuration for type safety.

### Frontend Architecture
- **React SPA**: Built with React 18 using functional components and hooks
- **Routing**: Wouter library for client-side routing (lightweight React Router alternative)
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom divine/luxury theming (gold/black color scheme)
- **State Management**: TanStack Query for server state management and caching
- **Real-time Updates**: WebSocket integration for live agent status and prediction updates

### Backend Architecture
- **Express.js Server**: RESTful API with WebSocket support for real-time features
- **Multi-Agent System**: Orchestrated AI agents specialized in different analysis factors:
  - Recent Performance Agents (match analysis, momentum, clutch performance)
  - Surface Environment Agents (court conditions, surface suitability)
  - Statistical Agents (service performance, return game, match statistics)
  - Physical Condition Agents (workload, recovery, fitness)
  - Matchup Agents (playing styles, tactical analysis)
  - Contextual Agents (news monitoring, injury updates, coaching changes)
- **AI Orchestrator**: Coordinates multiple agents and synthesizes their analyses
- **Storage Layer**: Abstracted data access with comprehensive tennis data models

### Database Design
- **PostgreSQL**: Primary database with Drizzle ORM for type-safe database operations
- **Neon Serverless**: Cloud PostgreSQL provider for scalable database hosting
- **Schema Structure**: Comprehensive tennis data models including:
  - Players (rankings, stats, playing styles)
  - Tournaments (surfaces, categories, locations)
  - Matches (results, statistics, scheduling)
  - Predictions (AI analysis results, confidence levels)
  - Agent Analysis (factor-specific insights and reasoning)
  - News Articles (contextual information for predictions)

### AI Integration (100% Implemented)
- **OpenAI GPT-4**: Core AI model for prediction synthesis and analysis - FULLY INTEGRATED
- **Specialized Agents**: 25+ agents implemented across 6 factors, each with GPT-4 reasoning
- **Multi-Agent Orchestration**: All agents working in parallel with coordinated analysis
- **Confidence Scoring**: Probabilistic prediction outputs with detailed AI reasoning
- **Real-time Processing**: Live analysis updates via WebSocket connections

#### Implemented Agent Categories:
1. **Recent Performance Agents** (5 agents) - Analyzes last 52 weeks of player performance
2. **Surface & Environment Agents** (5 agents) - Evaluates court conditions and player adaptability  
3. **Statistical Agents** (5 agents) - Deep statistical analysis of serving, returning, rally patterns
4. **Physical Condition Agents** (4 agents) - Monitors fitness, fatigue, and injury status
5. **Matchup Agents** (4 agents) - Analyzes head-to-head and playing style matchups
6. **Contextual Agents** (4 agents) - Tracks news, motivation, and external factors

### Data Pipeline
- **Tennis Data Sources**: Integration with multiple tennis data providers
- **Web Scraping**: Automated data collection from tennis websites
- **Real-time Updates**: Live match results and player information
- **Historical Data**: Comprehensive match history and statistical analysis
- **News Monitoring**: Automated tracking of tennis-related news and updates

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

### AI and Data Services
- **OpenAI API**: GPT-4 model for AI predictions and analysis
- **Tennis Data APIs**: External tennis data providers for match information
- **News APIs**: Real-time tennis news and contextual information
- **Weather APIs**: Court condition analysis for outdoor tournaments

### Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **TanStack Query**: Server state management with caching and synchronization
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Wouter**: Lightweight routing library for React applications

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking across the entire codebase
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Real-time Communication
- **WebSocket**: Native WebSocket implementation for real-time updates
- **Express.js**: Web framework with middleware for API and static serving

### Authentication and Session Management
- **Connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session management middleware

The architecture is designed for scalability and maintainability, with clear separation between the AI analysis engine, data management layer, and user interface. The multi-agent approach allows for specialized analysis while maintaining system modularity and extensibility for future sports beyond tennis.