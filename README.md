# Sky Runner - CS559 Workbook Project

A 3D flying plane game with jetpack-style thrust mechanics, built with THREE.js for the CS559 Computer Graphics course.

**Group ID: 0000** (Update this in [index.html](src/index.html) line 11)

## Features

### Two Game Modes
- **Prototype Mode**: Uses only primitive geometries (boxes, cylinders, cones) with solid colors - no textures or loaded models
- **Full Mode**: Enhanced version with procedural textures, complex geometries, animated decorations, and visual effects

### Game Mechanics
- Jetpack Joyride-style thrust controls (hold space to fly up, release to fall)
- Flying plane with realistic tilt physics
- Infinite scrolling sky environment with clouds
- Floating missile obstacles
- Progressive difficulty (speed increases over time)
- Score tracking system
- Collision detection with ground, ceiling, and obstacles
- Game over and restart functionality

### User Interaction
- **Keyboard Controls**: Hold Space or Arrow Up to thrust upward
- **Mobile Controls**: Hold the rocket button to thrust
- **Physics**: Constant gravity pulls plane down, thrust pushes it up
- **Mode Switching**: Button to toggle between Prototype and Full modes

### Animations
- Dynamic plane tilting based on vertical velocity
- Missile obstacle rotation
- Scrolling clouds in background
- Smooth thrust and gravity physics
- Background decorations (floating crystals in Full mode)

## Project Structure

```
geometry-dash-clone/
├── src/
│   ├── index.html          # Main HTML page with UI elements
│   ├── styles.css          # All game styling and responsive design
│   ├── main.js             # Game initialization and mode switching
│   ├── modes/
│   │   ├── prototype.js    # Prototype mode (primitives only)
│   │   └── full.js         # Full mode (with textures)
│   ├── assets/
│   │   ├── textures/       # Texture files (if using image textures)
│   │   └── models/         # 3D model files (if loading models)
│   └── utils/
│       └── inputHandler.js # Input handling utilities
├── package.json            # Project dependencies
└── README.md              # This file
```

## CS559 Workbook Requirements Checklist

- ✅ **Prototype Mode**: Only primitive geometries, no image textures
- ✅ **Full Mode**: Uses textures (procedural canvas textures)
- ✅ **THREE.js Library**: Used for all 3D rendering
- ✅ **No CS559Framework**: Pure THREE.js implementation
- ✅ **User Interaction**: Keyboard and touch controls for jumping
- ✅ **Animated Objects**: Rotating obstacles and decorations
- ✅ **Group ID Display**: Shown at top of page
- ✅ **Single HTML Canvas**: All rendering in one canvas
- ✅ **Mode Switching**: Button to toggle between modes

## Installation & Setup

### Option 1: Quick Start (No Build Tools)

Simply open [src/index.html](src/index.html) directly in a web browser:

```bash
# Using Python's built-in server
cd src
python3 -m http.server 8000

# Or using PHP
cd src
php -S localhost:8000

# Then open http://localhost:8000 in your browser
```

### Option 2: Using npm (Recommended for Development)

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Open your browser to the URL shown (typically `http://localhost:8080`)

## How to Play

1. **Start the Game**: The game begins automatically in Prototype mode with your plane flying
2. **Control the Plane**:
   - **Hold** `Space` or `↑` to thrust upward (desktop)
   - **Hold** the 🚀 button to thrust (mobile)
   - **Release** to let gravity pull you down
3. **Avoid Obstacles**: Navigate between floating missiles and stay away from ground/ceiling
4. **Master the Physics**: Balance thrust and gravity like Jetpack Joyride
5. **Score Points**: Your score increases continuously as you survive
6. **Switch Modes**: Click "Switch Mode" to toggle between Prototype and Full
7. **Restart**: Click "Restart" after game over

## Deploying to GitHub Pages

1. **Create a GitHub repository** for your project

2. **Push your code**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` → `/src` folder
   - Click Save

4. **Update the Group ID**:
   - Edit [src/index.html](src/index.html) line 11
   - Replace `0000` with your actual 4-digit group ID

5. **Access your game**:
   - URL will be: `https://YOUR-USERNAME.github.io/YOUR-REPO/`

## Technical Details

### Prototype Mode
- Red plane made from primitive shapes (boxes, cones)
- Missile obstacles (cylinders + boxes)
- White fluffy clouds (spheres)
- Green ground plane below
- Sky blue background
- Solid colors only (no textures)

### Full Mode
- Textured plane with gradient colors
- Enhanced missile obstacles with danger stripes
- Textured ground (procedural checkered pattern)
- Floating crystal decorations in background (animated)
- Fog effect for atmospheric depth
- Enhanced lighting and shadows

### Physics
- Constant gravity pulling plane downward
- Thrust force when holding spacebar
- Velocity clamping for realistic flight
- Dynamic plane rotation based on velocity
- Ground and ceiling collision detection
- Floating obstacle collision detection

### Performance Optimizations
- Object recycling (platforms and obstacles loop)
- Efficient collision detection
- RequestAnimationFrame for smooth 60fps
- Responsive canvas sizing

## Development Notes

### Adding Custom Textures
1. Place texture images in `src/assets/textures/`
2. Load them in [full.js](src/modes/full.js) using `THREE.TextureLoader()`
3. Apply to materials

### Adding 3D Models
1. Place models (`.obj`, `.gltf`, `.glb`) in `src/assets/models/`
2. Import appropriate loader (e.g., `GLTFLoader`)
3. Load and add to scene in [full.js](src/modes/full.js)

### Customizing Game Difficulty
Edit these values in mode files:
- `gameSpeed`: Initial movement speed (default: 0.1)
- `gravity`: Jump gravity strength (default: 0.015)
- `jumpVelocity`: Initial jump power (default: 0.25)

## Workbook Submission

**Important**: Before submitting, make sure to:
1. ✅ Update the Group ID in [index.html](src/index.html)
2. ✅ Deploy to GitHub Pages or CS Department webpage
3. ✅ Test both Prototype and Full modes
4. ✅ Test on mobile device
5. ✅ Verify all animations work
6. ✅ Submit the Workbook Form with:
   - Your NetID
   - Group name and 4-digit ID
   - Link to GitHub Pages (NOT repository)
   - Component you contributed most to

## Credits

- **THREE.js**: 3D graphics library (r128)
- **Jetpack Joyride**: Gameplay mechanics inspiration
- **CS559**: Computer Graphics course at UW-Madison

## License

MIT License - Feel free to use for educational purposes.