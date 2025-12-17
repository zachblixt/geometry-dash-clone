import * as THREE from 'three';

export default class FullMode {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Game state
        this.player = null;
        this.ground = [];
        this.platforms = [];
        this.spikes = [];
        this.barriers = [];
        this.particles = [];
        this.trails = [];
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
        this.backgroundCubes = [];
        this.pulseTime = 0;
        this.textures = {};

        // Game mode switching
        this.gameMode = 'cube';
        this.portals = [];

        // Plane physics
        this.planeGravity = 0.005; // Light gravity for slow fall
        this.planeThrustPower = 0.018; // Stronger thrust for easier climbing
        this.planeMaxUpVelocity = 0.35; // Faster max up speed to clear obstacles
        this.planeMaxDownVelocity = 0.3; // Controlled down speed
        this.planeDrag = 0.97; // Moderate air resistance
    }

    init() {
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.Fog(0x050510, 5, 35);

        this.camera.position.set(0, 1, 12);
        this.camera.lookAt(0, 0, 0);

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const frontLight = new THREE.DirectionalLight(0x00ffff, 1.0);
        frontLight.position.set(0, 5, 10);
        this.scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0xff00ff, 0.6);
        backLight.position.set(0, -5, -5);
        this.scene.add(backLight);

        const topLight = new THREE.DirectionalLight(0xffff00, 0.4);
        topLight.position.set(0, 10, 0);
        this.scene.add(topLight);

        this.loadTextures();
        this.createPlayer();
        this.createGround();
        this.createLevel();
        this.createBackground();
        this.updateScore(0);
    }

    loadTextures() {
        // Player texture
        const playerCanvas = document.createElement('canvas');
        playerCanvas.width = 128;
        playerCanvas.height = 128;
        const playerCtx = playerCanvas.getContext('2d');
        const playerGradient = playerCtx.createRadialGradient(64, 64, 20, 64, 64, 64);
        playerGradient.addColorStop(0, '#00ffff');
        playerGradient.addColorStop(0.5, '#00aaff');
        playerGradient.addColorStop(1, '#0055ff');
        playerCtx.fillStyle = playerGradient;
        playerCtx.fillRect(0, 0, 128, 128);
        this.textures.player = new THREE.CanvasTexture(playerCanvas);

        // Ground texture
        const groundCanvas = document.createElement('canvas');
        groundCanvas.width = 256;
        groundCanvas.height = 256;
        const groundCtx = groundCanvas.getContext('2d');
        groundCtx.fillStyle = '#1a1a2a';
        groundCtx.fillRect(0, 0, 256, 256);
        groundCtx.strokeStyle = '#00ffff';
        groundCtx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            groundCtx.beginPath();
            groundCtx.moveTo(i * 32, 0);
            groundCtx.lineTo(i * 32, 256);
            groundCtx.stroke();
            groundCtx.beginPath();
            groundCtx.moveTo(0, i * 32);
            groundCtx.lineTo(256, i * 32);
            groundCtx.stroke();
        }
        this.textures.ground = new THREE.CanvasTexture(groundCanvas);
        this.textures.ground.wrapS = THREE.RepeatWrapping;
        this.textures.ground.wrapT = THREE.RepeatWrapping;

        // Platform texture
        const platformCanvas = document.createElement('canvas');
        platformCanvas.width = 128;
        platformCanvas.height = 128;
        const platformCtx = platformCanvas.getContext('2d');
        const platformGradient = platformCtx.createLinearGradient(0, 0, 128, 128);
        platformGradient.addColorStop(0, '#ffaa00');
        platformGradient.addColorStop(0.5, '#ff8800');
        platformGradient.addColorStop(1, '#ff6600');
        platformCtx.fillStyle = platformGradient;
        platformCtx.fillRect(0, 0, 128, 128);
        this.textures.platform = new THREE.CanvasTexture(platformCanvas);
    }

    createPlayer() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshLambertMaterial({
            map: this.textures.player,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(-4, this.groundY + 0.9, 0);
        this.scene.add(this.player);
    }

    createGround() {
        for (let i = 0; i < 30; i++) {
            const groundGeometry = new THREE.BoxGeometry(3, 0.5, 3);
            const groundMaterial = new THREE.MeshLambertMaterial({
                map: this.textures.ground,
                emissive: 0x0055ff,
                emissiveIntensity: 0.2
            });
            const groundPiece = new THREE.Mesh(groundGeometry, groundMaterial);
            groundPiece.position.set(i * 3 - 10, this.groundY, 0);
            this.scene.add(groundPiece);
            this.ground.push(groundPiece);
        }
    }

    createLevel() {
        let xPos = 5;

        for (let i = 0; i < 20; i++) {
            const obstacleType = Math.floor(Math.random() * 5);

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
                    xPos += 5;
                    break;
                case 4:
                    xPos += 6;
                    break;
            }
        }

        this.createPortal(30, 'plane');
    }

    createSpike(xPosition) {
        const spikeGeometry = new THREE.ConeGeometry(0.4, 1, 4);
        const spikeMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0066,
            emissive: 0xff0066,
            emissiveIntensity: 0.8
        });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(xPosition, this.groundY + 0.75, 0);
        spike.rotation.y = Math.PI / 4;
        this.scene.add(spike);
        this.spikes.push(spike);
    }

    createPlatform(xPosition, height) {
        const platformGeometry = new THREE.BoxGeometry(3, 0.4, 1);
        const platformMaterial = new THREE.MeshLambertMaterial({
            map: this.textures.platform,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(xPosition, this.groundY + height, 0);
        platform.userData.height = 0.4;
        this.scene.add(platform);
        this.platforms.push(platform);
    }

    createPortal(xPosition, targetMode) {
        const frameGeometry = new THREE.TorusGeometry(1.2, 0.15, 8, 20);
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: targetMode === 'plane' ? 0x00ffff : 0xff00ff,
            emissive: targetMode === 'plane' ? 0x00ffff : 0xff00ff,
            emissiveIntensity: 1.2
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(xPosition, 0, 0);
        frame.rotation.y = Math.PI / 2;

        const portalCanvas = document.createElement('canvas');
        portalCanvas.width = 128;
        portalCanvas.height = 128;
        const ctx = portalCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
        gradient.addColorStop(0, targetMode === 'plane' ? '#00ffff' : '#ff00ff');
        gradient.addColorStop(0.5, targetMode === 'plane' ? '#0088ff' : '#ff0088');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        const portalTexture = new THREE.CanvasTexture(portalCanvas);

        const centerGeometry = new THREE.CircleGeometry(1.1, 32);
        const centerMaterial = new THREE.MeshLambertMaterial({
            map: portalTexture,
            transparent: true,
            opacity: 0.6,
            emissive: targetMode === 'plane' ? 0x0088ff : 0xff0088,
            emissiveIntensity: 0.8
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(xPosition, 0, 0);

        this.scene.add(frame);
        this.scene.add(center);

        this.portals.push({
            frame,
            center,
            position: xPosition,
            targetMode,
            activated: false
        });
    }

    createAsteroid(xPosition, yPosition) {
        // Create a rocky asteroid using icosahedron
        const size = 0.6 + Math.random() * 0.4; // Random size 0.6-1.0
        const asteroidGeometry = new THREE.IcosahedronGeometry(size, 1);

        // Create texture for asteroid
        const asteroidCanvas = document.createElement('canvas');
        asteroidCanvas.width = 128;
        asteroidCanvas.height = 128;
        const ctx = asteroidCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#654321');
        gradient.addColorStop(1, '#3E2723');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        const asteroidTexture = new THREE.CanvasTexture(asteroidCanvas);

        const asteroidMaterial = new THREE.MeshLambertMaterial({
            map: asteroidTexture,
            color: 0x8B4513,
            emissive: 0xff6600,
            emissiveIntensity: 0.4
        });

        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.set(xPosition, yPosition, 0);

        // Random rotation speeds for each asteroid
        asteroid.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.05,
            z: (Math.random() - 0.5) * 0.05
        };
        asteroid.userData.size = size;

        this.scene.add(asteroid);
        this.barriers.push(asteroid); // Reusing barriers array for asteroids
    }

    createBackground() {
        for (let i = 0; i < 20; i++) {
            const shapes = [
                new THREE.BoxGeometry(0.5, 0.5, 0.5),
                new THREE.OctahedronGeometry(0.3),
                new THREE.TetrahedronGeometry(0.4)
            ];
            const geometry = shapes[Math.floor(Math.random() * shapes.length)];
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1.0, 0.6),
                emissive: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.4
            });
            const shape = new THREE.Mesh(geometry, material);
            shape.position.set(
                Math.random() * 40 - 10,
                Math.random() * 6 - 2,
                -3 - Math.random() * 6
            );
            shape.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.03,
                y: (Math.random() - 0.5) * 0.03,
                z: (Math.random() - 0.5) * 0.03
            };
            this.scene.add(shape);
            this.backgroundCubes.push(shape);
        }
    }

    createParticle(x, y) {
        const geometry = new THREE.OctahedronGeometry(0.08);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(x, y, 0);
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.15,
            y: Math.random() * 0.25,
            rotation: Math.random() * 0.2,
            life: 1.0
        };
        this.scene.add(particle);
        this.particles.push(particle);
    }

    createTrail() {
        if (this.trails.length > 10) {
            const oldTrail = this.trails.shift();
            this.scene.remove(oldTrail);
        }

        const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        const trail = new THREE.Mesh(geometry, material);
        trail.position.copy(this.player.position);
        trail.rotation.copy(this.player.rotation);
        trail.userData.life = 1.0;
        this.scene.add(trail);
        this.trails.push(trail);
    }

    handleInput(keys, mobileJump) {
        if (this.isGameOver) return;

        if (this.gameMode === 'cube') {
            if ((keys['Space'] || keys['ArrowUp'] || mobileJump) && this.isOnGround) {
                this.verticalVelocity = this.jumpVelocity;
                this.isOnGround = false;

                for (let i = 0; i < 5; i++) {
                    this.createParticle(this.player.position.x, this.player.position.y - 0.4);
                }
            }
        } else if (this.gameMode === 'plane') {
            if (keys['Space'] || keys['ArrowUp'] || mobileJump) {
                this.verticalVelocity += this.planeThrustPower;

                if (Math.random() < 0.4) {
                    this.createParticle(this.player.position.x - 0.6, this.player.position.y);
                }
            }
        }
    }

    update() {
        if (this.isGameOver) return;

        this.pulseTime += 0.05;

        if (this.gameMode === 'plane') {
            this.handlePlaneMode();
        } else {
            this.handleCubeMode();
        }

        this.updateGround();
        this.updatePlatforms();
        this.updateSpikes();
        this.updateBarriers();
        this.updatePortals();
        this.updateBackground();
        this.updateParticles();
        this.updateTrails();

        if (Math.random() < 0.3) {
            this.createTrail();
        }

        this.score += 0.2;
        this.updateScore(Math.floor(this.score));
        this.gameSpeed = 0.12 + (this.score * 0.00005);
    }

    handlePlaneMode() {
        this.verticalVelocity -= this.planeGravity;
        this.verticalVelocity *= this.planeDrag;

        if (this.verticalVelocity > this.planeMaxUpVelocity) {
            this.verticalVelocity = this.planeMaxUpVelocity;
        }
        if (this.verticalVelocity < -this.planeMaxDownVelocity) {
            this.verticalVelocity = -this.planeMaxDownVelocity;
        }

        this.player.position.y += this.verticalVelocity;
        this.player.rotation.z = -this.verticalVelocity * 0.8;

        // Keep plane within bounds - higher ceiling for easier flight
        if (this.player.position.y > 4.5) {
            this.player.position.y = 4.5;
            this.verticalVelocity = 0;
        }
        if (this.player.position.y < this.groundY + 0.5) {
            this.player.position.y = this.groundY + 0.5;
            this.verticalVelocity = 0;
        }
    }

    handleCubeMode() {
        if (this.isOnGround) {
            this.verticalVelocity = 0;
        } else {
            this.verticalVelocity -= this.gravity;
        }

        this.player.position.y += this.verticalVelocity;

        this.isOnGround = false;
        if (this.player.position.y <= this.groundY + 0.9) {
            this.player.position.y = this.groundY + 0.9;
            this.verticalVelocity = 0;
            this.isOnGround = true;
            this.playerRotation = Math.round(this.playerRotation / (Math.PI / 2)) * (Math.PI / 2);
        }

        if (!this.isOnGround) {
            this.playerRotation += 0.15;
        }
        this.player.rotation.z = this.playerRotation;

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
    }

    updateGround() {
        this.ground.forEach(piece => {
            piece.position.x -= this.gameSpeed;
            if (piece.position.x < -15) {
                piece.position.x += 90;
            }

            const pulse = Math.sin(this.pulseTime + piece.position.x * 0.1) * 0.1;
            piece.material.emissiveIntensity = 0.2 + pulse;
        });
    }

    updatePlatforms() {
        this.platforms.forEach(platform => {
            platform.position.x -= this.gameSpeed;

            const pulse = Math.sin(this.pulseTime * 2 + platform.position.x * 0.2) * 0.2;
            platform.material.emissiveIntensity = 0.5 + pulse;

            if (platform.position.x < -15) {
                platform.position.x = 40;
                platform.position.y = this.groundY + 0.5 + Math.random() * 2;
            }
        });
    }

    updateSpikes() {
        if (this.gameMode === 'cube') {
            this.spikes.forEach(spike => {
                spike.position.x -= this.gameSpeed;
                spike.rotation.y += 0.05;

                const pulse = Math.sin(this.pulseTime * 3) * 0.3;
                spike.material.emissiveIntensity = 0.8 + pulse;

                if (spike.position.x < -15) {
                    spike.position.x = 40;
                }

                const distance = Math.abs(this.player.position.x - spike.position.x);
                const heightDiff = Math.abs(this.player.position.y - spike.position.y);

                if (distance < 0.6 && heightDiff < 0.8) {
                    this.gameOver();
                }
            });
        }
    }

    updateBarriers() {
        if (this.gameMode === 'plane') {
            this.barriers.forEach(asteroid => {
                // Move asteroid
                asteroid.position.x -= this.gameSpeed;

                // Rotate asteroid
                asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
                asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
                asteroid.rotation.z += asteroid.userData.rotationSpeed.z;

                // Pulse effect
                const pulse = Math.sin(this.pulseTime * 2) * 0.2;
                asteroid.material.emissiveIntensity = 0.4 + pulse;

                // Recycle asteroid
                if (asteroid.position.x < -15) {
                    asteroid.position.x = 60;
                    asteroid.position.y = this.groundY + 1.5 + Math.random() * 2.5;
                }

                // Collision detection - simple sphere collision
                const dx = this.player.position.x - asteroid.position.x;
                const dy = this.player.position.y - asteroid.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Collision radius = asteroid size + small plane hitbox
                const collisionDistance = asteroid.userData.size + 0.4;

                if (distance < collisionDistance) {
                    this.gameOver();
                }
            });
        }
    }

    updatePortals() {
        this.portals.forEach(portal => {
            portal.frame.position.x -= this.gameSpeed;
            portal.center.position.x -= this.gameSpeed;
            portal.position -= this.gameSpeed;

            portal.frame.rotation.z += 0.05;

            const pulse = Math.sin(this.pulseTime * 3) * 0.4;
            portal.frame.material.emissiveIntensity = 1.2 + pulse;

            if (portal.position < -15) {
                portal.position = 60;
                portal.frame.position.x = 60;
                portal.center.position.x = 60;
                portal.activated = false;
                portal.targetMode = portal.targetMode === 'plane' ? 'cube' : 'plane';
                portal.frame.material.color.setHex(portal.targetMode === 'plane' ? 0x00ffff : 0xff00ff);
                portal.frame.material.emissive.setHex(portal.targetMode === 'plane' ? 0x00ffff : 0xff00ff);
                portal.center.material.emissive.setHex(portal.targetMode === 'plane' ? 0x0088ff : 0xff0088);
            }

            const distance = Math.abs(this.player.position.x - portal.position);
            if (distance < 1.2 && !portal.activated) {
                portal.activated = true;

                if (portal.targetMode === 'plane' && this.gameMode === 'cube') {
                    this.transformToPlane();
                } else if (portal.targetMode === 'cube' && this.gameMode === 'plane') {
                    this.transformToCube();
                }
            }
        });
    }

    updateBackground() {
        this.backgroundCubes.forEach(cube => {
            cube.rotation.x += cube.userData.rotationSpeed.x;
            cube.rotation.y += cube.userData.rotationSpeed.y;
            cube.rotation.z += cube.userData.rotationSpeed.z;

            cube.position.x -= this.gameSpeed * 0.3;
            if (cube.position.x < -15) {
                cube.position.x = 30;
            }
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.rotation.x += particle.userData.velocity.rotation;
            particle.rotation.y += particle.userData.velocity.rotation;
            particle.userData.velocity.y -= 0.01;
            particle.userData.life -= 0.02;
            particle.material.opacity = particle.userData.life;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    updateTrails() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.userData.life -= 0.05;
            trail.material.opacity = trail.userData.life * 0.3;

            if (trail.userData.life <= 0) {
                this.scene.remove(trail);
                this.trails.splice(i, 1);
            }
        }
    }

    transformToPlane() {
        this.scene.remove(this.player);

        const planeGroup = new THREE.Group();

        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        planeGroup.add(body);

        const wingGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.4);
        const wingMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        planeGroup.add(wings);

        const noseGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.6
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.rotation.z = -Math.PI / 2;
        nose.position.x = 0.8;
        planeGroup.add(nose);

        planeGroup.position.copy(this.player.position);
        this.scene.add(planeGroup);
        this.player = planeGroup;
        this.gameMode = 'plane';
        this.verticalVelocity = 0;

        this.spikes.forEach(spike => this.scene.remove(spike));
        this.spikes = [];
        this.platforms.forEach(platform => this.scene.remove(platform));
        this.platforms = [];

        // Create scattered asteroids
        for (let i = 0; i < 8; i++) {
            const xPos = 10 + i * 8; // Spacing between asteroids
            const yPos = this.groundY + 1.5 + Math.random() * 2.5; // Random height
            this.createAsteroid(xPos, yPos);
        }

        for (let i = 0; i < 15; i++) {
            this.createParticle(this.player.position.x, this.player.position.y);
        }
    }

    transformToCube() {
        this.scene.remove(this.player);

        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshLambertMaterial({
            map: this.textures.player,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(this.player.position);
        this.scene.add(cube);
        this.player = cube;
        this.gameMode = 'cube';
        this.verticalVelocity = 0;
        this.playerRotation = 0;

        this.barriers.forEach(asteroid => {
            this.scene.remove(asteroid);
        });
        this.barriers = [];

        let xPos = 10;
        for (let i = 0; i < 10; i++) {
            const obstacleType = Math.floor(Math.random() * 5);
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
                    xPos += 5;
                    break;
                case 4:
                    xPos += 6;
                    break;
            }
        }

        for (let i = 0; i < 15; i++) {
            this.createParticle(this.player.position.x, this.player.position.y);
        }
    }

    updateScore(score) {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }

    gameOver() {
        this.isGameOver = true;

        for (let i = 0; i < 30; i++) {
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
        this.cleanup();

        this.score = 0;
        this.gameSpeed = 0.12;
        this.isGameOver = false;
        this.verticalVelocity = 0;
        this.isOnGround = false;
        this.playerRotation = 0;
        this.pulseTime = 0;
        this.gameMode = 'cube';

        document.getElementById('game-over').style.display = 'none';
        this.init();
    }

    cleanup() {
        this.spikes.forEach(spike => this.scene.remove(spike));
        this.platforms.forEach(platform => this.scene.remove(platform));
        this.barriers.forEach(asteroid => {
            this.scene.remove(asteroid);
        });
        this.ground.forEach(piece => this.scene.remove(piece));
        this.backgroundCubes.forEach(cube => this.scene.remove(cube));
        this.particles.forEach(particle => this.scene.remove(particle));
        this.trails.forEach(trail => this.scene.remove(trail));
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
        this.trails = [];
        this.portals = [];
    }
}
