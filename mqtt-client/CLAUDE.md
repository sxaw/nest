# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Linting
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

This is a React + TypeScript MQTT Explorer application built with Vite, designed for connecting to MQTT brokers and exploring topics/messages in real-time.

### Core Technology Stack

- **Frontend**: React 19 with TypeScript, built with Vite
- **UI Framework**: TailwindCSS v4 with shadcn/ui components
- **MQTT Client**: MQTT.js library for WebSocket connections
- **State Management**: React Context API with custom hooks
- **Theme**: next-themes for dark/light/system theme switching

### Application Structure

#### Provider Architecture

The application uses a provider-based architecture centered around the `MQTTProvider`:

- **MQTTProvider** (`src/providers/MqttProvider.tsx`): Central state management for MQTT connections, messages, and operations
- **MQTTContext** (`src/providers/mqtt-context.ts`): TypeScript context interface defining the MQTT API
- **useMQTT Hook** (`src/hooks/use-mqtt.ts`): Custom hook for accessing MQTT context

#### Component Organization

```
src/
├── components/
│   ├── layout/           # Layout components (Header, Sidebar, MainLayout)
│   ├── mqtt/             # MQTT-specific feature components
│   │   ├── ConnectionPanel.tsx    # Broker connection UI
│   │   ├── SubscriptionPanel.tsx  # Topic subscription management
│   │   ├── PublishPanel.tsx       # Message publishing interface
│   │   ├── ExplorerPanel.tsx      # Message/topic exploration
│   │   ├── StatisticsPanel.tsx    # Connection and message statistics
│   │   └── AnalyticsPanel.tsx     # Advanced analytics view
│   └── ui/               # shadcn/ui components
├── providers/            # React contexts and providers
├── hooks/               # Custom React hooks
└── lib/                 # Utility functions
```

#### Key Features and Workflows

**MQTT Connection Management:**
- WebSocket-based MQTT connections (supports ws:// and wss://)
- Authentication with username/password
- Auto-reconnection with configurable intervals
- Connection status tracking and error handling

**Message Handling:**
- Real-time message reception and display
- Topic subscription/unsubscription
- Message publishing with configurable QoS and retain flags
- Auto-subscription to all topics (#) option
- Message history (keeps last 1000 messages)

**UI/UX Patterns:**
- Responsive design with mobile sidebar (Sheet component)
- Tab-based navigation between Explorer and Analytics views
- Real-time status updates and loading states
- Accessible form controls with proper ARIA labels

### State Management Pattern

The application uses React's Context API for global state:

1. **MQTTProvider** manages all MQTT-related state and operations
2. Components consume the context via the **useMQTT** hook
3. State includes: connection status, messages, client instance, and operations
4. Automatic cleanup on component unmount

### Development Patterns

#### Component Development

- Use functional components with TypeScript interfaces
- Implement proper error boundaries and loading states
- Follow shadcn/ui patterns for consistent styling
- Use TailwindCSS classes with responsive design principles

#### MQTT Integration

- All MQTT operations go through the centralized provider
- Connection parameters are configurable through the ConnectionPanel
- Message handling includes proper error logging and state updates
- Support for different QoS levels and retained messages

#### Path Aliases

The project uses `@` alias for the `src/` directory, configured in Vite config:
```typescript
import { useMQTT } from '@/hooks/use-mqtt';
import { Button } from '@/components/ui/button';
```

### Configuration

- **Vite Config**: Includes React plugin, TailwindCSS plugin, and path aliases
- **TypeScript**: Strict configuration with proper type checking
- **ESLint**: React-specific linting rules with hooks validation
- **Build**: Outputs to `dist/` with optimized production build

### MQTT Broker Connection

The application is designed to work with MQTT brokers that support WebSocket connections:
- Default connection: `ws://localhost:9001`
- Supports secure WebSocket connections (wss://)
- Configurable authentication and auto-subscription features
- Client ID generation with random suffix for uniqueness