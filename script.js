const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Audio context for heartbeat sound
let audioContext;
let soundEnabled = false;

// Modes
let currentMode = 'particles'; // particles, wireframe, 3d, galaxy
const modes = ['particles', 'wireframe', '3d', 'galaxy'];
let modeIndex = 0;

class Particle {
    constructor(x, y, targetX, targetY, color, depth = 0) {
        this.x = x;
        this.y = y;
        this.z = Math.random() * 200 - 100; // 3D depth
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetZ = depth;
        this.originalX = targetX;
        this.originalY = targetY;
        this.originalZ = depth;
        this.color = color;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = 0;
        this.fadeIn = true;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.trail = [];
        this.maxTrailLength = 5;
    }

    update(time, beatIntensity, rotation) {
        // Fade in effect
        if (this.fadeIn && this.opacity < 1) {
            this.opacity += 0.03;
            if (this.opacity >= 1) this.fadeIn = false;
        }

        // Pulse effect based on heartbeat
        const pulse = Math.sin(time * 0.005 + this.pulseOffset) * beatIntensity;
        const scale = 1 + pulse * 0.2;
        
        // Calculate position with pulse and 3D rotation
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Apply rotation
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        
        const dx = this.originalX - centerX;
        const dy = this.originalY - centerY;
        const dz = this.originalZ;
        
        // 3D rotation around Y axis
        const rotatedX = dx * cosR - dz * sinR;
        const rotatedZ = dx * sinR + dz * cosR;
        
        // Perspective projection
        const perspective = 300 / (300 + rotatedZ);
        
        this.targetX = centerX + rotatedX * scale * perspective;
        this.targetY = centerY + dy * scale * perspective;
        this.targetZ = rotatedZ;

        // Store trail
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Smooth movement to target
        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;
        this.z += (this.targetZ - this.z) * 0.15;

        // Add slight random movement
        this.x += Math.sin(time * 0.003 + this.pulseOffset) * 0.8;
        this.y += Math.cos(time * 0.003 + this.pulseOffset) * 0.8;
        
        this.angle += this.rotationSpeed;
    }

    draw(mode) {
        const perspective = 300 / (300 + this.z);
        const size = this.size * perspective;
        
        ctx.save();
        ctx.globalAlpha = this.opacity * (0.5 + perspective * 0.5);
        
        if (mode === 'particles' || mode === '3d') {
            // Draw trail
            this.trail.forEach((point, index) => {
                const trailOpacity = (index / this.trail.length) * this.opacity * 0.3;
                ctx.globalAlpha = trailOpacity;
                const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 2);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, this.color.replace('1)', '0)'));
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.globalAlpha = this.opacity * (0.5 + perspective * 0.5);
            
            // Glow effect
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 4);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.4, this.color.replace('1)', '0.6)'));
            gradient.addColorStop(1, this.color.replace('1)', '0)'));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Core particle with rotation
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillRect(-size, -size, size * 2, size * 2);
        } else if (mode === 'wireframe') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (mode === 'galaxy') {
            // Spiral galaxy effect
            const spiralAngle = this.angle * 3;
            const spiralRadius = size * 5;
            const sx = this.x + Math.cos(spiralAngle) * spiralRadius;
            const sy = this.y + Math.sin(spiralAngle) * spiralRadius;
            
            const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.color.replace('1)', '0)'));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sx, sy, size * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Create heart shape with 3D depth
function createHeartShape(centerX, centerY, scale, layers = 5) {
    const points = [];
    const resolution = 150;
    
    for (let layer = 0; layer < layers; layer++) {
        const depth = (layer - layers / 2) * 20;
        const layerScale = scale * (1 - Math.abs(layer - layers / 2) * 0.05);
        
        for (let i = 0; i < resolution; i++) {
            const t = (i / resolution) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            
            points.push({
                x: centerX + x * layerScale,
                y: centerY + y * layerScale,
                z: depth
            });
        }
    }
    
    return points;
}

// Fill heart with particles
function fillHeartWithParticles(points, density) {
    const particles = [];
    const colors = [
        'rgba(255, 20, 147, 1)',   // Deep pink
        'rgba(255, 105, 180, 1)',  // Hot pink
        'rgba(255, 182, 193, 1)',  // Light pink
        'rgba(255, 0, 127, 1)',    // Bright pink
        'rgba(255, 140, 180, 1)',  // Medium pink
        'rgba(138, 43, 226, 1)',   // Blue violet
        'rgba(255, 69, 0, 1)'      // Red-orange
    ];
    
    // Find bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    });
    
    // Fill with particles
    for (let x = minX; x < maxX; x += density) {
        for (let y = minY; y < maxY; y += density) {
            const nearestPoint = findNearestPoint(x, y, points);
            if (nearestPoint && distance2D(x, y, nearestPoint.x, nearestPoint.y) < density * 2) {
                const randomX = x + (Math.random() - 0.5) * density;
                const randomY = y + (Math.random() - 0.5) * density;
                const startX = canvas.width / 2 + (Math.random() - 0.5) * 200;
                const startY = canvas.height / 2 + (Math.random() - 0.5) * 200;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particles.push(new Particle(startX, startY, randomX, randomY, color, nearestPoint.z));
            }
        }
    }
    
    return particles;
}

function findNearestPoint(x, y, points) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const point of points) {
        const dist = distance2D(x, y, point.x, point.y);
        if (dist < minDist) {
            minDist = dist;
            nearest = point;
        }
    }
    
    return minDist < 50 ? nearest : null;
}

function distance2D(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Heartbeat sound
function playHeartbeat() {
    if (!soundEnabled || !audioContext) return;
    
    const now = audioContext.currentTime;
    
    // First beat
    createBeat(now);
    // Second beat
    createBeat(now + 0.15);
}

function createBeat(time) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(80, time);
    oscillator.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    oscillator.start(time);
    oscillator.stop(time + 0.1);
}

// Initialize
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const scale = 9;
const heartPoints = createHeartShape(centerX, centerY, scale, 8);
const particles = fillHeartWithParticles(heartPoints, 2.5);

let time = 0;
let beatPhase = 0;
let rotation = 0;
let lastBeatTime = 0;
const bpm = 72;
const beatInterval = (60 / bpm) * 1000;

function animate() {
    // Trail effect
    ctx.fillStyle = currentMode === 'galaxy' 
        ? 'rgba(10, 5, 30, 0.15)' 
        : 'rgba(10, 5, 30, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    time++;
    beatPhase += 0.075;
    rotation += 0.005;
    
    // Heartbeat pattern
    const beatCycle = Math.sin(beatPhase) * 0.5 + 0.5;
    const doubleBeat = Math.sin(beatPhase * 2.2) * 0.35 + 0.65;
    const beatIntensity = beatCycle * doubleBeat;
    
    // Play sound on beat
    const currentTime = Date.now();
    if (beatIntensity > 0.95 && currentTime - lastBeatTime > beatInterval * 0.8) {
        playHeartbeat();
        lastBeatTime = currentTime;
    }
    
    // Sort particles by depth for proper 3D rendering
    particles.sort((a, b) => b.z - a.z);
    
    particles.forEach(particle => {
        particle.update(time, beatIntensity, rotation);
        particle.draw(currentMode);
    });
    
    // Draw connections in wireframe mode
    if (currentMode === 'wireframe') {
        drawConnections();
    }
    
    requestAnimationFrame(animate);
}

function drawConnections() {
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.1)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i += 5) {
        for (let j = i + 1; j < Math.min(i + 10, particles.length); j += 5) {
            const dist = distance2D(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            if (dist < 50) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Explosion effect
function createExplosion() {
    particles.forEach(particle => {
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 100 + 50;
        particle.x += Math.cos(angle) * force;
        particle.y += Math.sin(angle) * force;
        particle.z += (Math.random() - 0.5) * 100;
    });
}

// Wave effect
function createWave() {
    const waveTime = Date.now();
    particles.forEach((particle, index) => {
        setTimeout(() => {
            particle.y -= 50;
            setTimeout(() => {
                particle.y += 50;
            }, 200);
        }, index * 2);
    });
}

animate();

// Event listeners
document.getElementById('modeBtn').addEventListener('click', () => {
    modeIndex = (modeIndex + 1) % modes.length;
    currentMode = modes[modeIndex];
    const modeNames = {
        'particles': '✨ Particles',
        'wireframe': '🔷 Wireframe',
        '3d': '🎭 3D Depth',
        'galaxy': '🌌 Galaxy'
    };
    document.getElementById('modeBtn').textContent = `🎨 ${modeNames[currentMode]}`;
});

document.getElementById('explosionBtn').addEventListener('click', createExplosion);
document.getElementById('waveBtn').addEventListener('click', createWave);

document.getElementById('soundBtn').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled && !audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.getElementById('soundBtn').textContent = soundEnabled ? '🔊 Âm thanh: ON' : '🔇 Âm thanh: OFF';
});

// Mouse interaction
let mouseX = 0, mouseY = 0;
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    particles.forEach(particle => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 100;
            particle.x += Math.cos(angle) * force * 3;
            particle.y += Math.sin(angle) * force * 3;
        }
    });
});

canvas.addEventListener('click', (e) => {
    // Create ripple effect
    const ripples = 3;
    for (let r = 0; r < ripples; r++) {
        setTimeout(() => {
            particles.forEach(particle => {
                const dx = particle.x - e.clientX;
                const dy = particle.y - e.clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    const angle = Math.atan2(dy, dx);
                    const force = (200 - distance) / 200;
                    particle.x += Math.cos(angle) * force * 30;
                    particle.y += Math.sin(angle) * force * 30;
                }
            });
        }, r * 100);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const newCenterX = canvas.width / 2;
    const newCenterY = canvas.height / 2;
    const newHeartPoints = createHeartShape(newCenterX, newCenterY, scale, 8);
    
    particles.forEach((particle, index) => {
        if (index < newHeartPoints.length) {
            const point = newHeartPoints[index % newHeartPoints.length];
            particle.originalX = point.x;
            particle.originalY = point.y;
            particle.originalZ = point.z;
        }
    });
});
