# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sports betting platform with three main components:
- **backend/** - Express.js API server with MongoDB (Mongoose)
- **client/** - React user-facing betting application (Vite + React 19 + TailwindCSS + Redux Toolkit)
- **dashboard/** - React admin panel for managing bets and users (Vite + React 19 + TailwindCSS + Bootstrap + Redux Toolkit)

## Common Commands

### Backend (run from `backend/` directory)
```bash
npm run dev          # Start dev server with nodemon
npm run start        # Start production server
npm run test         # Run tests with vitest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Client (run from `client/` directory)
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint check
```

### Dashboard (run from `dashboard/` directory)
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint check
```

## Architecture

### Backend Structure
- `server.js` - Main entry point, sets up Express server with WebSocket support
- `controllers/` - Business logic for betting (cricket, soccer, tennis, casino), user management, cron jobs
- `models/` - Mongoose schemas for bets, users, admins, transaction history
- `routes/` - API route definitions under `/api` prefix
- `socket/` - WebSocket handlers for real-time betting updates (`bettingSocket.js`)
- `services/` - External service integrations
- `tests/` - Vitest test files with mock data factory

### Frontend Apps (client & dashboard)
- `src/App.jsx` - Main router component
- `src/redux/` - Redux Toolkit store and API slices
- `src/pages/` - Route page components
- `src/components/` - Reusable UI components
- `src/Games/` (client) - Sport-specific betting components (Cricket, Soccer, Tennis, Casino, etc.)

### Key Domain Concepts
- **Exposure** - User's money at risk from placed bets
- **Settlement** - Processing bet results when match ends
- **Fancy Bets** - Special cricket betting markets (session runs, etc.)
- **Market** - A specific betting opportunity within an event

### Real-time Features
- WebSocket server setup via `setupWebSocket()` in server.js
- Socket.io used for live updates between client/dashboard and backend
- Cron jobs run via `cronJobGame1p()` for automated tasks

## Testing

Tests are located in `backend/tests/` using Vitest. Coverage is configured to focus on `betController.js`. Mock data generation is handled by `mockDataFactory.js`.

Run a single test file:
```bash
cd backend && npx vitest run tests/placeBet.test.js
```
