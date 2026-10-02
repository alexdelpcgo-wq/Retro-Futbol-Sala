/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MOTOR DE FÍSICA 2D+Z Y DIMENSIONES DE CANCHA
 * ============================================================================
 * Maneja el espacio físico del estadio de futsal, el movimiento del balón
 * en los ejes X, Y y Z (altura vertical con gravedad), fricción sobre duela
 * de parqué pulido, y rebotes en postes y redes de portería.
 */

/**
 * Dimensiones oficiales ampliadas de la cancha 64-Bit (1050 x 620 px).
 * Proporciona un espacio significativamente más grande para juego fluido,
 * pases filtrados, repliegues defensivos y combinaciones de ataque.
 */
export const COURT = {
    width: 1050,                 // Ancho total del canvas
    height: 620,                 // Alto total del canvas
    minX: 65,                    // Límite de banda izquierda (Línea de fondo local)
    maxX: 985,                   // Límite de banda derecha (Línea de fondo visitante)
    minY: 50,                    // Límite de banda superior
    maxY: 570,                   // Límite de banda inferior
    goalTop: 245,                // Poste superior de la portería
    goalBottom: 375,             // Poste inferior de la portería (luz de 130px)
    goalDepth: 45,               // Profundidad de la red hacia afuera
    centerCircleRadius: 90,      // Radio del círculo central
    penaltyAreaRadius: 110,      // Radio de las áreas de 6 metros
    penaltySpotX1: 175,          // Punto de penal izquierdo (6m)
    penaltySpotX2: 875,          // Punto de penal derecho (6m)
    doublePenaltySpotX1: 250,    // Punto de doble penal izquierdo (10m)
    doublePenaltySpotX2: 800     // Punto de doble penal derecho (10m)
};

/**
 * Clase que representa el balón de futsal con física 3D simulada (X, Y, Z).
 */
export class Ball {
    /**
     * Constructor del balón.
     * @param {number} x - Posición X inicial (por defecto centro de cancha).
     * @param {number} y - Posición Y inicial (por defecto centro de cancha).
     */
    constructor(x = COURT.width / 2, y = COURT.height / 2) {
        this.x = x;
        this.y = y;
        this.z = 0;              // Altura sobre el suelo (0 = en parqué, >0 = en el aire)
        this.vx = 0;             // Velocidad horizontal
        this.vy = 0;             // Velocidad vertical
        this.vz = 0;             // Velocidad de elevación (hacia arriba/abajo)
        this.radius = 7;         // Radio visual del balón 64-bit
        this.friction = 0.984;   // Coeficiente de fricción sobre parqué pulido
        this.gravity = 0.36;     // Aceleración de la gravedad hacia el suelo
        this.bounce = 0.42;      // Coeficiente de rebote reducido (balón de fútbol sala)
        this.owner = null;       // Jugador que tiene actualmente la posesión del balón
        this.lastKickedBy = null;// Último jugador en golpear el balón
        this.trail = [];         // Estela de partículas luminosas para tiros potentes
    }

    /**
     * Reinicia la posición y velocidades del balón (ej. saque de centro o reinicio).
     * @param {number} x - Posición X de destino.
     * @param {number} y - Posición Y de destino.
     */
    reset(x = COURT.width / 2, y = COURT.height / 2) {
        this.x = x;
        this.y = y;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.owner = null;
        this.trail = [];
    }

    /**
     * Aplica una fuerza de golpeo o pase al balón.
     * @param {number} vx - Impulso horizontal X.
     * @param {number} vy - Impulso vertical Y.
     * @param {number} [vz=0] - Impulso de elevación Z.
     * @param {Object} [player=null] - Jugador que ejecuta el golpeo.
     */
    kick(vx, vy, vz = 0, player = null) {
        this.owner = null;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.lastKickedBy = player;
    }

    /**
     * Actualiza la posición del balón, aplica gravedad, rebotes y fricción en cada frame.
     */
    update() {
        // Generar estela visual luminosa si la velocidad es alta (tiro potente)
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > 4.8) {
            this.trail.push({ x: this.x, y: this.y - this.z, alpha: 0.85, speed: speed });
            if (this.trail.length > 7) this.trail.shift();
        } else {
            this.trail = [];
        }

        // Atenuar la estela progresivamente
        this.trail.forEach(t => t.alpha *= 0.80);

        // Si un jugador conduce el balón, el balón sigue la posición de sus pies
        if (this.owner) {
            const offsetDist = 11;
            this.x = this.owner.x + Math.cos(this.owner.facingAngle) * offsetDist;
            this.y = this.owner.y + Math.sin(this.owner.facingAngle) * offsetDist;
            this.z = 0;
            this.vx = this.owner.vx;
            this.vy = this.owner.vy;
            this.vz = 0;
            return;
        }

        // Aplicar velocidades a la posición
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Aplicar fricción de suelo y resistencia al aire
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Física gravitacional en el eje Z (elevación del balón)
        if (this.z > 0 || this.vz !== 0) {
            this.vz -= this.gravity;
            if (this.z <= 0) {
                this.z = 0;
                // Si la velocidad de caída es notable, realiza un rebote amortiguado
                if (Math.abs(this.vz) > 0.75) {
                    this.vz = -this.vz * this.bounce;
                    this.vx *= 0.86;
                    this.vy *= 0.86;
                } else {
                    this.vz = 0;
                }
            }
        }

        // Frenar micro-movimientos residuales
        if (Math.hypot(this.vx, this.vy) < 0.04) {
            this.vx = 0;
            this.vy = 0;
        }
    }

    /**
     * Verifica colisiones del balón contra los 4 postes de las porterías y redes.
     * @param {Function} onPostHit - Callback al chocar contra un poste metálico.
     */
    checkCollisions(onPostHit) {
        // Coordenadas de los 4 postes (2 en cada portería)
        const posts = [
            { x: COURT.minX, y: COURT.goalTop },
            { x: COURT.minX, y: COURT.goalBottom },
            { x: COURT.maxX, y: COURT.goalTop },
            { x: COURT.maxX, y: COURT.goalBottom }
        ];

        posts.forEach(post => {
            const dx = this.x - post.x;
            const dy = this.y - post.y;
            const dist = Math.hypot(dx, dy);
            if (dist < this.radius + 6) {
                const angle = Math.atan2(dy, dx);
                const currentSpeed = Math.hypot(this.vx, this.vy);
                this.vx = Math.cos(angle) * (currentSpeed * 0.88 + 2.2);
                this.vy = Math.sin(angle) * (currentSpeed * 0.88 + 2.2);
                if (onPostHit) onPostHit();
            }
        });

        // Contención del balón dentro de la red tras un gol
        if (this.x < COURT.minX - 5 && this.y >= COURT.goalTop && this.y <= COURT.goalBottom) {
            if (this.x < COURT.minX - COURT.goalDepth) {
                this.x = COURT.minX - COURT.goalDepth;
                this.vx = -this.vx * 0.20;
            }
        }
        if (this.x > COURT.maxX + 5 && this.y >= COURT.goalTop && this.y <= COURT.goalBottom) {
            if (this.x > COURT.maxX + COURT.goalDepth) {
                this.x = COURT.maxX + COURT.goalDepth;
                this.vx = -this.vx * 0.20;
            }
        }
    }
}
