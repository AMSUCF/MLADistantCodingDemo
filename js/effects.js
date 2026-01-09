/**
 * Effects Module - Sparkle cursor, falling stars, and other 90s effects
 */

const Effects = {
    // Settings
    sparkleEnabled: true,
    starsEnabled: true,
    sparkleChance: 0.15, // Chance of sparkle on mouse move
    starInterval: 2000, // ms between falling stars

    // Sparkle characters
    sparkleChars: ['✦', '✧', '★', '☆', '✴', '✵', '❋', '❊', '✺', '✹'],

    // Sparkle colors
    sparkleColors: ['#FF1493', '#00FFFF', '#FFFF00', '#32CD32', '#FF8800', '#9400D3'],

    /**
     * Initialize all effects
     */
    init() {
        this.initSparkles();
        this.initFallingStars();
        console.log('~*~ Effects Initialized ~*~');
    },

    /**
     * Initialize sparkle cursor effect
     */
    initSparkles() {
        document.addEventListener('mousemove', (e) => {
            if (!this.sparkleEnabled) return;
            if (Math.random() < this.sparkleChance) {
                this.createSparkle(e.clientX, e.clientY);
            }
        });

        // Also create sparkles on click
        document.addEventListener('click', (e) => {
            if (!this.sparkleEnabled) return;
            // Create burst of sparkles on click
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const offsetX = (Math.random() - 0.5) * 40;
                    const offsetY = (Math.random() - 0.5) * 40;
                    this.createSparkle(e.clientX + offsetX, e.clientY + offsetY);
                }, i * 50);
            }
        });
    },

    /**
     * Create a sparkle element at position
     */
    createSparkle(x, y) {
        const container = document.getElementById('sparkle-container');
        if (!container) return;

        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle-element';
        sparkle.textContent = this.sparkleChars[Math.floor(Math.random() * this.sparkleChars.length)];
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.color = this.sparkleColors[Math.floor(Math.random() * this.sparkleColors.length)];
        sparkle.style.fontSize = (Math.random() * 15 + 10) + 'px';

        // Add slight random offset
        sparkle.style.marginLeft = (Math.random() - 0.5) * 20 + 'px';
        sparkle.style.marginTop = (Math.random() - 0.5) * 20 + 'px';

        container.appendChild(sparkle);

        // Remove sparkle after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    },

    /**
     * Initialize falling stars effect
     */
    initFallingStars() {
        // Create initial stars
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createFallingStar(), i * 500);
        }

        // Continue creating stars periodically
        setInterval(() => {
            if (this.starsEnabled && Math.random() < 0.5) {
                this.createFallingStar();
            }
        }, this.starInterval);
    },

    /**
     * Create a falling star
     */
    createFallingStar() {
        const container = document.getElementById('sparkle-container');
        if (!container) return;

        const star = document.createElement('span');
        star.className = 'falling-star';
        star.textContent = '★';

        // Random horizontal position
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = '-20px';

        // Random size
        const size = Math.random() * 10 + 12;
        star.style.fontSize = size + 'px';

        // Random color
        const colors = ['#FFFF00', '#FF8800', '#FF1493', '#00FFFF', '#FFFFFF'];
        star.style.color = colors[Math.floor(Math.random() * colors.length)];

        // Random animation duration
        const duration = Math.random() * 2 + 2;
        star.style.animationDuration = duration + 's';

        container.appendChild(star);

        // Remove after animation
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, duration * 1000);
    },

    /**
     * Toggle sparkle effect
     */
    toggleSparkles() {
        this.sparkleEnabled = !this.sparkleEnabled;
        return this.sparkleEnabled;
    },

    /**
     * Toggle falling stars
     */
    toggleStars() {
        this.starsEnabled = !this.starsEnabled;
        return this.starsEnabled;
    },

    /**
     * Create explosion of sparkles (for special events)
     */
    sparkleExplosion(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / count;
                const distance = Math.random() * 50 + 20;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                this.createSparkle(x + offsetX, y + offsetY);
            }, i * 30);
        }
    },

    /**
     * Create trail of sparkles along a path
     */
    sparkleTrail(startX, startY, endX, endY, count = 10) {
        for (let i = 0; i <= count; i++) {
            setTimeout(() => {
                const progress = i / count;
                const x = startX + (endX - startX) * progress;
                const y = startY + (endY - startY) * progress;
                this.createSparkle(x, y);
            }, i * 50);
        }
    }
};

// Add some fun console Easter eggs
console.log('%c★彡 Welcome to my awesome homepage! 彡★',
    'font-size: 20px; color: #FF1493; text-shadow: 2px 2px #00FFFF;');
console.log('%cMade with ♥ and way too much HTML',
    'font-size: 14px; color: #00FFFF;');
console.log('%cBest viewed in Netscape Navigator 4.0!',
    'font-size: 12px; color: #32CD32;');
