class SkyFighter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'start'; // start, playing, gameOver
        this.sprites = {};
        this.gameObjects = [];
        this.particles = [];
        this.keys = {};
        this.touches = {};
        
        // Configuración del juego
        this.config = {
            playerSpeed: 5,
            bulletSpeed: 10,
            enemySpeed: 1.5, // Más lento para objetos más grandes
            spawnRate: 120, // Menos spawns con objetos más grandes
            fireRate: 10, // frames entre disparos
            canvasWidth: 400,
            canvasHeight: 600
        };
        
        // Player
        this.player = {
            x: this.config.canvasWidth / 2 - 75,
            y: this.config.canvasHeight - 140,
            width: 150,
            height: 150,
            speed: this.config.playerSpeed,
            fireCooldown: 0,
            lives: 3,
            invulnerable: false,
            invulnerableTimer: 0
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSprites();
        this.setupEventListeners();
        this.resizeCanvas();
        this.showScreen('start');
        this.gameLoop();
    }
    
    async loadSprites() {
        // Cargar imágenes de los aviones
        try {
            this.sprites.player = await this.loadImage('1.png');
            console.log('Avión principal cargado:', this.sprites.player.width, 'x', this.sprites.player.height);
            
            this.sprites.enemy1 = await this.loadImage('2.png');
            console.log('Enemigo 1 cargado:', this.sprites.enemy1.width, 'x', this.sprites.enemy1.height);
            
            this.sprites.enemy2 = await this.loadImage('3.png');
            console.log('Enemigo 2 cargado:', this.sprites.enemy2.width, 'x', this.sprites.enemy2.height);
            
            console.log('✅ Todos los sprites cargados exitosamente');
        } catch (error) {
            console.error('❌ Error cargando sprites:', error);
        }
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    setupEventListeners() {
        // Botones de menú
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('start');
        });
        
        // Botón de debug
        document.getElementById('debug-btn').addEventListener('click', () => {
            this.toggleDebug();
        });
        
        // Botón de test de transparencia
        document.getElementById('test-transparency').addEventListener('click', () => {
            this.testTransparency();
        });
        
        // Controles táctiles
        const moveControl = document.getElementById('move-control');
        const fireBtn = document.getElementById('fire-btn');
        
        // Controles de movimiento
        moveControl.addEventListener('touchstart', (e) => this.handleTouchStart(e, 'move'));
        moveControl.addEventListener('touchmove', (e) => this.handleTouchMove(e, 'move'));
        moveControl.addEventListener('touchend', (e) => this.handleTouchEnd(e, 'move'));
        
        // Botón de disparo
        fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.fire();
        });
        
        fireBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.fire();
        });
        
        // Prevenir comportamientos por defecto
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.touch-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Redimensionar canvas
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    handleTouchStart(e, type) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        if (type === 'move') {
            this.touches.moveX = touch.clientX - rect.left;
            this.touches.moveY = touch.clientY - rect.top;
        }
    }
    
    handleTouchMove(e, type) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        if (type === 'move') {
            this.touches.moveX = touch.clientX - rect.left;
            this.touches.moveY = touch.clientY - rect.top;
        }
    }
    
    handleTouchEnd(e, type) {
        e.preventDefault();
        if (type === 'move') {
            this.touches.moveX = null;
            this.touches.moveY = null;
        }
    }
    
    resizeCanvas() {
        const container = document.querySelector('.game-area');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Mantener aspecto 2:3 (400x600)
        let canvasWidth = Math.min(containerWidth * 0.95, 400);
        let canvasHeight = canvasWidth * 1.5;
        
        if (canvasHeight > containerHeight * 0.9) {
            canvasHeight = containerHeight * 0.9;
            canvasWidth = canvasHeight / 1.5;
        }
        
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Configurar canvas para transparencia - VERSIÓN MEJORADA
        this.canvas.width = this.config.canvasWidth;
        this.canvas.height = this.config.canvasHeight;
        
        // Configurar contexto con configuración óptima para transparencia
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    showScreen(screenName) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar pantalla específica
        const screen = document.getElementById(screenName + '-screen');
        if (screen) {
            screen.classList.add('active');
        }
        
        this.gameState = screenName;
    }
    
    startGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameObjects = [];
        this.particles = [];
        
        // Resetear jugador - CORREGIDO para avión grande 150x150
        this.player.x = this.config.canvasWidth / 2 - 75;  // Centrado para 150px de ancho
        this.player.y = this.config.canvasHeight - 140;    // Posición inferior para 150px de alto
        this.player.width = 150;                           // Tamaño grande
        this.player.height = 150;                          // Tamaño grande
        this.player.lives = 3;
        this.player.fireCooldown = 0;
        this.player.invulnerable = false;
        
        this.updateHUD();
        this.showScreen('game');
        this.gameState = 'playing';
    }
    
    restartGame() {
        this.startGame();
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    fire() {
        if (this.player.fireCooldown <= 0 && this.gameState === 'playing') {
            this.gameObjects.push({
                type: 'bullet',
                x: this.player.x + this.player.width / 2 - 5,
                y: this.player.y,
                width: 10,
                height: 25,
                speed: this.config.bulletSpeed,
                color: '#FFD700'
            });
            
            // Efecto de disparo
            this.createParticle(this.player.x + this.player.width / 2, this.player.y, 'muzzle');
            
            this.player.fireCooldown = this.config.fireRate;
        }
    }
    
    spawnEnemy() {
        const enemyType = Math.random() > 0.5 ? 'enemy1' : 'enemy2';
        const x = Math.random() * (this.config.canvasWidth - 150);
        const y = -150;
        
        this.gameObjects.push({
            type: enemyType,
            x: x,
            y: y,
            width: 150,
            height: 150,
            speed: this.config.enemySpeed + (this.level - 1) * 0.5,
            health: enemyType === 'enemy1' ? 2 : 1,
            points: enemyType === 'enemy1' ? 200 : 100
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Actualizar debug info si está activo
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo && debugInfo.style.display !== 'none') {
            this.updateDebugInfo();
        }
        
        // Actualizar cooldown del jugador
        if (this.player.fireCooldown > 0) {
            this.player.fireCooldown--;
        }
        
        // Actualizar invulnerabilidad
        if (this.player.invulnerable) {
            this.player.invulnerableTimer--;
            if (this.player.invulnerableTimer <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Mover jugador basado en toque
        if (this.touches.moveX !== null && this.touches.moveY !== null) {
            const targetX = this.touches.moveX - this.player.width / 2;
            const targetY = this.touches.moveY - this.player.height / 2;
            
            // Movimiento suave hacia el objetivo
            this.player.x += (targetX - this.player.x) * 0.3;
            this.player.y += (targetY - this.player.y) * 0.3;
            
            // Limitar a los bordes
            this.player.x = Math.max(0, Math.min(this.config.canvasWidth - this.player.width, this.player.x));
            this.player.y = Math.max(0, Math.min(this.config.canvasHeight - this.player.height, this.player.y));
        }
        
        // Actualizar objetos del juego
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            
            // Mover objetos
            if (obj.type === 'bullet') {
                obj.y -= obj.speed;
                if (obj.y + obj.height < 0) {
                    this.gameObjects.splice(i, 1);
                }
            } else if (obj.type.startsWith('enemy')) {
                obj.y += obj.speed;
                if (obj.y > this.config.canvasHeight) {
                    this.gameObjects.splice(i, 1);
                }
            }
        }
        
        // Spawn enemigos
        if (Math.random() < 0.02 + (this.level - 1) * 0.01) {
            this.spawnEnemy();
        }
        
        // Detectar colisiones
        this.checkCollisions();
        
        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Subir de nivel
        if (this.score > 0 && this.score % 1000 === 0 && this.score !== this.lastLevelScore) {
            this.level++;
            this.lastLevelScore = this.score;
            this.updateHUD();
        }
    }
    
    checkCollisions() {
        // Balas vs enemigos
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            
            if (obj.type === 'bullet') {
                for (let j = this.gameObjects.length - 1; j >= 0; j--) {
                    const enemy = this.gameObjects[j];
                    
                    if (enemy.type.startsWith('enemy') && this.isColliding(obj, enemy)) {
                        // Hit!
                        this.gameObjects.splice(i, 1);
                        enemy.health--;
                        
                        // Efecto de impacto
                        this.createParticle(obj.x + obj.width/2, obj.y, 'hit');
                        
                        if (enemy.health <= 0) {
                            // Enemigo destruido
                            this.score += enemy.points;
                            this.updateHUD();
                            
                            // Explosión
                            this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                            
                            this.gameObjects.splice(j, 1);
                        }
                        break;
                    }
                }
            }
        }
        
        // Jugador vs enemigos
        if (!this.player.invulnerable) {
            for (let i = this.gameObjects.length - 1; i >= 0; i--) {
                const enemy = this.gameObjects[i];
                
                if (enemy.type.startsWith('enemy') && this.isColliding(this.player, enemy)) {
                    // Jugador hit!
                    this.lives--;
                    this.updateHUD();
                    
                    // Explosión en jugador
                    this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    
                    // Invulnerabilidad temporal
                    this.player.invulnerable = true;
                    this.player.invulnerableTimer = 120; // 2 segundos a 60fps
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                    break;
                }
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createParticle(x, y, type) {
        const colors = {
            muzzle: ['#FFD700', '#FFA500'],
            hit: ['#FF6B6B', '#FFA500'],
            explosion: ['#FF6B6B', '#FFA500', '#FFD700', '#FF0000']
        };
        
        const particleCount = type === 'explosion' ? 15 : 5;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                life: Math.random() * 30 + 15,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    createExplosion(x, y) {
        this.createParticle(x, y, 'explosion');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        
        this.showScreen('game-over');
    }
    
    render() {
        // Limpiar canvas con método optimizado
        this.clearCanvas();
        
        if (this.gameState !== 'playing') return;
        
        // Fondo con nubes
        this.renderBackground();
        
        // Renderizar jugador
        this.renderPlayer();
        
        // Renderizar objetos del juego
        this.gameObjects.forEach(obj => {
            if (obj.type === 'bullet') {
                this.renderBullet(obj);
            } else if (obj.type.startsWith('enemy')) {
                this.renderEnemy(obj);
            }
        });
        
        // Renderizar partículas
        this.renderParticles();
    }
    
    renderBackground() {
        // Crear efecto de nubes en movimiento
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 5; i++) {
            const x = (i * 80 + time * 20) % (this.config.canvasWidth + 100) - 50;
            const y = (i * 120 + time * 30) % (this.config.canvasHeight + 50) - 25;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 30, 15, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderPlayer() {
        this.ctx.save();
        
        // CONFIGURACIÓN OPTIMIZADA PARA TRANSPARENCIA
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Efecto de invulnerabilidad (parpadeo)
        if (this.player.invulnerable && Math.floor(this.player.invulnerableTimer / 10) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Dibujar sprite del jugador con configuración mejorada
        if (this.sprites.player) {
            try {
                this.ctx.drawImage(
                    this.sprites.player,
                    0, 0, this.sprites.player.width, this.sprites.player.height,
                    this.player.x, this.player.y, 
                    this.player.width, this.player.height
                );
                console.log('✅ Player sprite renderizado correctamente');
            } catch (error) {
                console.error('❌ Error renderizando player sprite:', error);
                // Fallback: rectángulo
                this.ctx.fillStyle = '#00FF00';
                this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            }
        } else {
            // Fallback: rectángulo
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
        
        this.ctx.restore();
    }
    
    renderEnemy(enemy) {
        this.ctx.save();
        
        // CONFIGURACIÓN OPTIMIZADA PARA TRANSPARENCIA
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        const sprite = this.sprites[enemy.type];
        if (sprite) {
            try {
                this.ctx.drawImage(
                    sprite,
                    0, 0, sprite.width, sprite.height,
                    enemy.x, enemy.y, 
                    enemy.width, enemy.height
                );
                console.log(`✅ ${enemy.type} sprite renderizado correctamente`);
            } catch (error) {
                console.error(`❌ Error renderizando ${enemy.type} sprite:`, error);
                // Fallback: rectángulo con color
                this.ctx.fillStyle = enemy.type === 'enemy1' ? '#FF0000' : '#0000FF';
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        } else {
            // Fallback: rectángulo con color
            this.ctx.fillStyle = enemy.type === 'enemy1' ? '#FF0000' : '#0000FF';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        
        this.ctx.restore();
    }
    
    renderBullet(bullet) {
        this.ctx.save();
        
        // Efecto de brillo para las balas
        const gradient = this.ctx.createRadialGradient(
            bullet.x + bullet.width/2, bullet.y + bullet.height/2, 0,
            bullet.x + bullet.width/2, bullet.y + bullet.height/2, 10
        );
        gradient.addColorStop(0, bullet.color);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(bullet.x - 3, bullet.y - 3, bullet.width + 6, bullet.height + 6);
        
        // Bala principal
        this.ctx.fillStyle = bullet.color;
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        this.ctx.restore();
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            this.ctx.globalAlpha = particle.life / 45;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    // Función para alternar debug
    toggleDebug() {
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo.style.display === 'none') {
            debugInfo.style.display = 'block';
            this.updateDebugInfo();
        } else {
            debugInfo.style.display = 'none';
        }
    }
    
    // Función para actualizar información de debug
    updateDebugInfo() {
        const statusDiv = document.getElementById('image-status');
        const playerLoaded = this.sprites.player ? '✅ Cargado' : '❌ No cargado';
        const enemy1Loaded = this.sprites.enemy1 ? '✅ Cargado' : '❌ No cargado';
        const enemy2Loaded = this.sprites.enemy2 ? '✅ Cargado' : '❌ No cargado';
        
        statusDiv.innerHTML = `
            <div>Avión Principal: ${playerLoaded}</div>
            <div>Enemigo 1: ${enemy1Loaded}</div>
            <div>Enemigo 2: ${enemy2Loaded}</div>
            <div>Canvas: ${this.canvas.width}x${this.canvas.height}</div>
            <div>Game State: ${this.gameState}</div>
        `;
    }
    
    // Función para probar transparencia
    clearCanvas() {
        // Limpiar canvas con configuración optimizada
        this.ctx.save();
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    testTransparency() {
        console.log('🧪 Iniciando test de transparencia mejorado...');
        
        // Limpiar y configurar canvas de prueba
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 300;
        testCanvas.height = 300;
        testCanvas.style.border = '2px solid red';
        testCanvas.style.margin = '10px';
        testCanvas.style.backgroundColor = 'black';
        
        const testCtx = testCanvas.getContext('2d');
        
        // Configurar contexto de prueba
        testCtx.imageSmoothingEnabled = true;
        testCtx.imageSmoothingQuality = 'high';
        testCtx.globalAlpha = 1;
        testCtx.globalCompositeOperation = 'source-over';
        
        // Fondo con patrón de cuadros alternados
        const colors = ['#ff0000', '#ffffff'];
        for (let i = 0; i < 300; i += 25) {
            for (let j = 0; j < 300; j += 25) {
                const colorIndex = (Math.floor(i/25) + Math.floor(j/25)) % 2;
                testCtx.fillStyle = colors[colorIndex];
                testCtx.fillRect(i, j, 25, 25);
            }
        }
        
        // Información de depuración
        const info = document.createElement('div');
        info.style.cssText = 'padding: 10px; background: #f0f0f0; margin: 5px; border: 1px solid #ccc;';
        info.innerHTML = `
            <strong>Test de Transparencia</strong><br>
            Canvas: ${testCanvas.width}x${testCanvas.height}<br>
            Player Sprite: ${this.sprites.player ? '✅ Cargado' : '❌ No cargado'}<br>
            ImageSmoothing: ${testCtx.imageSmoothingEnabled}<br>
            GlobalCompositeOperation: ${testCtx.globalCompositeOperation}<br>
            GlobalAlpha: ${testCtx.globalAlpha}
        `;
        
        // Dibujar sprite si está disponible
        if (this.sprites.player) {
            try {
                // Usar método optimizado de dibujo
                testCtx.drawImage(
                    this.sprites.player,
                    0, 0, this.sprites.player.width, this.sprites.player.height,
                    100, 100, 100, 100
                );
                info.innerHTML += '<br>✅ Sprite dibujado correctamente';
                console.log('✅ Sprite dibujado en canvas de prueba');
            } catch (error) {
                info.innerHTML += `<br>❌ Error: ${error.message}`;
                console.error('❌ Error renderizando sprite:', error);
            }
        } else {
            info.innerHTML += '<br>❌ Sprite no disponible para test';
            console.log('❌ Sprite no disponible para test');
        }
        
        // Mostrar en debug
        const debugInfo = document.getElementById('debug-info');
        debugInfo.appendChild(info);
        debugInfo.appendChild(testCanvas);
        
        console.log('✅ Test de transparencia completado');
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new SkyFighter();
});

// Prevenir zoom en dispositivos móviles
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});