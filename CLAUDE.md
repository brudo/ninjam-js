# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Running
- `npm install` - Install root dependencies (packaging tools) and app dependencies
- `cd app && npm install` - Install app-specific dependencies 
- `cd app && npm run watch` - Build and watch for changes (development mode)
- `cd app && npm run make-dist` - Build once without watching
- `npm start` - Launch the built app using Electron (from root directory)
- `npm run make-chrome` - Build Chrome extension package

### Key Scripts
- Root `package.json`: Contains Electron packaging scripts (`pack`, `dist`, `start`)
- App `package.json`: Contains build scripts (`watch`, `make-dist`, `clean`)

## Architecture Overview

### Project Structure
This is a multi-platform NINJAM client built with web technologies, supporting Electron desktop apps and Chrome extensions.

**Root level:**
- `package.json` - Electron packaging configuration
- `app/` - Main application code
- `build/` - Electron-builder packaging resources

**App structure:**
- `app/src/` - React source code
- `app/static/` - Static assets (HTML, CSS, images, sounds)
- `app/build/` - Webpack build output directory
- `app/webpack.config.js` - Build configuration

### Core Components

**NINJAM Protocol Implementation:**
- `src/ninjam/client.js` - Main NINJAM client implementing the protocol
- `src/ninjam/message-reader.js` & `src/ninjam/message-builder.js` - Protocol message handling
- `src/ninjam/user.js` & `src/ninjam/remote-channel.js` - User and audio channel management
- `src/ninjam/download-manager.js` - Audio data download handling

**Network Layer:**
- `src/net-socket/` - Cross-platform network socket abstraction
- Supports Node.js, Chrome, and Firefox implementations

**UI Components:**
- `src/application.jsx` - Main application container
- `src/pages/server-browser/` - Server discovery and connection UI
- `src/pages/jam-session/` - Main jamming interface with chat, user panels, etc.
- Uses React Router for navigation between server browser and jam session

**Platform Integration:**
- `src/jammr/client.js` - Jammr.net server integration
- `src/storage/` - Cross-platform storage abstraction

### Key Technologies
- **Frontend:** React 19, React Bootstrap, React Router
- **Build:** Webpack 5 with Babel (ES2015 + React presets)
- **Audio:** Web Audio API with Vorbis.js for OGG decoding
- **Networking:** Custom socket abstraction layer
- **Packaging:** Electron Builder for desktop, Chrome extension manifest

### Development Notes
- Entry point: `src/entry.jsx` renders the React Router setup
- The build system copies static assets and bundles JSX/JS into `app/build/`
- Audio files (metronome sounds) are in `static/snd/`
- The app supports both NINJAM and Jammr protocols
- Uses memory history for routing (suitable for Electron/Chrome app contexts)