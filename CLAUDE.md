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
│   ├── TrackingOverlay.tsx # BR2049 inspired real-time tracking interface
│   ├── Window.tsx          # Draggable/resizable windows with touch support
│   ├── Dock.tsx           # Marathon-style command interface (5 buttons)
│   ├── MenuBar.tsx        # Top system menu bar
│   └── IPod.tsx           # Classic iPod replica with YouTube integration
├── services/
│   └── youtubePlaylistService.ts  # 17-song playlist data management
└── index.css              # Marathon cyberpunk color system
```

### Visual Effects System (4-Layer Architecture)
1. **Base**: Solid black background with film grain and organic distortion effects
2. **Layer 1**: `ParticleField` - 35 cyan particles with Delaunay triangulation connections
3. **Layer 2**: `FluidEffect` - WebGL shader-based fluid dynamics with mouse interaction
4. **Layer 3**: `TrackingOverlay` - BR2049 inspired real-time scanning and data tracking interface

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
- **Geometric Design**: Hard clip-path shapes (15% skew) with alternating --nebula-rose/--nebula-teal colors
- **Enhanced Visuals**: Animated nebula gradient background with horizontal scan lines overlay
- **Material Icons**: White icons with individual colored glow effects in inactive state
- **Interactive States**: Transparent black hover background (40% opacity) with enhanced glow effects
- **BR2049 Monitoring**: Real-time system pulse indicator with breathing animation

### Real-Time Tracking System (Blade Runner 2049 Inspired)
- **Periodic Scanning**: Automated scans every 15-25 seconds with organic distortion effects
- **Dynamic Data Points**: Contact, anomaly, and system detection markers with fade-out lifecycle
- **System Metrics**: Live CONN/SIG/TRK readouts in utilitarian Territory Studio styling
- **Tracking Reticle**: Subtle geometric overlay with continuous rotation and flicker effects
- **Data Streams**: Window-integrated vertical/horizontal flow animations for active processing
- **Screen Degradation**: Organic texture overlays, burn effects, and experimental visual distortion
- **Utilitarian Design**: Minimal color palette emphasizing grayscale with cyan accents

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
5. **Phase 10**: Enhanced dock and window visual effects (January 2025)
   - Added film grain background effect to desktop
   - Enhanced dock with animated nebula gradient background and horizontal scan lines
   - Improved dock button styling with increased skew (15% clip-path)
   - White icons/text with individual colored glow effects in inactive state
   - Added animated nebula gradient to window control button hover states
   - Alternating color scheme: dock buttons now use --nebula-rose and --nebula-teal pattern
6. **Phase 11**: Blade Runner 2049 inspired real-time tracking interface (January 2025)
   - Real-time scanning overlay with periodic data point detection and organic distortion effects
   - System status readouts showing live connection, signal, and tracking metrics
   - Data visualization streams within windows (vertical/horizontal flow animations)
   - Screen burn and degradation effects with organic texture overlays
   - Real-time monitoring indicator on dock with breathing pulse animation
   - Territory Studio inspired experimental approach using organic textures and utilitarian design
7. **Phase 12**: Enhanced network topology with solar system architecture (January 2025)
   - Full desktop network topology with client-server architecture distributed across entire screen
   - 14-node network: 2 servers, 3 gateways, 5 clients, 2 satellites, 2 relays
   - Real-time data flow visualization with thin connecting lines and subtle animations
   - Node-specific styling: servers (12px cyan glow), gateways (10px grey), clients (6px grey), satellites (8px with orbit animation), relays (7px grey)
   - Live data readouts: data rates (KB/s) and response times (ms) with tabular numeric fonts
   - Status-based connection animations: active (cyan), transmitting (pulsing), idle (dim grey)
   - Reduced opacity (0.4) and subtle visual effects to maintain clean, non-distracting BR2049 aesthetic
   - Strategic positioning: corners for clients, edges for satellites, center distributed for servers/gateways
8. **Phase 13**: BR2049 geometric dock icons implementation (January 2025)
   - Replaced Material Icons with custom BR2049-inspired geometric shapes using pure CSS
   - 5 unique icon designs: playlist (bars+triangle), music (hexagonal waves), game (target reticle), create (crystal diamond), system (hexagonal grid)
   - 300+ lines of CSS with complex clip-path geometry and subtle animations
   - Icons maintain cyberpunk aesthetic with angular shapes, cyan/magenta glow effects, and Territory Studio design language
   - Seamless integration with existing dock hover states and active window indicators
   - All icons created using CSS-only approach with clip-path, transforms, and keyframe animations
9. **Phase 14**: Comprehensive monitoring system implementation (January 2025)
   - Added three-panel monitoring interface with distinct visual styles and data types
   - **System Monitor** (left): Process monitoring, CPU/RAM/Disk metrics, 15 active processes with real-time data (224px width)
   - **Network Status** (top-right): Enhanced connection monitoring with 6 metrics + encryption bar, circular header design (100px width)  
   - **Environmental Monitor** (bottom-right): Temperature, humidity, pressure, air quality, wind compass with hexagonal design (176px width)
   - All monitors: 60% opacity, greyscale color scheme, transparent backgrounds with film grain overlay integration
   - Real-time data simulation with proper error handling and NaN prevention using null coalescing operators
   - Mobile responsive design with scaled font sizes and adjusted layouts

### Development Server Management
**IMPORTANT**: Always stop existing dev servers before starting new ones to avoid port conflicts and resource issues.

#### Proper Development Workflow:
```bash
# 1. Check for running dev servers (Windows)
netstat -ano | findstr :5173
netstat -ano | findstr :5174
netstat -ano | findstr :5175

# 2. Kill existing servers if found (use PID from netstat)
taskkill /PID <PID_NUMBER> /F

# 3. Start fresh dev server
npm run dev

# 4. For testing builds before deployment
npm run build        # Test production build
npm run preview       # Preview production build locally
```

#### Common Commands
```bash
npm run dev          # Start development server (stop others first!)
npm run build        # Production build for deployment testing
npm run preview      # Preview production build locally
npm run typecheck    # TypeScript checking
npm run lint         # Code linting (if available)
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

### Development Server Best Practices:
- **CRITICAL**: Always check for and stop existing dev servers before starting new ones
- **Use netstat commands** to find running servers on ports 5173-5179
- **Kill processes properly** using `taskkill /PID <PID> /F` to avoid resource conflicts
- **Test builds locally** with `npm run build` before pushing to avoid deployment failures
- **Use npm run preview** to test production builds locally

### Key Files to Check First:
- `src/App.tsx` - Main application state and window management
- `src/index.css` - Color system and global styles
- `src/components/Dock.tsx` - Command interface and app launching
- `src/components/Window.tsx` - Window behavior and touch handling

### Testing Checklist:
- Window dragging works on both mouse and touch
- Dock buttons show active states correctly
- iPod video playbook and physical controls function
- Mobile dock visibility and safe area handling
- Visual effects performance on various devices

### Troubleshooting Common Issues:

#### Vercel Deployment Not Updating:
1. **Check TypeScript errors**: Run `npm run build` locally first
2. **Verify git push**: Ensure changes are actually pushed to GitHub
3. **Check Vercel logs**: Look for build failures in Vercel dashboard
4. **Branch mismatch**: Ensure Vercel is deploying from correct branch (main)

#### Multiple Dev Servers Running:
```bash
# Find running servers
netstat -ano | findstr :517

# Kill specific process
taskkill /PID <PID_NUMBER> /F

# Kill all Node processes (nuclear option)
taskkill /F /IM node.exe
```

#### Console Warnings (runtime.lastError):
- Usually caused by browser extensions, not our code
- Enhanced cleanup in visual effects components should minimize these
- Can be ignored if functionality works correctly

#### Build Failures:
- Always test `npm run build` locally before pushing
- Check for TypeScript strict mode errors
- Ensure all imports and dependencies are correct

---

This project showcases the intersection of nostalgic design, modern web technology, advanced graphics programming, and creative UX design - all wrapped in an authentic Marathon-inspired cyberpunk aesthetic that's both functional and visually stunning.