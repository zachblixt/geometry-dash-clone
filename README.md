# Geometry Dash Clone – CS559 Workbook Project

A **3D Geometry Dash–style endless runner** built with **THREE.js** for the CS559 Computer Graphics course. The game recreates core Geometry Dash mechanics such as automatic forward movement, gravity-based jumping, mode transitions, and obstacle avoidance, all rendered in a fully 3D environment.

**Group ID: 1973** (Update this in [index.html](src/index.html) line 11)

---

## Features

### Geometry Dash–Style Gameplay
- Automatic forward movement at increasing speed
- Gravity-based jumping mechanics
- Precise timing and obstacle avoidance
- Continuous scoring based on survival time
- Instant game over on collision with obstacles

### Multiple Gameplay Modes
- **Cube Mode**: The player jumps over spikes and gaps using gravity-based physics, rotating while airborne and snapping to right-angle rotations on landing
- **Plane Mode**: Thrust-based flying mechanics where the player controls vertical movement to avoid floating obstacles

### Visual Modes
- **Prototype Mode**
  - Uses only primitive geometries (boxes, cylinders, cones)
  - Solid colors only — no image textures
- **Full Mode**
  - Procedural canvas textures
  - Enhanced lighting, fog, and visual effects
  - Animated background decorations

---

## Game Mechanics

- Continuous forward scrolling level
- Procedurally generated and recycled obstacles
- Mode-switching portals that change player physics
- Collision detection with obstacles, ground, and ceiling
- Increasing difficulty over time
- Restart functionality after game over

---

## Controls

### Desktop
- **Space / ↑** — Jump (Cube Mode) or apply thrust (Plane Mode)

### Mobile
- **Hold Rocket Button** — Jump / Thrust

---

## Animations & Visual Effects

- Player rotation and tilt based on velocity
- Rotating and animated obstacles
- Scrolling background elements
- Fog and emissive materials for depth
- Procedural textures generated with HTML canvas

---

## Project Structure

```
geometry-dash-clone/
├── src/
│   ├── index.html          # Main HTML page and UI
│   ├── styles.css          # Styling and layout
│   ├── main.js             # Game loop and mode switching
│   ├── modes/
│   │   ├── prototype.js    # Prototype visuals (no textures)
│   │   └── full.js         # Full visuals (procedural textures)
│   ├── assets/
│   │   ├── textures/       # Procedural texture helpers
│   │   └── models/         # Optional 3D models
│   └── utils/
│       └── inputHandler.js # Input handling
├── package.json            # Dependencies
└── README.md               # This file
```

---

## CS559 Workbook Requirements Checklist

- ✅ **Prototype Mode**: Primitive geometries only
- ✅ **Full Mode**: Procedural textures
- ✅ **THREE.js**: Used for all rendering
- ✅ **No CS559Framework**
- ✅ **User Interaction**: Keyboard and touch input
- ✅ **Animated Objects**
- ✅ **Group ID Display**
- ✅ **Single Canvas Rendering**
- ✅ **Mode Switching**

---

## Installation & Setup

##
