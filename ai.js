/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MOTOR DE INTELIGENCIA ARTIFICIAL (IA) Y FLOCKING
 * ============================================================================
 * Maneja el comportamiento táctico de los bots, desmarques ofensivos,
 * triangulaciones de pases, repliegues defensivos y el sistema de EVASIÓN SUAVE
 * (Soft Steering / Avoidance) para que los bots no colisionen ni empujen a los
 * jugadores humanos ni a sus propios compañeros.
 */

import { COURT } from './physics.js';

export class AIEngine {
    /**
     * Constructor del motor de IA.
     * @param {string} [difficulty='normal'] - Nivel de dificultad: 'easy', 'normal', 'hard', 'legend'.
     */
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.config = this.getDifficultyConfig(difficulty);
    }

    /**
     * Establece el nivel de dificultad de la IA y actualiza sus parámetros de reacción.
     * @param {string} diff - 'easy', 'normal', 'hard', 'legend'.
     */
    setDifficulty(diff) {
        this.difficulty = diff;
        this.config = this.getDifficultyConfig(diff);
    }

    /**
     * Retorna la configuración numérica según la dificultad elegida.
     * @param {string} diff - Nivel de dificultad.
     * @returns {Object} Parámetros de precisión, velocidad de reacción y agresividad.
     */
    getDifficultyConfig(diff) {
        switch (diff) {
            case 'easy':
                return {
                    reactionDelay: 16,
                    shootRange: 260,
                    tackleAggressiveness: 0.008,
                    passTendency: 0.04,
                    sprintChance: 0.15,
                    avoidanceRadius: 28
                };
            case 'hard':
                return {
                    reactionDelay: 5,
                    shootRange: 380,
                    tackleAggressiveness: 0.032,
                    passTendency: 0.09,
                    sprintChance: 0.55,
                    avoidanceRadius: 36
                };
            case 'legend':
                return {
                    reactionDelay: 2,
                    shootRange: 420,
                    tackleAggressiveness: 0.050,
                    passTendency: 0.14,
                    sprintChance: 0.85,
                    avoidanceRadius: 40
                };
            case 'normal':
            default:
                return {
                    reactionDelay: 9,
                    shootRange: 320,
                    tackleAggressiveness: 0.018,
                    passTendency: 0.06,
                    sprintChance: 0.35,
                    avoidanceRadius: 32
                };
        }
    }

    /**
     * Calcula las decisiones y vectores de movimiento para todos los bots de un equipo.
     * 
     * @param {Array<Object>} teamPlayers - Jugadores del equipo controlado por la IA.
     * @param {Array<Object>} opponentPlayers - Jugadores del equipo rival.
     * @param {Object} ball - Objeto balón del partido.
     * @param {boolean} isAttackingRight - True si el equipo ataca hacia la derecha (portería rival en maxX).
     */
    updateTeamAI(teamPlayers, opponentPlayers, ball, isAttackingRight) {
        const teamHasBall = ball.owner && teamPlayers.includes(ball.owner);
        const oppHasBall = ball.owner && opponentPlayers.includes(ball.owner);

        teamPlayers.forEach(player => {
            if (player.isExpelled) return;

            // Lógica especializada para el Portero (POR)
            if (player.card.position === 'POR') {
                this.updateGoalkeeperAI(player, ball, isAttackingRight, teamHasBall);
                return;
            }

            // Lógica según el estado del jugador respecto al balón
            if (player === ball.owner) {
                this.updateBallCarrierAI(player, teamPlayers, opponentPlayers, ball, isAttackingRight);
            } else if (teamHasBall) {
                this.updateOffBallAttackingAI(player, teamPlayers, opponentPlayers, ball, isAttackingRight);
            } else {
                this.updateDefendingAI(player, teamPlayers, opponentPlayers, ball, isAttackingRight);
            }

            // APLICAR SISTEMA DE EVASIÓN SUAVE (SOFT AVOIDANCE)
            // Evita que los bots colisionen o choquen torpemente contra otros jugadores
            this.applySoftAvoidanceSteering(player, teamPlayers, opponentPlayers);
        });
    }

    /**
     * IA del Portero: permanece dentro del área de 6m, acompaña la trayectoria y se estira a parar.
     * 
     * @param {Object} gk - Objeto portero.
     * @param {Object} ball - Balón.
     * @param {boolean} isAttackingRight - Dirección de ataque.
     * @param {boolean} teamHasBall - Si su equipo tiene la posesión.
     */
    updateGoalkeeperAI(gk, ball, isAttackingRight, teamHasBall) {
        const baseBoxX = isAttackingRight ? COURT.minX + 38 : COURT.maxX - 38;

        if (gk === ball.owner) {
            // El arquero tiene el balón en pies: busca pase rápido y seguro a un compañero
            gk.aiDecisionTimer = (gk.aiDecisionTimer || 0) + 1;
            if (gk.aiDecisionTimer > 20) {
                gk.aiInput = {
                    pass: true,
                    shoot: false,
                    tackle: false,
                    sprint: false,
                    x: isAttackingRight ? 1 : -1,
                    y: (Math.random() - 0.5) * 0.7
                };
                gk.aiDecisionTimer = 0;
            }
            return;
        }

        // Seguir el balón en el eje Y dentro de la boca del arco
        const targetY = Math.min(COURT.goalBottom - 12, Math.max(COURT.goalTop + 12, ball.y));
        const targetX = baseBoxX;

        const dx = targetX - gk.x;
        const dy = targetY - gk.y;
        const dist = Math.hypot(dx, dy);

        gk.aiInput = {
            x: dist > 4 ? (dx / dist) * 0.95 : 0,
            y: dist > 4 ? (dy / dist) * 0.95 : 0,
            sprint: Math.abs(dy) > 25,
            pass: false,
            shoot: false,
            tackle: false
        };

        // Estirada salvadora cuando un tiro peligroso se aproxima a portería
        const isHeadingToGoal = isAttackingRight
            ? (ball.vx < -4.2 && ball.x < COURT.minX + 220)
            : (ball.vx > 4.2 && ball.x > COURT.maxX - 220);

        if (isHeadingToGoal && Math.abs(ball.y - gk.y) < 85 && Math.abs(ball.x - gk.x) < 110) {
            gk.aiInput.tackle = true; // Estirada del portero
            gk.aiInput.y = Math.sign(ball.y - gk.y);
        }
    }

    /**
     * IA del Conductor de Balón: decide si tirar, pasar o avanzar regateando.
     * 
     * @param {Object} carrier - Jugador con el balón.
     * @param {Array<Object>} teammates - Compañeros de equipo.
     * @param {Array<Object>} opponents - Rivales.
     * @param {Object} ball - Balón.
     * @param {boolean} isAttackingRight - Dirección de ataque.
     */
    updateBallCarrierAI(carrier, teammates, opponents, ball, isAttackingRight) {
        carrier.aiDecisionTimer = (carrier.aiDecisionTimer || 0) + 1;

        const goalTarget = isAttackingRight
            ? { x: COURT.maxX, y: COURT.height / 2 }
            : { x: COURT.minX, y: COURT.height / 2 };

        const distToGoal = Math.hypot(goalTarget.x - carrier.x, goalTarget.y - carrier.y);

        // 1. Oportunidad de Disparo
        const inShootingRange = distToGoal < this.config.shootRange;
        const isFacingGoal = isAttackingRight ? carrier.x > COURT.width * 0.45 : carrier.x < COURT.width * 0.55;

        if (inShootingRange && isFacingGoal && Math.random() < 0.08) {
            // Apuntar a las esquinas superiores o inferiores de la portería
            const cornerY = Math.random() > 0.5 ? COURT.goalTop + 18 : COURT.goalBottom - 18;
            const shootDirX = isAttackingRight ? 1 : -1;
            const shootDirY = (cornerY - carrier.y) / 100;

            carrier.aiInput = {
                x: shootDirX,
                y: shootDirY,
                shoot: true,
                pass: false,
                sprint: true,
                tackle: false
            };
            return;
        }

        // 2. Oportunidad de Pase
        const openTeammate = this.findBestPassTarget(carrier, teammates, opponents, isAttackingRight);
        if (openTeammate && Math.random() < this.config.passTendency) {
            const dx = openTeammate.x - carrier.x;
            const dy = openTeammate.y - carrier.y;
            const dist = Math.hypot(dx, dy);

            carrier.aiInput = {
                x: dx / dist,
                y: dy / dist,
                pass: true,
                shoot: false,
                sprint: false,
                tackle: false
            };
            return;
        }

        // 3. Conducción hacia el arco rival
        let moveX = isAttackingRight ? 1 : -1;
        let moveY = (COURT.height / 2 - carrier.y) * 0.005;

        // Despejar el cuerpo si un rival se acerca de frente
        opponents.forEach(opp => {
            const d = Math.hypot(opp.x - carrier.x, opp.y - carrier.y);
            if (d < 55) {
                // Esquivar lateralmente
                moveY += opp.y > carrier.y ? -0.8 : 0.8;
            }
        });

        carrier.aiInput = {
            x: moveX,
            y: Math.max(-1, Math.min(1, moveY)),
            pass: false,
            shoot: false,
            sprint: Math.random() < this.config.sprintChance,
            tackle: false
        };
    }

    /**
     * IA en Ataque sin Balón: desmarques hacia espacios libres y creación de líneas de pase.
     */
    updateOffBallAttackingAI(player, teammates, opponents, ball, isAttackingRight) {
        const sign = isAttackingRight ? 1 : -1;
        const midX = COURT.width / 2;

        let targetX = player.defaultFormationPos.x + sign * 90;
        let targetY = player.defaultFormationPos.y;

        // Acompañar la jugada según la posición del balón
        targetX += (ball.x - midX) * 0.35;
        targetY += (ball.y - COURT.height / 2) * 0.25;

        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.hypot(dx, dy);

        player.aiInput = {
            x: dist > 15 ? dx / dist : 0,
            y: dist > 15 ? dy / dist : 0,
            sprint: dist > 120,
            pass: false,
            shoot: false,
            tackle: false
        };
    }

    /**
     * IA en Defensa: repliegue ordenado, presión al poseedor y robo de balón.
     */
    updateDefendingAI(player, teammates, opponents, ball, isAttackingRight) {
        const isClosestToBall = this.isPlayerClosestToBall(player, teammates, ball);

        if (isClosestToBall) {
            // Presionar intensamente al portador o ir a buscar el balón libre
            const dx = ball.x - player.x;
            const dy = ball.y - player.y;
            const dist = Math.hypot(dx, dy);

            // Intentar barrida limpia si está en rango y de frente
            let tackleAttempt = false;
            if (dist < 32 && Math.random() < this.config.tackleAggressiveness) {
                tackleAttempt = true;
            }

            player.aiInput = {
                x: dist > 5 ? dx / dist : 0,
                y: dist > 5 ? dy / dist : 0,
                sprint: true,
                tackle: tackleAttempt,
                pass: false,
                shoot: false
            };
        } else {
            // Mantener la formación táctica de cobertura
            const myDefPos = player.defaultFormationPos;
            const targetX = myDefPos.x + (ball.x - COURT.width / 2) * 0.22;
            const targetY = myDefPos.y + (ball.y - COURT.height / 2) * 0.30;

            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const dist = Math.hypot(dx, dy);

            player.aiInput = {
                x: dist > 12 ? dx / dist : 0,
                y: dist > 12 ? dy / dist : 0,
                sprint: dist > 90,
                pass: false,
                shoot: false,
                tackle: false
            };
        }
    }

    /**
     * SISTEMA DE EVASIÓN SUAVE (SOFT AVOIDANCE / FLOCKING):
     * Modifica el vector de entrada del bot para esquivar suavemente a otros jugadores
     * sin que existan colisiones físicas duras ni empujones incómodos.
     * 
     * @param {Object} player - El bot que está calculando su movimiento.
     * @param {Array<Object>} teammates - Compañeros.
     * @param {Array<Object>} opponents - Rivales.
     */
    applySoftAvoidanceSteering(player, teammates, opponents) {
        if (!player.aiInput) return;

        const allOtherPlayers = [...teammates, ...opponents].filter(p => p !== player && !p.isExpelled);
        let avoidX = 0;
        let avoidY = 0;
        const avoidRadius = this.config.avoidanceRadius || 32;

        allOtherPlayers.forEach(other => {
            const dx = player.x - other.x;
            const dy = player.y - other.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0.1 && dist < avoidRadius) {
                // Fuerza de repulsión inversamente proporcional a la distancia
                const force = (avoidRadius - dist) / avoidRadius;
                avoidX += (dx / dist) * force * 0.75;
                avoidY += (dy / dist) * force * 0.75;
            }
        });

        // Combinar el vector de evasión suave con la intención original del bot
        let finalX = player.aiInput.x + avoidX;
        let finalY = player.aiInput.y + avoidY;

        const finalMagnitude = Math.hypot(finalX, finalY);
        if (finalMagnitude > 1.0) {
            finalX /= finalMagnitude;
            finalY /= finalMagnitude;
        }

        player.aiInput.x = finalX;
        player.aiInput.y = finalY;
    }

    /**
     * Encuentra el mejor compañero libre para entregar un pase.
     */
    findBestPassTarget(carrier, teammates, opponents, isAttackingRight) {
        let bestTarget = null;
        let highestScore = -9999;

        teammates.forEach(tm => {
            if (tm === carrier || tm.isExpelled || tm.card.position === 'POR') return;

            const dx = tm.x - carrier.x;
            const dy = tm.y - carrier.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 40 || dist > 380) return;

            // Verificar si hay rivales bloqueando la línea de pase
            let lineBlocked = false;
            opponents.forEach(opp => {
                const distToOpp = Math.hypot(opp.x - (carrier.x + dx * 0.5), opp.y - (carrier.y + dy * 0.5));
                if (distToOpp < 26) lineBlocked = true;
            });

            if (lineBlocked) return;

            // Puntuación favorable por avance hacia portería rival
            const forwardBonus = isAttackingRight ? dx * 1.5 : -dx * 1.5;
            const score = 300 - dist + forwardBonus;

            if (score > highestScore) {
                highestScore = score;
                bestTarget = tm;
            }
        });

        return bestTarget;
    }

    /**
     * Comprueba si el jugador es el más cercano de su equipo al balón.
     */
    isPlayerClosestToBall(player, team, ball) {
        let closestPlayer = null;
        let minDist = 9999;

        team.forEach(p => {
            if (p.isExpelled || p.card.position === 'POR') return;
            const d = Math.hypot(p.x - ball.x, p.y - ball.y);
            if (d < minDist) {
                minDist = d;
                closestPlayer = p;
            }
        });

        return closestPlayer === player;
    }
}

// Instancia global del motor de IA
export const aiEngine = new AIEngine('normal');
