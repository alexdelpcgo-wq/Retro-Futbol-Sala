/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MOTOR ARBITRAL, FALTAS Y TARJETAS OFICIALES
 * ============================================================================
 * Maneja las reglas oficiales de fútbol sala:
 * - Detección de faltas en barridas por detrás o a destiempo
 * - Tarjetas amarillas acumulativas y expulsión por doble amarilla
 * - Tarjeta roja directa por agresión violenta
 * - Faltas acumuladas por tiempo (a partir de la 6ª falta: Doble Penal de 10m sin barrera)
 * - Penales de 6m dentro del área
 */

import { COURT } from './physics.js';
import { sound } from './audio.js';

export class Referee {
    /**
     * Constructor del árbitro.
     */
    constructor() {
        this.x = COURT.width / 2;
        this.y = COURT.minY + 20;
        this.vx = 0;
        this.vy = 0;
        this.facingAngle = Math.PI / 2;
        this.state = 'idle'; // 'idle', 'running', 'whistling', 'showing_yellow', 'showing_red'
        this.stateTimer = 0;
        this.currentNotification = null;

        // Faltas acumuladas de fútbol sala por cada tiempo
        this.accumulatedFouls = {
            team1: 0,
            team2: 0
        };

        // Registro de amonestaciones
        this.yellowCards = new Map(); // ID jugador -> cantidad
        this.redCards = new Set();    // IDs de expulsados
    }

    /**
     * Reinicia el conteo de faltas acumuladas para el nuevo tiempo.
     */
    resetHalf() {
        this.accumulatedFouls.team1 = 0;
        this.accumulatedFouls.team2 = 0;
    }

    /**
     * Reinicia las tarjetas y faltas para un nuevo partido completo.
     */
    resetMatch() {
        this.resetHalf();
        this.yellowCards.clear();
        this.redCards.clear();
        this.currentNotification = null;
    }

    /**
     * Actualiza el desplazamiento del árbitro por la banda acompañando la jugada.
     * @param {number} ballX - Posición X del balón.
     * @param {number} ballY - Posición Y del balón.
     */
    update(ballX, ballY) {
        const targetX = Math.min(COURT.maxX - 70, Math.max(COURT.minX + 70, ballX + 40));
        const targetY = ballY < COURT.height / 2 ? COURT.minY + 25 : COURT.maxY - 25;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 15 && this.state !== 'showing_yellow' && this.state !== 'showing_red') {
            this.vx = (dx / dist) * Math.min(2.6, dist * 0.05);
            this.vy = (dy / dist) * Math.min(2.6, dist * 0.05);
            this.facingAngle = Math.atan2(ballY - this.y, ballX - this.x);
            this.state = 'running';
        } else {
            this.vx *= 0.8;
            this.vy *= 0.8;
            if (this.state === 'running') this.state = 'idle';
        }

        this.x += this.vx;
        this.y += this.vy;

        // Temporizador de animación de tarjeta en mano
        if (this.stateTimer > 0) {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'idle';
            }
        }

        // Temporizador de notificación en pantalla
        if (this.currentNotification) {
            this.currentNotification.timer--;
            if (this.currentNotification.timer <= 0) {
                this.currentNotification = null;
            }
        }
    }

    /**
     * Evalúa si una barrida defensiva constituye falta reglamentaria y determina la sanción.
     * 
     * @param {Object} tackler - Jugador que efectúa la barrida.
     * @param {Object} victim - Jugador que sufre la entrada.
     * @param {Object} match - Motor del partido.
     * @returns {Object|null} Objeto con la información de la falta pitada o null si fue limpia.
     */
    processTackleFoul(tackler, victim, match) {
        if (this.redCards.has(tackler.id)) return null;

        // Calcular severidad según el ángulo de entrada (por detrás = mayor probabilidad de tarjeta)
        const angleDiff = Math.abs(tackler.facingAngle - victim.facingAngle);
        const fromBehind = angleDiff < Math.PI / 2.8;

        const dribbleStat = victim.card.stats.reg;
        const tackleDefenseStat = tackler.card.stats.def;

        // Probabilidad de falta según diferencia de estadísticas
        let foulChance = 0.32 + (fromBehind ? 0.35 : 0) + ((dribbleStat - tackleDefenseStat) * 0.005);
        foulChance = Math.max(0.10, Math.min(0.85, foulChance));

        if (Math.random() > foulChance) {
            return null; // ¡Entrada limpia al balón!
        }

        // Se pita falta reglamentaria
        const foulingTeamKey = tackler.team === 1 ? 'team1' : 'team2';
        const defendingTeamNum = tackler.team;
        this.accumulatedFouls[foulingTeamKey]++;

        const isAccumulatedOverLimit = this.accumulatedFouls[foulingTeamKey] >= 6;
        // REGLAMENTO LIMPIO: SIN TARJETAS NI EXPULSIONES
        tackler.isExpelled = false;
        let cardIssued = null;
        this.state = 'whistling';
        this.stateTimer = 60;
        this.showNotification(`📢 ¡FALTA de ${tackler.card.name}!`, 'foul', 120);

        // Determinar tipo de reanudación (Penal de 6m, Doble Penal de 10m o Tiro Libre)
        let setPieceType = 'direct_free_kick';
        const isInsidePenaltyArea = defendingTeamNum === 1
            ? (victim.x < COURT.penaltySpotX1 + 10)
            : (victim.x > COURT.penaltySpotX2 - 10);

        if (isInsidePenaltyArea) {
            setPieceType = 'penalty';
            this.showNotification('🎯 ¡TIRO PENAL (6 Metros)!', 'penalty', 180);
        } else if (isAccumulatedOverLimit) {
            setPieceType = 'double_penalty';
            this.showNotification(`🎯 ¡DOBLE PENAL (10 Metros sin barrera)! (${this.accumulatedFouls[foulingTeamKey]}ª falta)`, 'double_penalty', 180);
        }

        return {
            tackler,
            victim,
            cardIssued,
            setPieceType,
            spotX: victim.x,
            spotY: victim.y
        };
    }

    /**
     * Muestra una notificación arbitral en el HUD superior.
     * 
     * @param {string} text - Texto descriptivo.
     * @param {string} [type='info'] - 'yellow', 'red', 'foul', 'penalty', 'goal', 'info'.
     * @param {number} [duration=120] - Fotogramas de duración en pantalla.
     */
    showNotification(text, type = 'info', duration = 120) {
        this.currentNotification = {
            text,
            type,
            timer: duration
        };
    }
}

// Instancia global del árbitro
export const referee = new Referee();
