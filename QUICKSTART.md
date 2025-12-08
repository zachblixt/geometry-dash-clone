# Quick Start Guide - Geometry Dash Clone

## Before You Submit

### 1. Update Your Group ID
Edit `index.html` line 11 and replace `0000` with your actual 4-digit group ID:
```html
<div id="group-id">Group ID: 1234</div>
```

### 2. Test Locally

**Option A: Using Python (Easiest)**
```bash
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

**Option B: Using PHP**
```bash
php -S localhost:8000
# Open http://localhost:8000 in your browser
```

**Option C: Using Node.js (if npm is installed)**
```bash
cd ..  # Go back to project root
npm install
npm start
```

### 3. Test Both Modes
1. Click "Switch Mode" button
2. Verify Prototype mode (simple colors, no textures)
3. Verify Full mode (textures, decorations, fog)
4. Test jumping (Space or ↑ key)
5. Test mobile controls (resize browser or use mobile device)

### 4. Deploy to GitHub Pages

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add Geometry Dash clone project"

# Create repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then:
1. Go to GitHub repository → Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main` → folder: `/ (root)`
4. Click Save
5. Wait 1-2 minutes
6. Your game will be at: `https://YOUR-USERNAME.github.io/YOUR-REPO/`

**IMPORTANT**: Since all files are in the root now (not in /src), use `/ (root)` as the folder!

### 5. Submit to CS559

Go to the Workbook Form and submit:
- Your NetID
- Group name and 4-digit ID
- **GitHub Pages URL** (NOT the repository URL!)
- Component you contributed to most:
  - Game design
  - User interaction
  - Animation
  - Automation

## Troubleshooting

### Game doesn't load
- Check browser console (F12) for errors
- Make sure you're using a local server (not file://)
- Verify THREE.js CDN is loading

### Textures not showing in Full mode
- This is normal - we're using procedural textures
- Check that ground has checkered pattern
- Player should have gradient color

### Can't jump
- Press Space or Arrow Up
- On mobile, tap the ↑ button at bottom
- Check that jump button exists in HTML

### Mode switching doesn't work
- Check browser console for errors
- Verify both mode files exist
- Make sure main.js is loaded as module

## Component Breakdown

**Game Design**:
- Endless runner concept
- Obstacle patterns
- Difficulty progression
- Visual design of both modes

**User Interaction**:
- Keyboard controls implementation
- Mobile touch controls
- Mode switching
- Restart functionality

**Animation**:
- Player rotation
- Obstacle rotation (different speeds)
- Floating crystals (Full mode)
- Jump physics

**Automation**:
- Scrolling environment
- Obstacle recycling
- Progressive difficulty
- Score tracking

Choose the component you worked on most!

## File Checklist

- [x] index.html - Main page with all UI
- [x] main.js - Game initialization
- [x] styles.css - All styling
- [x] modes/prototype.js - Primitive geometries only
- [x] modes/full.js - With textures
- [x] utils/inputHandler.js - Input utilities
- [x] assets/ - Directory for assets
- [x] README.md - Full documentation

## Good Luck!

Your project is complete and ready to submit. Just remember to:
1. Update Group ID
2. Test locally
3. Deploy to GitHub Pages
4. Submit the correct URL (Pages, not repo)
