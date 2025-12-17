import * as THREE from 'three';

export default class PrototypeMode {
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

        // Game mode switching
        this.gameMode = 'cube';
        this.portals = [];

        // Plane physics
        this.planeGravity = 0.004; // Very light gravity for slow fall
        this.planeThrustPower = 0.012; // Gentle thrust for slow climb
        this.planeMaxUpVelocity = 0.25; // Slower max up speed
        this.planeMaxDownVelocity = 0.25; // Slower max down speed
        this.planeDrag = 0.96; // More air resistance for smoother control
    }

    init() {
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 5, 35);

        this.camera.position.set(0, 1, 12);
        this.camera.lookAt(0, 0, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const frontLight = new THREE.DirectionalLight(0x00ffff, 0.8);
        frontLight.position.set(0, 5, 10);
        this.scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0xff00ff, 0.5);
        backLight.position.set(0, -5, -5);
        this.scene.add(backLight);

        this.createPlayer();
        this.createGround();
        this.createLevel();
        this.createBackground();
        this.updateScore(0);
    }

    createPlayer() {
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
        const frameGeometry = new THREE.TorusGeometry(1.2, 0.15, 8, 20);
        const frameMaterial = new THREE.MeshLambertMaterial({
            color: targetMode === 'plane' ? 0x00ffff : 0xff00ff,
            emissive: targetMode === 'plane' ? 0x00ffff : 0xff00ff,
            emissiveIntensity: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(xPosition, 0, 0);
        frame.rotation.y = Math.PI / 2;

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

        this.portals.push({
            frame,
            center,
            position: xPosition,
            targetMode,
            activated: false
        });
    }

    createBarrier(xPosition, gapY, gapSize) {
        const topHeight = gapY - gapSize / 2 + 2;
        const topGeometry = new THREE.BoxGeometry(0.6, topHeight, 1.5);
        const topMaterial = new THREE.MeshLambertMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 0.4
        });
        const topBarrier = new THREE.Mesh(topGeometry, topMaterial);
        topBarrier.position.set(xPosition, gapY + gapSize / 2 + topHeight / 2, 0);

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
            gapY,
            gapSize
        });
    }

    createBackground() {
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

        if (this.gameMode === 'cube') {
            if (!this.isOnGround) {
                this.playerRotation += 0.15;
            }
            this.player.rotation.z = this.playerRotation;
        }

        this.updateGround();
        this.updatePlatforms();
        this.updateSpikes();
        this.updateBarriers();
        this.updatePortals();
        this.updateBackground();
        this.updateParticles();

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

        if (this.player.position.y > 3) {
            this.player.position.y = 3;
            this.verticalVelocity = 0;
        }
        if (this.player.position.y < this.groundY + 0.5) {
            this.player.position.y = this.groundY + 0.5;
            this.verticalVelocity = 0;
        }
    }

    handleCubeMode() {
        this.verticalVelocity -= this.gravity;
        this.verticalVelocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.verticalVelocity));

        this.player.position.y += this.verticalVelocity;

        this.isOnGround = false;
        if (this.player.position.y <= this.groundY + 0.9) {
            this.player.position.y = this.groundY + 0.9;
            this.verticalVelocity = 0;
            this.isOnGround = true;
            this.playerRotation = Math.round(this.playerRotation / (Math.PI / 2)) * (Math.PI / 2);
        }

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
            piece.material.emissiveIntensity = 0.1 + pulse;
        });
    }

    updatePlatforms() {
        this.platforms.forEach(platform => {
            platform.position.x -= this.gameSpeed;

            const pulse = Math.sin(this.pulseTime * 2 + platform.position.x * 0.2) * 0.2;
            platform.material.emissiveIntensity = 0.3 + pulse;

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
                spike.material.emissiveIntensity = 0.5 + pulse;

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
            this.barriers.forEach(barrier => {
                barrier.top.position.x -= this.gameSpeed;
                barrier.bottom.position.x -= this.gameSpeed;

                const pulse = Math.sin(this.pulseTime * 2) * 0.2;
                barrier.top.material.emissiveIntensity = 0.4 + pulse;
                barrier.bottom.material.emissiveIntensity = 0.4 + pulse;

                if (barrier.top.position.x < -15) {
                    const newX = 60;
                    const newGapY = -0.2 + Math.random() * 1.2;
                    const newGapSize = 4.0 + Math.random() * 0.8;

                    barrier.top.position.x = newX;
                    barrier.bottom.position.x = newX;
                    barrier.gapY = newGapY;
                    barrier.gapSize = newGapSize;

                    const topHeight = newGapY - newGapSize / 2 + 2;
                    const bottomHeight = newGapY + newGapSize / 2 - this.groundY;
                    barrier.top.position.y = newGapY + newGapSize / 2 + topHeight / 2;
                    barrier.bottom.position.y = this.groundY + bottomHeight / 2;

                    barrier.top.geometry.dispose();
                    barrier.bottom.geometry.dispose();
                    barrier.top.geometry = new THREE.BoxGeometry(0.6, topHeight, 1.5);
                    barrier.bottom.geometry = new THREE.BoxGeometry(0.6, bottomHeight, 1.5);
                }

                const distance = Math.abs(this.player.position.x - barrier.top.position.x);
                if (distance < 0.8) {
                    const playerRadius = 0.5;
                    if (this.player.position.y + playerRadius > barrier.gapY + barrier.gapSize / 2 ||
                        this.player.position.y - playerRadius < barrier.gapY - barrier.gapSize / 2) {
                        this.gameOver();
                    }
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

            const pulse = Math.sin(this.pulseTime * 3) * 0.3;
            portal.frame.material.emissiveIntensity = 0.8 + pulse;

            const distance = Math.abs(this.player.position.x - portal.position);
            if (distance < 1.2 && !portal.activated) {
                portal.activated = true;

                if (portal.targetMode === 'plane' && this.gameMode === 'cube') {
                    this.transformToPlane();
                } else if (portal.targetMode === 'cube' && this.gameMode === 'plane') {
                    this.transformToCube();
                }
            }

            if (portal.position < -15) {
                portal.position = 60;
                portal.frame.position.x = 60;
                portal.center.position.x = 60;
                portal.activated = false;
                portal.targetMode = portal.targetMode === 'plane' ? 'cube' : 'plane';
                portal.frame.material.color.setHex(portal.targetMode === 'plane' ? 0x00ffff : 0xff00ff);
                portal.frame.material.emissive.setHex(portal.targetMode === 'plane' ? 0x00ffff : 0xff00ff);
                portal.center.material.color.setHex(portal.targetMode === 'plane' ? 0x0088ff : 0xff0088);
                portal.center.material.emissive.setHex(portal.targetMode === 'plane' ? 0x0088ff : 0xff0088);
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
            particle.userData.velocity.y -= 0.01;
            particle.userData.life -= 0.02;
            particle.material.opacity = particle.userData.life;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    transformToPlane() {
        this.scene.remove(this.player);

        const planeGroup = new THREE.Group();

        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        planeGroup.add(body);

        const wingGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.4);
        const wingMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 0.3
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        planeGroup.add(wings);

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
        this.verticalVelocity = 0;

        this.spikes.forEach(spike => this.scene.remove(spike));
        this.spikes = [];
        this.platforms.forEach(platform => this.scene.remove(platform));
        this.platforms = [];

        for (let i = 0; i < 6; i++) {
            const xPos = 10 + i * 10;
            const gapY = -0.2 + Math.random() * 1.2;
            const gapSize = 4.0 + Math.random() * 0.8;
            this.createBarrier(xPos, gapY, gapSize);
        }

        for (let i = 0; i < 15; i++) {
            this.createParticle(this.player.position.x, this.player.position.y);
        }
    }

    transformToCube() {
        this.scene.remove(this.player);

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

        this.barriers.forEach(barrier => {
            this.scene.remove(barrier.top);
            this.scene.remove(barrier.bottom);
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
