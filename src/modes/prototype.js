// Prototype mode - Epic Geometry Dash clone with primitives only
export default class PrototypeMode {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Game state
        this.player = null;
        this.ground = [];
        this.obstacles = [];
        this.platforms = [];
        this.spikes = [];
        this.barriers = []; // Plane mode obstacles
        this.particles = [];
        this.gameSpeed = 0.12;
        this.score = 0;
        this.isGameOver = false;
        this.verticalVelocity = 0;
        this.gravity = 0.015;
        this.jumpVelocity = 0.45;
        this.maxVelocity = 0.8;
        this.groundY = -2;
        this.isOnGround = false;
        this.playerRotation = 0;

        // Visual effects
        this.trailCubes = [];
        this.backgroundCubes = [];
        this.pulseTime = 0;

        // Game mode switching
        this.gameMode = 'cube'; // 'cube' or 'plane'
        this.portals = [];
        this.nextPortalScore = 100;
    }

    init() {
        // Epic gradient background
        this.scene.background = new THREE.Color(0x0a0a1a);

        // Add atmospheric fog
        this.scene.fog = new THREE.Fog(0x0a0a1a, 5, 35);

        // Position camera for better view
        this.camera.position.set(0, 1, 12);
        this.camera.lookAt(0, 0, 0);

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const frontLight = new THREE.DirectionalLight(0x00ffff, 0.8);
        frontLight.position.set(0, 5, 10);
        this.scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0xff00ff, 0.5);
        backLight.position.set(0, -5, -5);
        this.scene.add(backLight);

        // Create player
        this.createPlayer();

        // Create ground
        this.createGround();

        // Create level
        this.createLevel();

        // Create background elements
        this.createBackground();

        // Update score display
        this.updateScore(0);
    }

    createPlayer() {
        // Rotating cube player like classic Geometry Dash
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3
        });
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(-4, this.groundY + 0.9, 0);
        this.scene.add(this.player);
    }

    createGround() {
        // Segmented ground with cool pattern
        for (let i = 0; i < 30; i++) {
            const groundGeometry = new THREE.BoxGeometry(3, 0.5, 3);
            const groundMaterial = new THREE.MeshLambertMaterial({
                color: i % 2 === 0 ? 0x1a1a3a : 0x252550,
                emissive: 0x0000ff,
                emissiveIntensity: 0.1
            });
            const groundPiece = new THREE.Mesh(groundGeometry, groundMaterial);
            groundPiece.position.set(i * 3 - 10, this.groundY, 0);
            this.scene.add(groundPiece);
            this.ground.push(groundPiece);
        }
    }

    createLevel() {
        // Create varied obstacles for exciting gameplay
        let xPos = 5;

        for (let i = 0; i < 20; i++) {
            const obstacleType = Math.floor(Math.random() * 4);

            switch(obstacleType) {
                case 0: // Single spike
                    this.createSpike(xPos);
                    xPos += 4;
                    break;
                case 1: // Platform to jump on
                    this.createPlatform(xPos, 0.5 + Math.random() * 1.5);
                    xPos += 5;
                    break;
                case 2: // Triple spikes
                    this.createSpike(xPos);
                    this.createSpike(xPos + 1.2);
                    this.createSpike(xPos + 2.4);
                    xPos += 6;
                    break;
                case 3: // Floating platform
                    this.createPlatform(xPos, 2 + Math.random() * 1);
                    this.createSpike(xPos + 2);
                    xPos += 6;
                    break;
            }
        }

        // Create first portal at score position
        this.createPortal(30, 'plane');
    }

    createSpike(xPosition) {
        // Deadly spike obstacle
        const spikeGeometry = new THREE.ConeGeometry(0.4, 1, 4);
        const spikeMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 0.5
        });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(xPosition, this.groundY + 0.75, 0);
        spike.rotation.y = Math.PI / 4;
        this.scene.add(spike);
        this.spikes.push(spike);
    }

    createPlatform(xPosition, height) {
        // Platform to jump on
        const platformGeometry = new THREE.BoxGeometry(3, 0.4, 1);
        const platformMaterial = new THREE.MeshLambertMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(xPosition, this.groundY + height, 0);
        platform.userData.height = 0.4;
        this.scene.add(platform);
        this.platforms.push(platform);
    }

    createPortal(xPosition, targetMode) {
        // Create portal frame
        const frameGeometry = new THREE.TorusGeometry(1.2, 0.15, 8, 20);
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: targetMode === 'plane' ? 0x00ffff : 0xff00ff,
            emissive: targetMode === 'plane' ? 0x00ffff : 0xff00ff,
            emissiveIntensity: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(xPosition, 0, 0);
        frame.rotation.y = Math.PI / 2;

        // Create portal center effect
        const centerGeometry = new THREE.CircleGeometry(1.1, 32);
        const centerMaterial = new THREE.MeshLambertMaterial({
            color: targetMode === 'plane' ? 0x0088ff : 0xff0088,
            transparent: true,
            opacity: 0.4,
            emissive: targetMode === 'plane' ? 0x0088ff : 0xff0088,
            emissiveIntensity: 0.5
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(xPosition, 0, 0);

        this.scene.add(frame);
        this.scene.add(center);

        const portal = {
            frame: frame,
            center: center,
            position: xPosition,
            targetMode: targetMode,
            activated: false
        };

        this.portals.push(portal);
    }

    createBarrier(xPosition, gapY, gapSize) {
        // Floating barrier for plane mode (like Flappy Bird pipes)
        // Top barrier
        const topHeight = gapY - gapSize / 2 + 2;
        const topGeometry = new THREE.BoxGeometry(0.6, topHeight, 1.5);
        const topMaterial = new THREE.MeshLambertMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 0.4
        });
        const topBarrier = new THREE.Mesh(topGeometry, topMaterial);
        topBarrier.position.set(xPosition, gapY + gapSize / 2 + topHeight / 2, 0);

        // Bottom barrier
        const bottomHeight = gapY + gapSize / 2 - this.groundY;
        const bottomGeometry = new THREE.BoxGeometry(0.6, bottomHeight, 1.5);
        const bottomMaterial = new THREE.MeshLambertMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 0.4
        });
        const bottomBarrier = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottomBarrier.position.set(xPosition, this.groundY + bottomHeight / 2, 0);

        this.scene.add(topBarrier);
        this.scene.add(bottomBarrier);

        this.barriers.push({
            top: topBarrier,
            bottom: bottomBarrier,
            gapY: gapY,
            gapSize: gapSize
        });
    }

    createBackground() {
        // Floating cubes in background for atmosphere
        for (let i = 0; i < 15; i++) {
            const size = 0.3 + Math.random() * 0.5;
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
                transparent: true,
                opacity: 0.3
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                Math.random() * 40 - 10,
                Math.random() * 6 - 2,
                -3 - Math.random() * 5
            );
            cube.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            };
            this.scene.add(cube);
            this.backgroundCubes.push(cube);
        }
    }

    createParticle(x, y) {
        // Create particle effect
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(x, y, 0);
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.1,
            y: Math.random() * 0.2,
            life: 1.0
        };
        this.scene.add(particle);
        this.particles.push(particle);
    }

    handleInput(keys, mobileJump) {
        if (this.isGameOver) return;

        if (this.gameMode === 'cube') {
            // Jump on key press (not hold)
            if ((keys['Space'] || keys['ArrowUp'] || mobileJump) && this.isOnGround) {
                this.verticalVelocity = this.jumpVelocity;
                this.isOnGround = false;

                // Particle effect on jump
                for (let i = 0; i < 5; i++) {
                    this.createParticle(this.player.position.x, this.player.position.y - 0.4);
                }
            }
        } else if (this.gameMode === 'plane') {
            // Thrust controls for plane mode (less dramatic)
            if (keys['Space'] || keys['ArrowUp'] || mobileJump) {
                this.verticalVelocity += 0.015; // Reduced from 0.025 for smoother control
            }
        }
    }

    transformToPlane() {
        // Remove cube player
        this.scene.remove(this.player);

        // Create plane from primitives
        const planeGroup = new THREE.Group();

        // Fuselage
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        planeGroup.add(body);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.4);
        const wingMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 0.3
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        planeGroup.add(wings);

        // Nose cone
        const noseGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.4
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.rotation.z = -Math.PI / 2;
        nose.position.x = 0.8;
        planeGroup.add(nose);

        planeGroup.position.copy(this.player.position);
        this.scene.add(planeGroup);
        this.player = planeGroup;
        this.gameMode = 'plane';

        // Clear cube obstacles
        this.spikes.forEach(spike => this.scene.remove(spike));
        this.spikes = [];
        this.platforms.forEach(platform => this.scene.remove(platform));
        this.platforms = [];

        // Spawn plane obstacles (barriers with gaps)
        for (let i = 0; i < 8; i++) {
            const xPos = 10 + i * 8;
            const gapY = -0.2 + Math.random() * 1.5; // Gap center Y position (more centered)
            const gapSize = 3.2 + Math.random() * 0.8; // Gap height (much bigger for easier gameplay)
            this.createBarrier(xPos, gapY, gapSize);
        }

        // Particle burst effect
        for (let i = 0; i < 15; i++) {
            this.createParticle(this.player.position.x, this.player.position.y);
        }
    }

    transformToCube() {
        // Remove plane player
        this.scene.remove(this.player);

        // Create cube player
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(this.player.position);
        this.scene.add(cube);
        this.player = cube;
        this.gameMode = 'cube';
        this.playerRotation = 0;

        // Clear plane obstacles
        this.barriers.forEach(barrier => {
            this.scene.remove(barrier.top);
            this.scene.remove(barrier.bottom);
        });
        this.barriers = [];

        // Spawn cube obstacles (spikes and platforms)
        let xPos = 10;
        for (let i = 0; i < 10; i++) {
            const obstacleType = Math.floor(Math.random() * 4);
            switch(obstacleType) {
                case 0:
                    this.createSpike(xPos);
                    xPos += 4;
                    break;
                case 1:
                    this.createPlatform(xPos, 0.5 + Math.random() * 1.5);
                    xPos += 5;
                    break;
                case 2:
                    this.createSpike(xPos);
                    this.createSpike(xPos + 1.2);
                    xPos += 5;
                    break;
                case 3:
                    this.createPlatform(xPos, 2 + Math.random() * 1);
                    this.createSpike(xPos + 2);
                    xPos += 6;
                    break;
            }
        }

        // Particle burst effect
        for (let i = 0; i < 15; i++) {
            this.createParticle(this.player.position.x, this.player.position.y);
        }
    }

    update() {
        if (this.isGameOver) return;

        this.pulseTime += 0.05;

        // Apply gravity
        this.verticalVelocity -= this.gravity;
        this.verticalVelocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.verticalVelocity));

        // Update player position
        this.player.position.y += this.verticalVelocity;

        // Rotate player cube or tilt plane
        if (this.gameMode === 'cube') {
            if (!this.isOnGround) {
                this.playerRotation += 0.15;
            }
            this.player.rotation.z = this.playerRotation;
        } else if (this.gameMode === 'plane') {
            // Tilt plane based on velocity
            this.player.rotation.z = -this.verticalVelocity * 0.5;
        }

        // Ground collision
        this.isOnGround = false;
        if (this.player.position.y <= this.groundY + 0.9) {
            this.player.position.y = this.groundY + 0.9;
            this.verticalVelocity = 0;
            this.isOnGround = true;
            this.playerRotation = Math.round(this.playerRotation / (Math.PI / 2)) * (Math.PI / 2);
        }

        // Platform collision (land on top only)
        this.platforms.forEach(platform => {
            const distance = Math.abs(this.player.position.x - platform.position.x);
            const heightDiff = this.player.position.y - platform.position.y;

            if (distance < 1.6 && heightDiff > 0 && heightDiff < 0.9 && this.verticalVelocity < 0) {
                this.player.position.y = platform.position.y + 0.6;
                this.verticalVelocity = 0;
                this.isOnGround = true;
                this.playerRotation = Math.round(this.playerRotation / (Math.PI / 2)) * (Math.PI / 2);
            }
        });

        // Move and recycle ground
        this.ground.forEach(piece => {
            piece.position.x -= this.gameSpeed;
            if (piece.position.x < -15) {
                piece.position.x += 90;
            }

            // Pulse effect
            const pulse = Math.sin(this.pulseTime + piece.position.x * 0.1) * 0.1;
            piece.material.emissiveIntensity = 0.1 + pulse;
        });

        // Move platforms
        this.platforms.forEach(platform => {
            platform.position.x -= this.gameSpeed;

            // Pulse effect
            const pulse = Math.sin(this.pulseTime * 2 + platform.position.x * 0.2) * 0.2;
            platform.material.emissiveIntensity = 0.3 + pulse;

            if (platform.position.x < -15) {
                platform.position.x = 40;
                platform.position.y = this.groundY + 0.5 + Math.random() * 2;
            }
        });

        // Move and check spike collisions (cube mode only)
        if (this.gameMode === 'cube') {
            this.spikes.forEach(spike => {
                spike.position.x -= this.gameSpeed;

                // Rotate and pulse
                spike.rotation.y += 0.05;
                const pulse = Math.sin(this.pulseTime * 3) * 0.3;
                spike.material.emissiveIntensity = 0.5 + pulse;

                if (spike.position.x < -15) {
                    spike.position.x = 40;
                }

                // Collision detection
                const distance = Math.abs(this.player.position.x - spike.position.x);
                const heightDiff = Math.abs(this.player.position.y - spike.position.y);

                if (distance < 0.6 && heightDiff < 0.8) {
                    this.gameOver();
                }
            });
        }

        // Move and check barrier collisions (plane mode only)
        if (this.gameMode === 'plane') {
            this.barriers.forEach(barrier => {
                barrier.top.position.x -= this.gameSpeed;
                barrier.bottom.position.x -= this.gameSpeed;

                // Pulse effect
                const pulse = Math.sin(this.pulseTime * 2) * 0.2;
                barrier.top.material.emissiveIntensity = 0.4 + pulse;
                barrier.bottom.material.emissiveIntensity = 0.4 + pulse;

                // Recycle barrier
                if (barrier.top.position.x < -15) {
                    const newX = 50;
                    const newGapY = -0.5 + Math.random() * 2;
                    const newGapSize = 2.5 + Math.random() * 0.5;

                    // Update positions
                    barrier.top.position.x = newX;
                    barrier.bottom.position.x = newX;
                    barrier.gapY = newGapY;
                    barrier.gapSize = newGapSize;

                    // Recalculate heights
                    const topHeight = newGapY - newGapSize / 2 + 2;
                    const bottomHeight = newGapY + newGapSize / 2 - this.groundY;
                    barrier.top.position.y = newGapY + newGapSize / 2 + topHeight / 2;
                    barrier.bottom.position.y = this.groundY + bottomHeight / 2;

                    // Update geometry
                    barrier.top.geometry.dispose();
                    barrier.bottom.geometry.dispose();
                    barrier.top.geometry = new THREE.BoxGeometry(0.6, topHeight, 1.5);
                    barrier.bottom.geometry = new THREE.BoxGeometry(0.6, bottomHeight, 1.5);
                }

                // Collision detection - only check when player is near the barrier
                const distance = Math.abs(this.player.position.x - barrier.top.position.x);
                if (distance < 0.8) {
                    // Check if player is outside the gap (with more forgiving hitbox)
                    const playerRadius = 0.5; // Account for plane size
                    if (this.player.position.y + playerRadius > barrier.gapY + barrier.gapSize / 2 ||
                        this.player.position.y - playerRadius < barrier.gapY - barrier.gapSize / 2) {
                        this.gameOver();
                    }
                }
            });
        }

        // Update background cubes
        this.backgroundCubes.forEach(cube => {
            cube.rotation.x += cube.userData.rotationSpeed.x;
            cube.rotation.y += cube.userData.rotationSpeed.y;
            cube.rotation.z += cube.userData.rotationSpeed.z;

            cube.position.x -= this.gameSpeed * 0.3;
            if (cube.position.x < -15) {
                cube.position.x = 30;
            }
        });

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.userData.velocity.y -= 0.01;
            particle.userData.life -= 0.02;
            particle.material.opacity = particle.userData.life;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }

        // Move and check portal collisions
        this.portals.forEach(portal => {
            portal.frame.position.x -= this.gameSpeed;
            portal.center.position.x -= this.gameSpeed;
            portal.position -= this.gameSpeed;

            // Rotate portal for effect
            portal.frame.rotation.z += 0.05;

            // Pulse effect
            const pulse = Math.sin(this.pulseTime * 3) * 0.3;
            portal.frame.material.emissiveIntensity = 0.8 + pulse;

            // Check collision with player
            const distance = Math.abs(this.player.position.x - portal.position);
            if (distance < 1.2 && !portal.activated) {
                portal.activated = true;

                // Transform player
                if (portal.targetMode === 'plane' && this.gameMode === 'cube') {
                    this.transformToPlane();
                } else if (portal.targetMode === 'cube' && this.gameMode === 'plane') {
                    this.transformToCube();
                }
            }

            // Recycle portal
            if (portal.position < -15) {
                portal.position = 60;
                portal.frame.position.x = 60;
                portal.center.position.x = 60;
                portal.activated = false;
                // Switch target mode for next portal
                portal.targetMode = portal.targetMode === 'plane' ? 'cube' : 'plane';
                portal.frame.material.color.setHex(portal.targetMode === 'plane' ? 0x00ffff : 0xff00ff);
                portal.frame.material.emissive.setHex(portal.targetMode === 'plane' ? 0x00ffff : 0xff00ff);
                portal.center.material.color.setHex(portal.targetMode === 'plane' ? 0x0088ff : 0xff0088);
                portal.center.material.emissive.setHex(portal.targetMode === 'plane' ? 0x0088ff : 0xff0088);
            }
        });

        // Increase score
        this.score += 0.2;
        this.updateScore(Math.floor(this.score));

        // Gradually increase difficulty
        this.gameSpeed = 0.12 + (this.score * 0.00005);
    }

    updateScore(score) {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }

    gameOver() {
        this.isGameOver = true;

        // Explosion effect
        for (let i = 0; i < 20; i++) {
            this.createParticle(this.player.position.x, this.player.position.y);
        }

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
        // Clear all objects
        this.spikes.forEach(spike => this.scene.remove(spike));
        this.spikes = [];

        this.platforms.forEach(platform => this.scene.remove(platform));
        this.platforms = [];

        this.barriers.forEach(barrier => {
            this.scene.remove(barrier.top);
            this.scene.remove(barrier.bottom);
        });
        this.barriers = [];

        this.ground.forEach(piece => this.scene.remove(piece));
        this.ground = [];

        this.backgroundCubes.forEach(cube => this.scene.remove(cube));
        this.backgroundCubes = [];

        this.particles.forEach(particle => this.scene.remove(particle));
        this.particles = [];

        this.portals.forEach(portal => {
            this.scene.remove(portal.frame);
            this.scene.remove(portal.center);
        });
        this.portals = [];

        this.scene.remove(this.player);

        // Reset game state
        this.score = 0;
        this.gameSpeed = 0.12;
        this.isGameOver = false;
        this.verticalVelocity = 0;
        this.isOnGround = false;
        this.playerRotation = 0;
        this.pulseTime = 0;
        this.gameMode = 'cube';

        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'none';
        }

        this.init();
    }

    cleanup() {
        this.spikes.forEach(spike => this.scene.remove(spike));
        this.platforms.forEach(platform => this.scene.remove(platform));
        this.barriers.forEach(barrier => {
            this.scene.remove(barrier.top);
            this.scene.remove(barrier.bottom);
        });
        this.ground.forEach(piece => this.scene.remove(piece));
        this.backgroundCubes.forEach(cube => this.scene.remove(cube));
        this.particles.forEach(particle => this.scene.remove(particle));
        this.portals.forEach(portal => {
            this.scene.remove(portal.frame);
            this.scene.remove(portal.center);
        });
        if (this.player) this.scene.remove(this.player);

        this.spikes = [];
        this.platforms = [];
        this.barriers = [];
        this.ground = [];
        this.backgroundCubes = [];
        this.particles = [];
        this.portals = [];
    }
}
