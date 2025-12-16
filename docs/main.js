import * as THREE from 'three';
import PrototypeMode from './modes/prototype.js';
import FullMode from './modes/full.js';
import InputHandler from './utils/inputHandler.js';

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentMode = null;
        this.inputHandler = null;
        this.isRunning = false;
    }

    init(modeType) {
        // Setup Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.innerHTML = '';
        gameCanvas.appendChild(this.renderer.domElement);

        // Setup input handler
        this.inputHandler = new InputHandler();

        // Initialize selected mode
        if (modeType === 'prototype') {
            this.currentMode = new PrototypeMode(this.scene, this.camera, this.renderer);
        } else {
            this.currentMode = new FullMode(this.scene, this.camera, this.renderer);
        }

        this.currentMode.init();

        // Setup window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Show game container
        document.getElementById('menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('game-over').style.display = 'none';

        // Start game loop
        this.isRunning = true;
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.animate());

        // Update game mode
        if (this.currentMode) {
            this.currentMode.handleInput(
                this.inputHandler.keys,
                this.inputHandler.mobileJump
            );
            this.inputHandler.mobileJump = false; // Reset mobile jump

            this.currentMode.update();
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    restart() {
        if (this.currentMode) {
            this.currentMode.restart();
        }
    }

    returnToMenu() {
        this.isRunning = false;

        if (this.currentMode) {
            this.currentMode.cleanup();
        }

        document.getElementById('game-container').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
    }
}

// Initialize game
const game = new Game();

// Menu buttons
document.getElementById('prototype-btn').addEventListener('click', () => {
    game.init('prototype');
});

document.getElementById('full-btn').addEventListener('click', () => {
    game.init('full');
});

// Game over buttons
document.getElementById('restart-btn').addEventListener('click', () => {
    game.restart();
});

document.getElementById('menu-btn').addEventListener('click', () => {
    game.returnToMenu();
});
