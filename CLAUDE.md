# Maidenless Behavior Podcast - AI Context Guide

## 🎯 Project Overview
**Maidenless Behavior** is a dynamic podcast landing page featuring an interactive, Marathon-inspired cyberpunk desktop OS simulation. The project demonstrates advanced React/TypeScript development with stunning layered visual effects.

**Live URL**: https://mbpodcast.vercel.app/
**Tech Stack**: React 18 + TypeScript + Vite + Custom CSS + WebGL/Canvas

---

## 🖥️ Current Architecture & Components

### Core Application Structure
```
src/
├── App.tsx                 # Main orchestrator with window management
├── components/
│   ├── Desktop.tsx         # Base container component
│   ├── ParticleField.tsx   # Canvas 2D particle animation system
│   ├── FluidEffect.tsx     # WebGL shader fluid dynamics
│   ├── Window.tsx          # Draggable/resizable windows with touch support
│   ├── Dock.tsx           # Marathon-style command interface (5 buttons)
│   ├── MenuBar.tsx        # Top system menu bar
│   └── IPod.tsx           # Classic iPod replica with YouTube integration
├── services/
│   └── youtubePlaylistService.ts  # 17-song playlist data management
└── index.css              # Marathon cyberpunk color system
```

### Visual Effects System (3-Layer Architecture)
1. **Base**: Solid black background maintaining Marathon aesthetic
2. **Layer 1**: `ParticleField` - 35 cyan particles with Delaunay triangulation connections
3. **Layer 2**: `FluidEffect` - WebGL shader-based fluid dynamics with mouse interaction

---

## 🎨 Design System - Marathon Cyberpunk Aesthetic

### Color Palette (CSS Custom Properties)
```css
:root {
  --primary-accent: #00ffff;      /* Neon cyan */
  --secondary-accent: #ff0080;    /* Neon magenta */
  --success-accent: #00ff41;      /* Electric green */
  --void-black: #000000;          /* True black background */
  --void-white: #ffffff;          /* Pure white accents */
  --surface-glass: rgba(0, 0, 0, 0.8);  /* Dark glass surfaces */
  --glow-primary: rgba(0, 255, 255, 0.3);  /* Cyan glow effects */
}
```

### Visual Principles
- **Graphic Realism**: Marathon-inspired utilitarian sci-fi aesthetics
- **Hard Geometry**: Angular clip-paths and geometric shapes
- **Scan Line Textures**: CSS repeating-linear-gradient overlays throughout
- **Neon Glow Effects**: Drop-shadow filters instead of text-shadow
- **Typography**: Bold, all-caps utilitarian fonts with increased letter-spacing

---

## 🚀 Key Features & Functionality

### Window Management
- **Draggable Windows**: Full mouse + touch support with unified pointer events
- **Z-Index Tracking**: Smart focus management based on highest z-index
- **Window Types**: YouTube playlist, Classic iPod (260x380px), OSRS game site, placeholders
- **Touch Optimizations**: Larger touch targets, proper event handling, safe area support

### iPod Integration 
- **Authentic UI**: Pixel-perfect classic iPod recreation with click wheel navigation
- **YouTube Integration**: Fullscreen video playback (166x120px) with no YouTube UI
- **Physical Controls**: Play/pause button controls video via postMessage API
- **Navigation**: Main Menu → Music → Playlists → Songs (17-track playlist)

### Dock System (Marathon Command Interface)
- **5 Buttons**: playlist_play, library_music, sports_esports, palette, settings
- **Status Indicators**: Vertical scan line bars animate when apps are active
- **Geometric Design**: Hard clip-path shapes with neon cyan accents
- **Material Icons**: Google Fonts integration for crisp iconography

---

## ⚡ Advanced Technical Implementation

### Layered Visual Effects Performance
- **Canvas 2D Particles**: Hardware-accelerated with requestAnimationFrame batching
- **WebGL Fluid Dynamics**: Three.js integration with fragment shaders
- **Mouse Interaction**: Unified pointer events across multiple layers
- **Blend Modes**: Screen blending at 60% opacity for seamless composition
- **Dynamic Loading**: Three.js loaded dynamically with proper cleanup

### Mobile & Touch Support
- **Comprehensive Touch Events**: touchstart, touchmove, touchend, touchcancel
- **Safe Area Support**: env(safe-area-inset-bottom) for modern mobile browsers
- **Responsive Design**: Dock positioning adjusts for mobile browser UI
- **Performance**: GPU acceleration with translate3d and optimized animations

### State Management Architecture
```typescript
interface WindowData {
  id: string; title: string; content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean; zIndex: number;
}

// Main app state
const [windows, setWindows] = useState<WindowData[]>([]);
const [activeApp, setActiveApp] = useState('Finder');
const [highestZIndex, setHighestZIndex] = useState(1000);
```

---

## 🔧 Common Development Patterns

### Window Operations
```typescript
// Create new window with varied positioning (50-180px from top)
const openWindow = (windowConfig) => {
  const position = generateWindowPosition(windows.length);
  const newZIndex = highestZIndex + 1;
  // ... window creation logic
};

// Update any window property
const updateWindow = (id: string, updates: Partial<WindowData>) => {
  setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
};
```

### Touch Event Handling Pattern
```typescript
const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  // ... unified touch/mouse handling
}, [dependencies]);
```

---

## 🎵 Content Integration

### YouTube Playlist (17 Songs)
Real playlist data with video IDs for seamless playback:
- DISTANT - The Undying (5:08)
- dying in designer - LimeWire (2:21)
- Bloom - Withered (3:47)
- [... 14 more tracks]

### iPod Navigation Flow
Main Menu → Music → Playlists → "Maidenless Behavior" → Song Selection → Fullscreen Video

---

## 🚀 Deployment & Build

### Current Setup
- **Development**: `npm run dev` (Vite dev server with HMR)
- **Build**: `npm run build` (TypeScript + Vite optimization)
- **Deploy**: Vercel with automatic GitHub integration
- **Domain**: Custom domain with global CDN

### Performance Optimizations
- Code splitting and tree shaking via Vite
- requestAnimationFrame for all animations
- GPU acceleration for transforms and effects
- Efficient Canvas/WebGL render loops
- Dynamic script loading for Three.js

---

## 🔍 Development Context

### Recent Major Changes
1. **Phase 8**: Complete Marathon cyberpunk visual transformation
2. **Phase 9**: Added layered visual effects (particles + fluid dynamics)
3. **Mobile Support**: Comprehensive touch compatibility implementation
4. **Performance**: Optimized rendering pipeline for multiple visual layers

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript checking
npm run lint         # Code linting
```

### Git Workflow
- Feature branches for major changes
- Descriptive commits with Claude Code attribution
- Automatic Vercel deployment on push to main

---

## 💡 AI Assistant Notes

### When Working on This Project:
- **Always maintain** the Marathon cyberpunk aesthetic (neon cyan/magenta, hard geometry)
- **Test thoroughly** on both desktop and mobile (touch events are critical)
- **Performance first** - multiple visual layers require optimization
- **Preserve functionality** - visual changes should never break existing features
- **Use existing patterns** - follow established component architecture and state management

### Key Files to Check First:
- `src/App.tsx` - Main application state and window management
- `src/index.css` - Color system and global styles
- `src/components/Dock.tsx` - Command interface and app launching
- `src/components/Window.tsx` - Window behavior and touch handling

### Testing Checklist:
- Window dragging works on both mouse and touch
- Dock buttons show active states correctly
- iPod video playback and physical controls function
- Mobile dock visibility and safe area handling
- Visual effects performance on various devices

---

This project showcases the intersection of nostalgic design, modern web technology, advanced graphics programming, and creative UX design - all wrapped in an authentic Marathon-inspired cyberpunk aesthetic that's both functional and visually stunning.