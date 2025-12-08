// Full mode - uses textures and allows loaded objects
export default class FullMode {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Game state
        this.player = null;
        this.ground = [];
        this.obstacles = [];
        this.decorations = [];
        this.gameSpeed = 0.08;
        this.score = 0;
        this.isGameOver = false;
        this.verticalVelocity = 0;
        this.gravity = 0.008;
        this.thrust = 0.015;
        this.maxVelocity = 0.3;
        this.groundY = -2;
        this.ceilingY = 3;

        // Textures
        this.textures = {};
    }

    init() {
        // Set up scene background
        this.scene.background = new THREE.Color(0x87ceeb);

        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x87ceeb, 10, 50);

        // Position camera
        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0, 0, 0);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Load textures
        this.loadTextures();

        // Create player with texture
        this.createPlayer();

        // Create ground with texture
        this.createGround();

        // Create obstacles with textures
        this.createObstacles();

        // Create background decorations
        this.createDecorations();

        // Update score display
        this.updateScore(0);
    }

    loadTextures() {
        // Create procedural textures using canvas
        // Player texture (gradient)
        const playerCanvas = document.createElement('canvas');
        playerCanvas.width = 64;
        playerCanvas.height = 64;
        const playerCtx = playerCanvas.getContext('2d');
        const playerGradient = playerCtx.createLinearGradient(0, 0, 64, 64);
        playerGradient.addColorStop(0, '#00ffaa');
        playerGradient.addColorStop(1, '#00aa88');
        playerCtx.fillStyle = playerGradient;
        playerCtx.fillRect(0, 0, 64, 64);
        this.textures.player = new THREE.CanvasTexture(playerCanvas);

        // Ground texture (checkered pattern)
        const groundCanvas = document.createElement('canvas');
        groundCanvas.width = 128;
        groundCanvas.height = 128;
        const groundCtx = groundCanvas.getContext('2d');
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                groundCtx.fillStyle = (i + j) % 2 === 0 ? '#555577' : '#444466';
                groundCtx.fillRect(i * 16, j * 16, 16, 16);
            }
        }
        this.textures.ground = new THREE.CanvasTexture(groundCanvas);
        this.textures.ground.wrapS = THREE.RepeatWrapping;
        this.textures.ground.wrapT = THREE.RepeatWrapping;
        this.textures.ground.repeat.set(2, 2);

        // Obstacle texture (danger stripes)
        const obstacleCanvas = document.createElement('canvas');
        obstacleCanvas.width = 64;
        obstacleCanvas.height = 64;
        const obstacleCtx = obstacleCanvas.getContext('2d');
        for (let i = 0; i < 8; i++) {
            obstacleCtx.fillStyle = i % 2 === 0 ? '#ff4444' : '#ffcc00';
            obstacleCtx.fillRect(0, i * 8, 64, 8);
        }
        this.textures.obstacle = new THREE.CanvasTexture(obstacleCanvas);
    }

    createPlayer() {
        // Create a more complex player shape (composite geometry)
        const group = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            map: this.textures.player,
            emissive: 0x003322,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);

        // Add spikes for detail
        const spikeGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
        const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });

        const positions = [
            { x: 0.5, y: 0, z: 0 },
            { x: -0.5, y: 0, z: 0 },
            { x: 0, y: 0.5, z: 0 },
            { x: 0, y: -0.5, z: 0 }
        ];

        positions.forEach(pos => {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(pos.x, pos.y, pos.z);
            if (pos.x !== 0) spike.rotation.z = Math.PI / 2;
            group.add(spike);
        });

        this.player = group;
        this.player.position.set(-3, 0.5, 0);  // Start in middle of playable area
        this.scene.add(this.player);
    }

    createGround() {
        for (let i = 0; i < 20; i++) {
            const groundGeometry = new THREE.BoxGeometry(5, 0.5, 3);
            const groundMaterial = new THREE.MeshLambertMaterial({
                map: this.textures.ground
            });
            const groundPiece = new THREE.Mesh(groundGeometry, groundMaterial);
            groundPiece.position.set(i * 5 - 10, this.groundY, 0);
            groundPiece.receiveShadow = true;
            this.scene.add(groundPiece);
            this.ground.push(groundPiece);
        }
    }

    createObstacles() {
        for (let i = 0; i < 5; i++) {
            this.createObstacle(i * 15 + 8); // More spacing between obstacles
        }
    }

    createObstacle(xPosition) {
        // Create floating obstacles (like missiles) - similar to prototype mode
        const group = new THREE.Group();

        // Random height in the playable area (floating in the air)
        const yPosition = Math.random() * 3 - 1.5;

        // Main body (missile)
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 6);
        const baseMaterial = new THREE.MeshLambertMaterial({
            map: this.textures.obstacle
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.z = Math.PI / 2;
        group.add(base);

        // Fins
        const finGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.4);
        const finMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const fin1 = new THREE.Mesh(finGeometry, finMaterial);
        fin1.position.x = -0.3;
        fin1.position.y = 0.2;
        group.add(fin1);

        const fin2 = new THREE.Mesh(finGeometry, finMaterial);
        fin2.position.x = -0.3;
        fin2.position.y = -0.2;
        group.add(fin2);

        group.position.set(xPosition, yPosition, 0);
        group.userData.yPosition = yPosition;
        group.castShadow = true;
        this.scene.add(group);
        this.obstacles.push(group);
    }

    createDecorations() {
        // Add floating crystals in background
        for (let i = 0; i < 10; i++) {
            const crystalGeometry = new THREE.OctahedronGeometry(0.3);
            const crystalMaterial = new THREE.MeshLambertMaterial({
                color: 0x00ddff,
                emissive: 0x0088aa,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(
                Math.random() * 40 - 20,
                Math.random() * 3 + 1,
                Math.random() * -5 - 2
            );
            crystal.userData.rotationSpeed = Math.random() * 0.02 + 0.01;
            crystal.userData.bobSpeed = Math.random() * 0.02 + 0.01;
            crystal.userData.bobOffset = Math.random() * Math.PI * 2;
            this.scene.add(crystal);
            this.decorations.push(crystal);
        }
    }

    handleInput(keys, mobileJump) {
        if (this.isGameOver) return;

        // Apply thrust when space is held (like Jetpack Joyride)
        if (keys['Space'] || keys['ArrowUp'] || mobileJump) {
            this.verticalVelocity += this.thrust;
        }
    }

    update() {
        if (this.isGameOver) return;

        // Apply gravity constantly
        this.verticalVelocity -= this.gravity;

        // Clamp velocity
        this.verticalVelocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.verticalVelocity));

        // Update player position
        this.player.position.y += this.verticalVelocity;

        // Check boundaries (but don't game over, just bounce)
        if (this.player.position.y < this.groundY + 0.5) {
            this.player.position.y = this.groundY + 0.5;
            this.verticalVelocity = 0;
        }

        if (this.player.position.y > this.ceilingY - 0.5) {
            this.player.position.y = this.ceilingY - 0.5;
            this.verticalVelocity = 0;
        }

        // Tilt plane based on velocity
        this.player.rotation.z = -this.verticalVelocity * 1.5;

        // Move and recycle ground
        this.ground.forEach(piece => {
            piece.position.x -= this.gameSpeed;
            if (piece.position.x < -15) {
                piece.position.x += 100;
            }
        });

        // Move and recycle obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.position.x -= this.gameSpeed;

            // Recycle obstacle
            if (obstacle.position.x < -10) {
                obstacle.position.x = 25;
                const newY = Math.random() * 3 - 1.5;
                obstacle.position.y = newY;
                obstacle.userData.yPosition = newY;
            }

            // Collision detection
            const distance = Math.abs(this.player.position.x - obstacle.position.x);
            const heightDiff = Math.abs(this.player.position.y - obstacle.position.y);

            if (distance < 0.8 && heightDiff < 0.5) {
                this.gameOver();
            }
        });

        // Animate obstacles (rotation)
        this.obstacles.forEach((obstacle, index) => {
            obstacle.rotation.z += 0.03 * (index % 2 === 0 ? 1 : -1);
        });

        // Animate decorations
        this.decorations.forEach((decoration) => {
            decoration.rotation.x += decoration.userData.rotationSpeed;
            decoration.rotation.y += decoration.userData.rotationSpeed * 0.7;

            // Bob up and down
            const bobAmount = Math.sin(Date.now() * 0.001 * decoration.userData.bobSpeed + decoration.userData.bobOffset) * 0.2;
            decoration.position.y += bobAmount * 0.01;

            // Recycle decorations
            decoration.position.x -= this.gameSpeed * 0.5;
            if (decoration.position.x < -20) {
                decoration.position.x = 20;
            }
        });

        // Increase score
        this.score += 0.1;
        this.updateScore(Math.floor(this.score));

        // Gradually increase difficulty
        this.gameSpeed = 0.08 + (this.score * 0.00003);
    }

    updateScore(score) {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }

    gameOver() {
        this.isGameOver = true;
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'block';
            const finalScore = gameOverDiv.querySelector('p');
            if (finalScore) {
                finalScore.textContent = `Final Score: ${Math.floor(this.score)}`;
            }
        }
    }

    restart() {
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.obstacles = [];

        this.ground.forEach(piece => this.scene.remove(piece));
        this.ground = [];

        this.decorations.forEach(decoration => this.scene.remove(decoration));
        this.decorations = [];

        this.scene.remove(this.player);

        this.score = 0;
        this.gameSpeed = 0.08;
        this.isGameOver = false;
        this.verticalVelocity = 0;

        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'none';
        }

        this.init();
    }

    cleanup() {
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.ground.forEach(piece => this.scene.remove(piece));
        this.decorations.forEach(decoration => this.scene.remove(decoration));
        if (this.player) this.scene.remove(this.player);

        this.obstacles = [];
        this.ground = [];
        this.decorations = [];
    }
}