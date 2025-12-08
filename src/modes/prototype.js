// Prototype mode - uses only primitive geometries, no textures or loaded models
export default class PrototypeMode {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Game state
        this.player = null;
        this.ground = [];
        this.obstacles = [];
        this.gameSpeed = 0.08;
        this.score = 0;
        this.isGameOver = false;
        this.verticalVelocity = 0;
        this.gravity = 0.008; // Constant downward pull
        this.thrust = 0.015; // Upward thrust when pressing space
        this.maxVelocity = 0.3; // Max vertical speed
        this.groundY = -2;
        this.ceilingY = 3; // Upper boundary
    }

    init() {
        // Set up sky background
        this.scene.background = new THREE.Color(0x87CEEB);

        // Position camera
        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0, 0, 0);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Create plane
        this.createPlane();

        // Create ground
        this.createGround();

        // Create ceiling
        this.createCeiling();

        // Create initial obstacles
        this.createObstacles();

        // Create clouds
        this.createClouds();

        // Update score display
        this.updateScore(0);
    }

    createPlane() {
        // Create a simple plane using primitives
        const planeGroup = new THREE.Group();

        // Fuselage (main body)
        const bodyGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        planeGroup.add(body);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(0.3, 0.05, 1.5);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        wing.position.x = -0.2;
        planeGroup.add(wing);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -0.6;
        tail.position.y = 0.1;
        planeGroup.add(tail);

        // Nose cone
        const noseGeometry = new THREE.ConeGeometry(0.2, 0.4, 4);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.rotation.z = -Math.PI / 2;
        nose.position.x = 0.8;
        planeGroup.add(nose);

        this.player = planeGroup;
        this.player.position.set(-3, 0.5, 0);  // Start in middle of playable area
        this.scene.add(this.player);
    }

    createClouds() {
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            const cloudGroup = new THREE.Group();

            // Create fluffy cloud with spheres
            for (let j = 0; j < 3; j++) {
                const cloudGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 8);
                const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloudPart.position.x = (j - 1) * 0.4;
                cloudPart.position.y = Math.random() * 0.2 - 0.1;
                cloudGroup.add(cloudPart);
            }

            cloudGroup.position.set(
                Math.random() * 30 - 5,
                Math.random() * 4 - 2,
                -1
            );
            this.scene.add(cloudGroup);
            this.clouds.push(cloudGroup);
        }
    }

    createCeiling() {
        this.ceiling = [];
        for (let i = 0; i < 20; i++) {
            const ceilingGeometry = new THREE.PlaneGeometry(5, 0.2);
            const ceilingMaterial = new THREE.MeshLambertMaterial({
                color: 0x4444ff,
                transparent: true,
                opacity: 0.3
            });
            const ceilingPiece = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
            ceilingPiece.position.set(i * 5 - 10, this.ceilingY, 0);
            this.scene.add(ceilingPiece);
            this.ceiling.push(ceilingPiece);
        }
    }

    createGround() {
        for (let i = 0; i < 20; i++) {
            const groundGeometry = new THREE.PlaneGeometry(5, 3);
            const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const groundPiece = new THREE.Mesh(groundGeometry, groundMaterial);
            groundPiece.position.set(i * 5 - 10, this.groundY, -0.5);
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
        // Create floating obstacles (like missiles or birds)
        const obstacleGroup = new THREE.Group();

        // Random height in the playable area
        const yPosition = Math.random() * 3 - 1.5;

        // Main body (missile/bird)
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        obstacleGroup.add(body);

        // Fins
        const finGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.4);
        const finMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const fin1 = new THREE.Mesh(finGeometry, finMaterial);
        fin1.position.x = -0.3;
        fin1.position.y = 0.2;
        obstacleGroup.add(fin1);

        const fin2 = new THREE.Mesh(finGeometry, finMaterial);
        fin2.position.x = -0.3;
        fin2.position.y = -0.2;
        obstacleGroup.add(fin2);

        obstacleGroup.position.set(xPosition, yPosition, 0);
        obstacleGroup.userData.yPosition = yPosition;
        this.scene.add(obstacleGroup);
        this.obstacles.push(obstacleGroup);
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

        if (this.player.position.y > this.ceilingY - 0.3) {
            this.player.position.y = this.ceilingY - 0.3;
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

        // Move and recycle ceiling
        if (this.ceiling) {
            this.ceiling.forEach(piece => {
                piece.position.x -= this.gameSpeed;
                if (piece.position.x < -15) {
                    piece.position.x += 100;
                }
            });
        }

        // Move and recycle clouds
        if (this.clouds) {
            this.clouds.forEach(cloud => {
                cloud.position.x -= this.gameSpeed * 0.3;
                if (cloud.position.x < -10) {
                    cloud.position.x = 20;
                    cloud.position.y = Math.random() * 4 - 2;
                }
            });
        }

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
        // Clear obstacles
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.obstacles = [];

        // Clear ground
        this.ground.forEach(piece => this.scene.remove(piece));
        this.ground = [];

        // Remove player
        this.scene.remove(this.player);

        // Reset game state
        this.score = 0;
        this.gameSpeed = 0.08;
        this.isGameOver = false;
        this.verticalVelocity = 0;

        // Hide game over screen
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'none';
        }

        // Reinitialize
        this.init();
    }

    cleanup() {
        // Remove all objects from scene
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.ground.forEach(piece => this.scene.remove(piece));
        if (this.ceiling) {
            this.ceiling.forEach(piece => this.scene.remove(piece));
        }
        if (this.clouds) {
            this.clouds.forEach(cloud => this.scene.remove(cloud));
        }
        if (this.player) this.scene.remove(this.player);

        // Clear arrays
        this.obstacles = [];
        this.ground = [];
        this.ceiling = [];
        this.clouds = [];
    }
}