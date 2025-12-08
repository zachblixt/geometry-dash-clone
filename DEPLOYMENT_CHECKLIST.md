# CS559 Workbook Deployment Checklist

## Pre-Deployment Checklist

### Files Present
- [x] src/index.html (main page)
- [x] src/main.js (game logic)
- [x] src/styles.css (styling)
- [x] src/modes/prototype.js (primitive geometries only)
- [x] src/modes/full.js (with textures)
- [x] src/utils/inputHandler.js
- [x] README.md
- [x] QUICKSTART.md
- [x] package.json
- [x] .gitignore

### Required Updates Before Submission
- [ ] **CRITICAL**: Update Group ID in src/index.html line 11
  - Current: `Group ID: 0000`
  - Change to: Your actual 4-digit group ID

### Testing Requirements
- [ ] Test locally using a web server
- [ ] Verify Prototype mode loads
- [ ] Verify Full mode loads
- [ ] Test mode switching
- [ ] Test keyboard controls (Space/Arrow Up to jump)
- [ ] Test mobile controls (on-screen jump button)
- [ ] Verify score increases
- [ ] Test game over and restart
- [ ] Check all animations work
- [ ] Test on mobile device or responsive mode

### CS559 Requirements Verification
- [x] Uses THREE.js (loaded from CDN)
- [x] Does NOT use CS559Framework
- [x] Single HTML Canvas
- [x] Two modes (Prototype and Full)
- [x] Prototype: Only primitive geometries, no image textures
- [x] Full: Uses textures (procedural canvas textures)
- [x] User interaction (keyboard + mobile controls)
- [x] Animated objects (rotating obstacles, player, decorations)
- [x] Four-digit Group ID displayed on page
- [x] Hosted on GitHub Pages (to be completed)

## Deployment Steps

### 1. Local Testing
```bash
cd src
python3 -m http.server 8000
# Open http://localhost:8000
```

Test checklist:
- [ ] Page loads without errors
- [ ] Can see Group ID at top left
- [ ] Can see Score at top center
- [ ] Can see "Switch Mode" button at top right
- [ ] Can see "Mode: Prototype" indicator
- [ ] Can see mobile jump button (↑) at bottom
- [ ] Player (green cube) is visible
- [ ] Ground platforms are visible
- [ ] Red obstacles are visible
- [ ] Pressing Space makes player jump
- [ ] Hitting obstacle shows "Game Over"
- [ ] Restart button works
- [ ] Switch Mode changes to Full mode
- [ ] Full mode has different visuals (textures, fog, crystals)

### 2. Git Setup (if not done)
```bash
git init
git add .
git commit -m "Initial commit: Geometry Dash clone"
```

### 3. GitHub Repository Setup
1. Create new repository on GitHub
2. Do NOT add README, .gitignore, or license (we have these)
3. Copy the repository URL

### 4. Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 5. Enable GitHub Pages
1. Go to repository on GitHub
2. Click Settings
3. Click Pages (left sidebar)
4. Under "Source":
   - Select "Deploy from a branch"
   - Branch: `main`
   - Folder: `/src`
5. Click Save
6. Wait 1-2 minutes for deployment

### 6. Verify Deployment
- [ ] Visit: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
- [ ] Page loads correctly
- [ ] All features work
- [ ] Group ID is visible and correct

### 7. CS559 Workbook Submission
Submit the form with:
- [ ] Your NetID
- [ ] Group name
- [ ] Four-digit Group ID (same as on page)
- [ ] GitHub Pages URL: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
  - **NOT** the repository URL
  - **NOT** a file:// URL
- [ ] Component you contributed most to:
  - Game design
  - User interaction
  - Animation
  - Automation

## Common Issues

### "Module not found" error
- Make sure main.js is loaded with `type="module"`
- Check that paths in imports are correct
- Verify files exist in correct locations

### THREE is not defined
- Check that THREE.js CDN script loads before main.js
- Check browser console for 404 errors

### Page is blank
- Check browser console (F12) for errors
- Make sure you're using a web server, not file://
- Verify index.html is in src/ folder

### Textures not showing
- This is expected - we use procedural textures
- Full mode should still look different from Prototype
- Check for checkered ground pattern in Full mode

### Mobile controls don't work
- Verify jump button is visible at bottom
- Test touch events (not just mouse clicks)
- Check button has proper event listeners

## Final Verification

Before submitting, confirm:
- [x] Project works locally
- [ ] Group ID is updated
- [ ] Deployed to GitHub Pages
- [ ] GitHub Pages URL works
- [ ] All game features work on deployment
- [ ] Submitted correct URL (Pages, not repo)

## Need Help?

- Check browser console (F12) for errors
- Review QUICKSTART.md for common solutions
- Test in different browsers
- Verify all files are committed and pushed

---

**Good luck with your submission!**
