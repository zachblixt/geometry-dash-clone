import PrototypeMode from './modes/prototype.js';
import FullMode from './modes/full.js';

// Game setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('gameCanvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

let currentMode = 'prototype';
let gameMode = null;
let keys = {};
let mobileJump = false;

// Initialize input handlers
function initInputHandlers() {
    // Keyboard input
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        // Prevent default for space and arrow keys
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Mobile jump button
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) {
        jumpButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileJump = true;
        });

        jumpButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileJump = false;
        });

        jumpButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            mobileJump = true;
        });

        jumpButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            mobileJump = false;
        });
    }

    // Mode toggle button
    const toggleButton = document.getElementById('toggleMode');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const newMode = currentMode === 'prototype' ? 'full' : 'prototype';
            switchMode(newMode);
        });
    }

    // Restart button
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (gameMode) {
                gameMode.restart();
            }
        });
    }
}

// Switch between game modes
function switchMode(mode) {
    // Cleanup current mode
    if (gameMode) {
        gameMode.cleanup();
    }

    // Clear the scene (remove all children except lights that will be re-added)
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Reset camera
    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);

    // Create new game mode
    currentMode = mode;

    if (mode === 'prototype') {
        gameMode = new PrototypeMode(scene, camera, renderer);
    } else if (mode === 'full') {
        gameMode = new FullMode(scene, camera, renderer);
    }

    gameMode.init();

    // Update mode indicator
    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator) {
        modeIndicator.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    }

    // Reset mobile jump
    mobileJump = false;
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (gameMode) {
        // Pass input to game mode
        gameMode.handleInput(keys, mobileJump);

        // Update game state
        gameMode.update();

        // Reset mobile jump after frame (only trigger once per press)
        if (mobileJump) {
            mobileJump = false;
        }
    }

    renderer.render(scene, camera);
}

// Initialize everything when page loads
window.addEventListener('DOMContentLoaded', () => {
    initInputHandlers();
    switchMode(currentMode);
    animate();
});