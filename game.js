/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MOTOR DE JUEGO, FÍSICAS Y RENDERIZADOR 60 FPS
 * ============================================================================
 * Maneja el bucle de juego a 60 FPS, actualización de entidades, renderizado
 * de gráficos 64-bit con animaciones multi-frame (carrera, disparo, barrida,
 * paradas, celebraciones), control de cámaras, partículas e integración
 * con el árbitro, la IA, el tutorial interactivo y la economía de monedas.
 */

import { COURT, Ball } from './physics.js';
import { referee } from './referee.js';
import { aiEngine } from './ai.js';
import { input } from './input.js';
import { sound } from './audio.js';
import { clubManager } from './cards.js';
import { generateRandomPlayer, NATIONS } from './database.js';
import { tutorialManager } from './tutorial.js';
import { economyManager } from './economy.js';

/**
 * Clase que representa a un jugador en la cancha con ciclo de animaciones 64-bit.
 */
export class Player {
    /**
     * Constructor del Jugador.
     * @param {string} id - Identificador único.
     * @param {Object} card - Objeto carta con estadísticas (60-120), apariencia y nombre.
     * @param {number} team - 1 = Equipo Local (Azul/Personalizado), 2 = Equipo Visitante (Rojo/Rival).
     * @param {boolean} [isPlayerControlled=false] - Si está controlado actualmente por el usuario.
     * @param {number} [slotPos=0] - Posición en la formación (0: POR, 1: DEF, 2: MC, 3: DEL1, 4: DEL2).
     */
    constructor(id, card, team, isPlayerControlled = false, slotPos = 0) {
        this.id = id;
        this.card = card;
        this.team = team;
        this.isPlayerControlled = isPlayerControlled;
        this.slotPos = slotPos;

        // Posición y velocidad
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.facingAngle = team === 1 ? 0 : Math.PI;

        // Estados y temporizadores de animación 64-bit
        this.state = 'idle'; // 'idle', 'running', 'kicking', 'tackling', 'saving', 'stunned', 'celebrating'
        this.stateTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.breathTimer = Math.random() * Math.PI * 2; // Desfase de respiración natural

        // Estado del partido
        this.stamina = 100;
        this.isExpelled = false;
        this.tackleCooldown = 0;
        this.defaultFormationPos = { x: 0, y: 0 };
    }

    /**
     * Reinicia la posición, velocidades y estado del jugador.
     * @param {number} x - Posición X.
     * @param {number} y - Posición Y.
     * @param {boolean} [facingRight=true] - Orientación hacia la derecha.
     */
    resetPos(x, y, facingRight = true) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.facingAngle = facingRight ? 0 : Math.PI;
        this.state = 'idle';
        this.stateTimer = 0;
        this.animFrame = 0;
        this.defaultFormationPos = { x, y };
    }

    /**
     * Actualiza la física, fricción y ciclo de animación del jugador en cada frame.
     * @param {Object} ball - Objeto balón del partido.
     * @param {Object} match - Motor del partido.
     */
    update(ball, match) {
        if (this.isExpelled) return;

        // Enfriamiento de barridas y temporizador de estado
        if (this.tackleCooldown > 0) this.tackleCooldown--;
        if (this.stateTimer > 0) {
            this.stateTimer--;
            if (this.stateTimer <= 0 && this.state !== 'celebrating') {
                this.state = 'idle';
            }
        }

        // Fricción de desplazamiento suave sobre el parqué
        this.vx *= 0.84;
        this.vy *= 0.84;

        // Aplicar movimiento
        this.x += this.vx;
        this.y += this.vy;

        // Limitar dentro de los bordes oficiales de la cancha
        this.x = Math.max(COURT.minX + 10, Math.min(COURT.maxX - 10, this.x));
        this.y = Math.max(COURT.minY + 10, Math.min(COURT.maxY - 10, this.y));

        // Actualización de animaciones 64-bit
        const currentSpeed = Math.hypot(this.vx, this.vy);
        this.breathTimer += 0.06;

        if (this.state === 'tackling' || this.state === 'kicking' || this.state === 'celebrating') {
            // Mantener la animación de acción activa
        } else if (currentSpeed > 0.35) {
            this.state = 'running';
            this.animTimer += currentSpeed * 0.22;
            if (this.animTimer > 1) {
                this.animFrame = (this.animFrame + 1) % 6; // Ciclo fluido de 6 fotogramas
                this.animTimer = 0;
            }
        } else {
            this.state = 'idle';
            this.animFrame = 0;
        }
    }
}

/**
 * Clase principal del Motor de Partido Futsal 64-Bit.
 */
export class MatchEngine {
    /**
     * Constructor del Motor de Partido.
     * @param {HTMLCanvasElement} canvas - Elemento canvas HTML5 donde se dibuja el partido.
     * @param {Function} onMatchEnd - Callback al terminar el partido con el resumen final.
     */
    constructor(canvas, onMatchEnd) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onMatchEnd = onMatchEnd;

        this.ball = new Ball();
        this.team1 = []; // Jugadores del Equipo 1 (Usuario / Local)
        this.team2 = []; // Jugadores del Equipo 2 (IA / Rival)
        this.activeP1Index = 3; // Jugador controlado actualmente por P1
        this.activeP2Index = 3; // Jugador controlado actualmente por P2 (en 2P)

        this.gameMode = 'vs_cpu'; // 'vs_cpu', 'local_2p', 'tutorial'
        this.difficulty = 'normal';
        this.matchTime = 0;       // Segundos de partido en reloj
        this.half = 1;            // 1 = 1er Tiempo, 2 = 2do Tiempo, 3 = Descanso, 4 = Fin
        this.timeSpeed = 2.4;     // Multiplicador de velocidad de reloj arcade
        this.score = { team1: 0, team2: 0 };
        this.matchStats = {
            shots1: 0, shots2: 0,
            possession1: 50, possession2: 50,
            fouls1: 0, fouls2: 0,
            possessionTicks1: 1, possessionTicks2: 1
        };

        this.gameState = 'kickoff'; // 'play', 'kickoff', 'goal_celebration', 'foul_stoppage', 'set_piece', 'halftime', 'game_over'
        this.stateTimer = 0;
        this.setPiece = null;
        this.lastGoalInfo = null;

        // Colores y nombres de equipaciones 64-Bit
        this.team1Color = { primary: '#2563eb', secondary: '#ffffff', gk: '#f59e0b', name: 'Mi Club 64-Bit' };
        this.team2Color = { primary: '#dc2626', secondary: '#fde047', gk: '#10b981', name: 'Rival Futsal' };

        this.particles = [];
        this.floatingCoins = [];
        this.isRunning = false;
    }

    /**
     * Inicia un nuevo partido de Futsal 64-Bit configurando plantillas y árbitro.
     * 
     * @param {string} [mode='vs_cpu'] - 'vs_cpu', 'local_2p', 'tutorial'.
     * @param {string} [difficulty='normal'] - Dificultad del rival.
     * @param {Object} [opponentTeamData=null] - Datos opcionales del equipo rival.
     */
    startMatch(mode = 'vs_cpu', difficulty = 'normal', opponentTeamData = null) {
        this.gameMode = mode;
        this.difficulty = difficulty;
        aiEngine.setDifficulty(difficulty);

        referee.resetMatch();
        this.score = { team1: 0, team2: 0 };
        this.matchTime = 0;
        this.half = 1;
        this.matchStats = { shots1: 0, shots2: 0, fouls1: 0, fouls2: 0, possessionTicks1: 1, possessionTicks2: 1 };
        this.particles = [];
        this.floatingCoins = [];

        // Configurar Equipo 1 (Plantilla del Usuario)
        const mySquad = clubManager.squad;
        this.team1Color.name = clubManager.teamName || 'Mi Club';
        this.team1 = mySquad.map((card, idx) => new Player(`t1_${idx}`, card, 1, idx === 3, idx));

        // Configurar Equipo 2 (Rival o Bots de entrenamiento)
        if (mode === 'tutorial') {
            this.team2Color = { primary: '#f97316', secondary: '#1e293b', gk: '#06b6d4', name: 'Sparring Bot 64' };
            const sparringSquad = [
                generateRandomPlayer('POR', 60, 65),
                generateRandomPlayer('DEF', 60, 65),
                generateRandomPlayer('MC',  60, 65),
                generateRandomPlayer('DEL', 60, 65),
                generateRandomPlayer('DEL', 60, 65)
            ];
            this.team2 = sparringSquad.map((card, idx) => new Player(`t2_${idx}`, card, 2, false, idx));
        } else if (opponentTeamData) {
            this.team2Color = opponentTeamData;
            this.team2 = opponentTeamData.squad.map((card, idx) => new Player(`t2_${idx}`, card, 2, false, idx));
        } else {
            const nation = NATIONS[Math.floor(Math.random() * NATIONS.length)];
            this.team2Color = {
                primary: nation.primaryColor,
                secondary: nation.secondaryColor,
                gk: '#059669',
                name: `Selección ${nation.name}`
            };
            const oppSquad = [
                generateRandomPlayer('POR', 68, 88),
                generateRandomPlayer('DEF', 70, 90),
                generateRandomPlayer('MC',  72, 92),
                generateRandomPlayer('DEL', 74, 94),
                generateRandomPlayer('DEL', 70, 90)
            ];
            this.team2 = oppSquad.map((card, idx) => new Player(`t2_${idx}`, card, 2, false, idx));
        }

        this.setupFormation(1);
        this.setupFormation(2);
        this.resetKickoff(1);

        this.isRunning = true;
        sound.playWhistle('short');
        console.log(`🏟️ [Match 64-Bit] Partido iniciado en modo ${mode} (${this.team1Color.name} vs ${this.team2Color.name}).`);
    }

    /**
     * Coloca a los 5 jugadores de un equipo en sus posiciones tácticas en la cancha grande.
     * @param {number} teamNum - 1 o 2.
     */
    setupFormation(teamNum) {
        const players = teamNum === 1 ? this.team1 : this.team2;
        const isTeam1 = teamNum === 1;
        const sign = isTeam1 ? 1 : -1;
        const midX = COURT.width / 2;
        const midY = COURT.height / 2;

        // Distribución táctica 5v5 para cancha ampliada (1050x620)
        const basePositions = [
            { x: isTeam1 ? COURT.minX + 30 : COURT.maxX - 30, y: midY },       // Slot 0: POR (Portero)
            { x: midX - sign * 240, y: midY },                                 // Slot 1: DEF (Cierre central)
            { x: midX - sign * 130, y: midY + 70 },                            // Slot 2: MC (Ala organizador)
            { x: midX - sign * 40,  y: midY - 60 },                            // Slot 3: DEL 1 (Pívot atacante)
            { x: midX - sign * 50,  y: midY + 85 }                             // Slot 4: DEL 2 (Ala ofensivo)
        ];

        players.forEach((p, idx) => {
            const pos = basePositions[idx] || { x: midX - sign * 80, y: midY };
            p.resetPos(pos.x, pos.y, isTeam1);
        });
    }

    /**
     * Coloca a los jugadores para el saque de centro (Kickoff).
     * @param {number} [kickingTeam=1] - Equipo que saca de centro.
     */
    resetKickoff(kickingTeam = 1) {
        this.gameState = 'kickoff';
        this.stateTimer = 55;
        this.ball.reset(COURT.width / 2, COURT.height / 2);

        this.setupFormation(1);
        this.setupFormation(2);

        // Ubicar al delantero cerca del punto central
        const kicker = (kickingTeam === 1 ? this.team1[3] : this.team2[3]);
        if (kicker) {
            kicker.x = COURT.width / 2 - (kickingTeam === 1 ? 18 : -18);
            kicker.y = COURT.height / 2;
        }
    }

    /**
     * Bucle principal de actualización de estados de juego (60 Hz).
     */
    update() {
        if (!this.isRunning) return;

        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }

        // Actualizar monedas flotantes
        for (let i = this.floatingCoins.length - 1; i >= 0; i--) {
            const fc = this.floatingCoins[i];
            fc.y += fc.vy;
            fc.alpha -= 0.02;
            if (fc.alpha <= 0) this.floatingCoins.splice(i, 1);
        }

        // Actualizar Árbitro
        referee.update(this.ball.x, this.ball.y);

        // Gestionar temporizadores de estado
        if (this.stateTimer > 0) {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                if (this.gameState === 'goal_celebration') {
                    this.resetKickoff(this.lastGoalInfo.scoringTeam === 1 ? 2 : 1);
                } else if (this.gameState === 'kickoff') {
                    this.gameState = 'play';
                } else if (this.gameState === 'foul_stoppage') {
                    this.prepareSetPiece(this.activeFoulEvent);
                }
            }
        }

        // Reloj de Partido (2 Tiempos de 45 minutos simulados)
        if (this.gameState === 'play') {
            this.matchTime += (1 / 60) * this.timeSpeed * 60;

            // Registrar estadísticas de posesión
            if (this.ball.owner) {
                if (this.ball.owner.team === 1) this.matchStats.possessionTicks1++;
                else this.matchStats.possessionTicks2++;
            }

            const totalTicks = this.matchStats.possessionTicks1 + this.matchStats.possessionTicks2;
            this.matchStats.possession1 = Math.round((this.matchStats.possessionTicks1 / totalTicks) * 100);
            this.matchStats.possession2 = 100 - this.matchStats.possession1;

            // Fin del Primer Tiempo (45:00)
            if (this.half === 1 && this.matchTime >= 45 * 60) {
                this.triggerHalfTime();
                return;
            }

            // Fin del Partido (90:00)
            if (this.half === 2 && this.matchTime >= 90 * 60) {
                this.triggerFullTime();
                return;
            }
        }

        // Procesar entradas de usuario y de IA
        this.processInputs();

        // Actualizar físicas de jugadores y balón
        this.team1.forEach(p => p.update(this.ball, this));
        this.team2.forEach(p => p.update(this.ball, this));
        this.ball.update();
        this.ball.checkCollisions(() => sound.playPostHit());

        // Comprobar posesión, goles y saques de banda
        if (this.gameState === 'play') {
            this.checkBallPossession();
            this.checkGoals();
            this.checkCourtBoundaries();
        } else if (this.gameState === 'set_piece') {
            this.updateSetPiece();
        }
    }

    /**
     * Procesa las entradas del jugador humano y calcula las acciones de los bots de apoyo.
     */
    processInputs() {
        const p1Input = input.getPlayer1Input();
        const p2Input = this.gameMode === 'local_2p' ? input.getPlayer2Input() : null;

        // Cambio de jugador controlado por P1
        if (p1Input.switchPlayer) {
            this.switchActivePlayer(1);
            tutorialManager.recordAction('switch', 1);
        }

        // Registrar progreso de movimiento en tutorial
        if (Math.abs(p1Input.x) > 0.1 || Math.abs(p1Input.y) > 0.1) {
            tutorialManager.recordAction('move', 1);
        }

        // Aplicar acción al jugador P1
        const activeP1 = this.team1[this.activeP1Index];
        if (activeP1 && !activeP1.isExpelled) {
            this.applyPlayerAction(activeP1, p1Input);
        }

        // Aplicar acción a P2 o IA del rival
        if (this.gameMode === 'local_2p' && p2Input) {
            if (p2Input.switchPlayer) this.switchActivePlayer(2);
            const activeP2 = this.team2[this.activeP2Index];
            if (activeP2 && !activeP2.isExpelled) {
                this.applyPlayerAction(activeP2, p2Input);
            }
            const cpuTeam2 = this.team2.filter((p, i) => i !== this.activeP2Index);
            aiEngine.updateTeamAI(cpuTeam2, this.team1, this.ball, false);
            cpuTeam2.forEach(p => {
                if (p.aiInput) this.applyPlayerAction(p, p.aiInput);
            });
        } else {
            // En modo vs CPU o Tutorial, la IA controla todo el equipo rival
            aiEngine.updateTeamAI(this.team2, this.team1, this.ball, false);
            this.team2.forEach(p => {
                if (p.aiInput) this.applyPlayerAction(p, p.aiInput);
            });
        }

        // La IA controla a los compañeros de P1 que no tienen el cursor activo
        const cpuTeam1 = this.team1.filter((p, i) => i !== this.activeP1Index);
        aiEngine.updateTeamAI(cpuTeam1, this.team2, this.ball, true);
        cpuTeam1.forEach(p => {
            if (p.aiInput) this.applyPlayerAction(p, p.aiInput);
        });
    }

    /**
     * Cambia el cursor al jugador de campo más cercano al balón.
     * @param {number} teamNum - 1 o 2.
     */
    switchActivePlayer(teamNum) {
        const team = teamNum === 1 ? this.team1 : this.team2;
        let closestIdx = 0;
        let closestDist = 99999;

        team.forEach((p, idx) => {
            if (p.isExpelled || p.card.position === 'POR') return;
            const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
            if (d < closestDist) {
                closestDist = d;
                closestIdx = idx;
            }
        });

        if (teamNum === 1) this.activeP1Index = closestIdx;
        else this.activeP2Index = closestIdx;
    }

    /**
     * Aplica la entrada calculada (movimiento, sprint, pase, tiro o barrida) a un jugador.
     * @param {Object} player - Jugador objetivo.
     * @param {Object} inData - Datos de entrada { x, y, pass, shoot, sprint, tackle }.
     */
    applyPlayerAction(player, inData) {
        if (player.state === 'tackling' || player.state === 'stunned') return;

        // Velocidad escalada por el atributo VEL (60 - 120)
        const baseSpeed = 2.6 + (player.card.stats.vel / 120) * 2.0;
        const sprintMult = inData.sprint ? 1.48 : 1.0;
        const speed = baseSpeed * sprintMult;

        if (Math.abs(inData.x) > 0.05 || Math.abs(inData.y) > 0.05) {
            player.vx = inData.x * speed;
            player.vy = inData.y * speed;
            player.facingAngle = Math.atan2(inData.y, inData.x);
        }

        // Acciones con balón o defensivas
        if (this.ball.owner === player) {
            if (inData.shoot) {
                this.performShot(player);
            } else if (inData.pass) {
                this.performPass(player);
            }
        } else {
            if (inData.tackle && player.tackleCooldown === 0) {
                this.performTackle(player);
            }
        }
    }

    /**
     * Ejecuta un pase raso buscando la mejor línea hacia un compañero.
     * @param {Object} player - Jugador que pasa.
     */
    performPass(player) {
        const teammates = player.team === 1 ? this.team1 : this.team2;
        let bestTarget = null;
        let bestScore = -999;

        teammates.forEach(tm => {
            if (tm === player || tm.isExpelled) return;
            const dx = tm.x - player.x;
            const dy = tm.y - player.y;
            const dist = Math.hypot(dx, dy);
            const angleToTm = Math.atan2(dy, dx);
            const facingDiff = Math.abs(angleToTm - player.facingAngle);

            if (facingDiff < Math.PI / 2.0) {
                const score = 600 - dist - (facingDiff * 180);
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = tm;
                }
            }
        });

        // Velocidad de pase escalada por PAS (60 - 120)
        const passSpeed = 6.8 + (player.card.stats.pas / 120) * 4.0;
        let passAngle = player.facingAngle;

        if (bestTarget) {
            passAngle = Math.atan2(bestTarget.y - player.y, bestTarget.x - player.x);
        }

        this.ball.kick(Math.cos(passAngle) * passSpeed, Math.sin(passAngle) * passSpeed, 0, player);
        player.state = 'kicking';
        player.stateTimer = 16;
        sound.playPass();

        if (player.team === 1) {
            tutorialManager.recordAction('pass', 1);
        }
    }

    /**
     * Ejecuta un disparo a portería con potencia basada en TIR (60 - 120).
     * @param {Object} player - Jugador que dispara.
     */
    performShot(player) {
        const isTeam1 = player.team === 1;
        const targetGoal = isTeam1
            ? { x: COURT.maxX, y: COURT.height / 2 }
            : { x: COURT.minX, y: COURT.height / 2 };

        const shotPower = 9.2 + (player.card.stats.tir / 120) * 6.2;
        let shotAngle = Math.atan2(targetGoal.y - player.y, targetGoal.x - player.x);
        shotAngle += (Math.random() - 0.5) * 0.12;

        const shotZ = 2.2 + Math.random() * 3.5;

        this.ball.kick(Math.cos(shotAngle) * shotPower, Math.sin(shotAngle) * shotPower, shotZ, player);
        player.state = 'kicking';
        player.stateTimer = 22;
        sound.playKick(1.25);

        if (isTeam1) {
            this.matchStats.shots1++;
            tutorialManager.recordAction('shoot', 1);
        } else {
            this.matchStats.shots2++;
        }

        // Partículas luminosas de tiro 64-bit
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.ball.x,
                y: this.ball.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#facc15',
                size: 4,
                alpha: 1.0,
                decay: 0.07
            });
        }
    }

    /**
     * Ejecuta una barrida defensiva con deslizamiento y chispas de parqué.
     * @param {Object} tackler - Defensor que se barre.
     */
    performTackle(tackler) {
        tackler.state = 'tackling';
        tackler.stateTimer = 26;
        tackler.tackleCooldown = 55;
        sound.playTackle();

        const slideSpeed = 5.2 + (tackler.card.stats.def / 120) * 2.5;
        tackler.vx = Math.cos(tackler.facingAngle) * slideSpeed;
        tackler.vy = Math.sin(tackler.facingAngle) * slideSpeed;

        // Chispas de parqué y fricción
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: tackler.x,
                y: tackler.y + 6,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                color: '#ffffff',
                size: 2.5,
                alpha: 0.9,
                decay: 0.08
            });
        }

        // Comprobar contacto con el poseedor del balón
        const opponents = tackler.team === 1 ? this.team2 : this.team1;
        opponents.forEach(victim => {
            if (victim.isExpelled) return;
            const dist = Math.hypot(victim.x - tackler.x, victim.y - tackler.y);
            if (dist < 26) {
                const foulEvent = referee.processTackleFoul(tackler, victim, this);
                if (foulEvent) {
                    this.triggerFoulStoppage(foulEvent);
                } else if (this.ball.owner === victim) {
                    // Robo limpio de balón
                    victim.state = 'stunned';
                    victim.stateTimer = 20;
                    this.ball.owner = tackler;
                    sound.playKick(0.9);

                    if (tackler.team === 1) {
                        tutorialManager.recordAction('tackle', 1);
                    }
                }
            }
        });
    }

    /**
     * Interrumpe el juego tras una falta y prepara el tiro libre o penal.
     * @param {Object} foulEvent - Información de la falta pitada por el árbitro.
     */
    triggerFoulStoppage(foulEvent) {
        this.gameState = 'foul_stoppage';
        this.stateTimer = 90;
        this.activeFoulEvent = foulEvent;
        this.ball.owner = null;
        this.ball.vx = 0;
        this.ball.vy = 0;
        sound.playWhistle('long');

        if (foulEvent.tackler.team === 1) this.matchStats.fouls1++;
        else this.matchStats.fouls2++;
    }

    /**
     * Prepara el punto de lanzamiento del tiro libre, penal o doble penal.
     */
    prepareSetPiece(foulEvent) {
        this.gameState = 'set_piece';
        const attackingTeam = foulEvent.victim.team;
        const taker = attackingTeam === 1 ? this.team1[3] : this.team2[3];

        let kickSpot = { x: foulEvent.spotX, y: foulEvent.spotY };

        if (foulEvent.setPieceType === 'penalty') {
            kickSpot = attackingTeam === 1
                ? { x: COURT.penaltySpotX2, y: COURT.height / 2 }
                : { x: COURT.penaltySpotX1, y: COURT.height / 2 };
        } else if (foulEvent.setPieceType === 'double_penalty') {
            kickSpot = attackingTeam === 1
                ? { x: COURT.doublePenaltySpotX2, y: COURT.height / 2 }
                : { x: COURT.doublePenaltySpotX1, y: COURT.height / 2 };
        }

        this.ball.reset(kickSpot.x, kickSpot.y);
        taker.x = kickSpot.x - (attackingTeam === 1 ? 16 : -16);
        taker.y = kickSpot.y;
        taker.facingAngle = attackingTeam === 1 ? 0 : Math.PI;

        this.setPiece = {
            type: foulEvent.setPieceType,
            taker,
            team: attackingTeam,
            angle: taker.facingAngle,
            timer: 180
        };
    }

    /**
     * Actualiza el apuntado y ejecución del tiro libre o penal.
     */
    updateSetPiece() {
        if (!this.setPiece) return;
        this.setPiece.timer--;

        const isUserTaker = (this.setPiece.team === 1) || (this.gameMode === 'local_2p' && this.setPiece.team === 2);
        const pInput = this.setPiece.team === 1 ? input.getPlayer1Input() : input.getPlayer2Input();

        if (isUserTaker) {
            if (pInput.y !== 0) {
                this.setPiece.angle += pInput.y * 0.04;
            }
            if (pInput.shoot || this.setPiece.timer <= 0) {
                this.executeSetPieceKick();
            }
        } else {
            if (this.setPiece.timer < 90) {
                this.executeSetPieceKick();
            }
        }
    }

    /**
     * Ejecuta el golpeo del tiro libre o penal hacia la portería.
     */
    executeSetPieceKick() {
        const taker = this.setPiece.taker;
        const shotPower = 9.8 + (taker.card.stats.tir / 120) * 5.0;
        this.ball.kick(Math.cos(this.setPiece.angle) * shotPower, Math.sin(this.setPiece.angle) * shotPower, 2.6, taker);
        sound.playKick(1.3);
        this.setPiece = null;
        this.gameState = 'play';
    }

    /**
     * Detecta la cercanía de jugadores al balón libre para otorgar la posesión.
     */
    checkBallPossession() {
        if (this.ball.owner) return;

        const allPlayers = [...this.team1, ...this.team2];
        let closestDist = 9999;
        let closestPlayer = null;

        allPlayers.forEach(p => {
            if (p.isExpelled || p.state === 'tackling' || p.state === 'stunned') return;
            const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
            if (d < closestDist) {
                closestDist = d;
                closestPlayer = p;
            }
        });

        if (closestDist < 18 && this.ball.z < 7) {
            this.ball.owner = closestPlayer;
        }
    }

    /**
     * Comprueba si el balón ha cruzado la línea de gol de alguna de las dos porterías.
     */
    checkGoals() {
        // Gol en portería derecha (Equipo 1 marca gol)
        if (this.ball.x > COURT.maxX && this.ball.y >= COURT.goalTop && this.ball.y <= COURT.goalBottom) {
            this.scoreGoal(1);
        }
        // Gol en portería izquierda (Equipo 2 marca gol)
        else if (this.ball.x < COURT.minX && this.ball.y >= COURT.goalTop && this.ball.y <= COURT.goalBottom) {
            this.scoreGoal(2);
        }
    }

    /**
     * Registra un gol, inicia la celebración, entrega monedas al usuario y avanza el tutorial.
     * @param {number} scoringTeam - 1 o 2.
     */
    scoreGoal(scoringTeam) {
        if (this.gameState === 'goal_celebration') return;

        if (scoringTeam === 1) this.score.team1++;
        else this.score.team2++;

        const scorer = this.ball.lastKickedBy || (scoringTeam === 1 ? this.team1[3] : this.team2[3]);
        this.lastGoalInfo = { scoringTeam, scorer };

        this.gameState = 'goal_celebration';
        this.stateTimer = 160;
        sound.playGoalCheer();
        referee.showNotification(`⚽ ¡GOOOOOOL! ${scorer.card.name}`, 'goal', 160);

        // Si el gol fue del usuario, otorgar monedas flotantes en pantalla
        if (scoringTeam === 1) {
            clubManager.addCoins(35);
            this.floatingCoins.push({
                x: this.ball.x,
                y: this.ball.y - 20,
                text: '+35 🪙 Gol Anotado',
                vy: -1.2,
                alpha: 1.0
            });
            tutorialManager.recordAction('shoot', 1);
        }

        // Poner a los jugadores del equipo goleador a celebrar
        const team = scoringTeam === 1 ? this.team1 : this.team2;
        team.forEach(p => {
            p.state = 'celebrating';
            p.stateTimer = 160;
            p.vx = 0;
            p.vy = 0;
        });

        // Explosión de confeti y partículas
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: this.ball.x,
                y: this.ball.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: ['#facc15', '#3b82f6', '#ef4444', '#10b981', '#ffffff'][i % 5],
                size: 4 + Math.random() * 3,
                alpha: 1.0,
                decay: 0.02
            });
        }
    }

    /**
     * Controla saques de banda si el balón sale de los límites laterales de la cancha.
     */
    checkCourtBoundaries() {
        if (this.ball.y < COURT.minY) {
            this.ball.y = COURT.minY + 4;
            this.ball.vy = Math.abs(this.ball.vy) * 0.4;
        } else if (this.ball.y > COURT.maxY) {
            this.ball.y = COURT.maxY - 4;
            this.ball.vy = -Math.abs(this.ball.vy) * 0.4;
        }
    }

    /**
     * Activa el descanso tras terminar el 1er tiempo.
     */
    triggerHalfTime() {
        this.gameState = 'halftime';
        this.half = 3;
        sound.playWhistle('long');
        const modal = document.getElementById('halftime-modal');
        if (modal) {
            document.getElementById('ht-score-1').textContent = this.score.team1;
            document.getElementById('ht-score-2').textContent = this.score.team2;
            document.getElementById('ht-possession').textContent = `${this.matchStats.possession1}% - ${this.matchStats.possession2}%`;
            document.getElementById('ht-shots').textContent = `${this.matchStats.shots1} - ${this.matchStats.shots2}`;
            document.getElementById('ht-fouls').textContent = `${this.matchStats.fouls1} - ${this.matchStats.fouls2}`;
            modal.classList.remove('hidden');
        }
    }

    /**
     * Reanuda el partido en el 2º Tiempo invirtiendo los lados de la cancha.
     */
    resumeSecondHalf() {
        const modal = document.getElementById('halftime-modal');
        if (modal) modal.classList.add('hidden');

        this.half = 2;
        this.matchTime = 45 * 60;
        this.resetKickoff(2);
        sound.playWhistle('short');
    }

    /**
     * Finaliza el partido (90:00), calcula las recompensas de monedas y muestra el resumen.
     */
    triggerFullTime() {
        this.gameState = 'game_over';
        this.half = 4;
        this.isRunning = false;
        sound.playWhistle('long');

        const rewardData = economyManager.calculateMatchRewards({
            userScore: this.score.team1,
            cpuScore: this.score.team2,
            difficulty: this.difficulty,
            stats: this.matchStats
        });

        clubManager.addCoins(rewardData.totalCoins);

        const modal = document.getElementById('fulltime-modal');
        if (modal) {
            document.getElementById('ft-score-1').textContent = this.score.team1;
            document.getElementById('ft-score-2').textContent = this.score.team2;
            document.getElementById('ft-reward-coins').textContent = `+${rewardData.totalCoins} 🪙`;
            document.getElementById('ft-possession').textContent = `${this.matchStats.possession1}% - ${this.matchStats.possession2}%`;
            document.getElementById('ft-shots').textContent = `${this.matchStats.shots1} - ${this.matchStats.shots2}`;
            document.getElementById('ft-fouls').textContent = `${this.matchStats.fouls1} - ${this.matchStats.fouls2}`;

            const titleEl = document.getElementById('ft-title');
            if (this.score.team1 > this.score.team2) {
                titleEl.textContent = '🏆 ¡VICTORIA EN FUTSAL 64-BIT!';
            } else if (this.score.team1 === this.score.team2) {
                titleEl.textContent = '🤝 ¡EMPATE EN LA CANCHA!';
            } else {
                titleEl.textContent = '💔 DERROTA - ¡ENTRENA Y VUELVE!';
            }

            modal.classList.remove('hidden');
        }

        if (this.onMatchEnd) {
            this.onMatchEnd({
                score: this.score,
                stats: this.matchStats,
                rewards: rewardData
            });
        }
    }

    /**
     * Renderizador principal 64-Bit en el Canvas 2D.
     */
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, COURT.width, COURT.height);

        // 1. Gradas y público 64-bit
        this.renderStadium(ctx);

        // 2. Cancha de parqué y líneas oficiales
        this.renderCourt(ctx);

        // 3. Sombras de jugadores, balón y árbitro
        this.renderShadows(ctx);

        // 4. Árbitro
        this.renderReferee(ctx);

        // 5. Jugadores ordenados por profundidad Y
        const allPlayers = [...this.team1, ...this.team2].sort((a, b) => a.y - b.y);
        allPlayers.forEach(p => this.renderPlayer(ctx, p));

        // 6. Balón 64-bit con estela y altura
        this.renderBall(ctx);

        // 7. Línea de tiro libre / penal
        if (this.gameState === 'set_piece' && this.setPiece) {
            this.renderSetPieceAim(ctx);
        }

        // 8. Partículas y confeti
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            ctx.restore();
        });

        // 9. Monedas flotantes ganadas en tiempo real
        this.floatingCoins.forEach(fc => {
            ctx.save();
            ctx.globalAlpha = fc.alpha;
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 14px "Press Start 2P", sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(fc.text, fc.x - 40, fc.y);
            ctx.restore();
        });

        // 10. Notificaciones del árbitro y overlay del tutorial
        this.renderRefereeOverlay(ctx);
        this.renderTutorialOverlay(ctx);
    }

    /**
     * Dibuja la cancha de madera pulida con líneas reglamentarias y porterías 64-bit.
     */
    renderCourt(ctx) {
        // Base de madera con gradiente cálido 64-bit
        const grad = ctx.createLinearGradient(0, 0, 0, COURT.height);
        grad.addColorStop(0, '#be824b');
        grad.addColorStop(0.5, '#b0733d');
        grad.addColorStop(1, '#9b6230');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, COURT.width, COURT.height);

        // Listones de parqué con brillo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        for (let y = 0; y < COURT.height; y += 20) {
            ctx.fillRect(0, y, COURT.width, 1.5);
        }

        // Líneas de juego (blanco nítido con leve brillo)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
        ctx.shadowBlur = 3;

        // Límites exteriores
        ctx.strokeRect(COURT.minX, COURT.minY, COURT.maxX - COURT.minX, COURT.maxY - COURT.minY);

        // Línea divisoria central y círculo central
        ctx.beginPath();
        ctx.moveTo(COURT.width / 2, COURT.minY);
        ctx.lineTo(COURT.width / 2, COURT.maxY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(COURT.width / 2, COURT.height / 2, COURT.centerCircleRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Áreas de penal de 6m
        ctx.beginPath();
        ctx.arc(COURT.minX, COURT.height / 2, COURT.penaltyAreaRadius, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(COURT.maxX, COURT.height / 2, COURT.penaltyAreaRadius, Math.PI / 2, Math.PI * 1.5);
        ctx.stroke();

        // Puntos de penal (6m y 10m)
        ctx.fillStyle = '#ffffff';
        [COURT.penaltySpotX1, COURT.penaltySpotX2, COURT.doublePenaltySpotX1, COURT.doublePenaltySpotX2, COURT.width / 2].forEach(px => {
            ctx.beginPath();
            ctx.arc(px, COURT.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.shadowBlur = 0; // Restaurar sombras

        // Porterías 64-bit
        this.renderGoal(ctx, COURT.minX, true);
        this.renderGoal(ctx, COURT.maxX, false);
    }

    /**
     * Dibuja las porterías y redes con volumen 64-bit.
     */
    renderGoal(ctx, x, isLeft) {
        const sign = isLeft ? -1 : 1;
        const depth = COURT.goalDepth;

        // Red interior con sombreado
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.fillRect(x + (isLeft ? -depth : 0), COURT.goalTop, depth, COURT.goalBottom - COURT.goalTop);

        // Malla de red
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        for (let gy = COURT.goalTop; gy <= COURT.goalBottom; gy += 12) {
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + sign * -depth, gy);
            ctx.stroke();
        }

        // Postes metálicos blancos con relieve 64-bit
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;

        ctx.fillRect(x - 4, COURT.goalTop - 4, 8, 8);
        ctx.strokeRect(x - 4, COURT.goalTop - 4, 8, 8);

        ctx.fillRect(x - 4, COURT.goalBottom - 4, 8, 8);
        ctx.strokeRect(x - 4, COURT.goalBottom - 4, 8, 8);
    }

    /**
     * Dibuja las gradas con público animado en estilo 64-bit.
     */
    renderStadium(ctx) {
        const time = Date.now() * 0.003;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, COURT.width, COURT.minY);
        ctx.fillRect(0, COURT.maxY, COURT.width, COURT.height - COURT.maxY);

        // Espectadores animados en las gradas
        for (let x = 12; x < COURT.width; x += 14) {
            const bob = Math.sin(time + x * 0.1) > 0.4 ? -3 : 0;
            ctx.fillStyle = ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#a855f7', '#ec4899'][x % 6];
            ctx.fillRect(x, 16 + bob, 7, 7);
            ctx.fillRect(x, COURT.maxY + 18 + bob, 7, 7);
        }
    }

    /**
     * Dibuja las sombras dinámicas proyectadas en el suelo.
     */
    renderShadows(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        [...this.team1, ...this.team2].forEach(p => {
            if (p.isExpelled) return;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 13, 9, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Sombra del árbitro
        ctx.beginPath();
        ctx.ellipse(referee.x, referee.y + 12, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sombra del balón (escala según altura Z)
        const shadowScale = Math.max(0.35, 1 - (this.ball.z / 70));
        ctx.beginPath();
        ctx.ellipse(this.ball.x, this.ball.y + 5, 6 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dibuja a un jugador con animaciones fluidas multi-frame 64-bit.
     * @param {CanvasRenderingContext2D} ctx - Contexto 2D.
     * @param {Object} p - Objeto jugador.
     */
    renderPlayer(ctx, p) {
        if (p.isExpelled) return;

        const isTeam1 = p.team === 1;
        const kitColor = isTeam1 ? this.team1Color.primary : this.team2Color.primary;
        const shortsColor = isTeam1 ? this.team1Color.secondary : this.team2Color.secondary;
        const skinColor = p.card.skinColor || '#f0c294';
        const hairColor = p.card.hairColor || '#1a1a1a';
        const isGK = p.card.position === 'POR';

        ctx.save();
        ctx.translate(Math.round(p.x), Math.round(p.y));

        // Flecha indicadora del jugador activo controlado
        const isP1Controlled = isTeam1 && this.team1[this.activeP1Index] === p;
        const isP2Controlled = !isTeam1 && this.gameMode === 'local_2p' && this.team2[this.activeP2Index] === p;

        if (isP1Controlled || isP2Controlled) {
            ctx.fillStyle = isP1Controlled ? '#ef4444' : '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(0, -26);
            ctx.lineTo(-6, -34);
            ctx.lineTo(6, -34);
            ctx.closePath();
            ctx.fill();
        }

        // Respiración / Desplazamiento vertical natural
        const breathY = (p.state === 'idle') ? Math.sin(p.breathTimer) * 1.2 : 0;
        const facingSign = Math.cos(p.facingAngle) >= 0 ? 1 : -1;

        // 1. ZAPATILLAS Y PIERNAS (Ciclo de carrera de 6 fotogramas o barrida)
        let legL = 0;
        let legR = 0;

        if (p.state === 'running') {
            const cycleOffsets = [-5, -2, 3, 5, 2, -3];
            legL = cycleOffsets[p.animFrame % 6];
            legR = -legL;
        } else if (p.state === 'tackling') {
            legL = facingSign * 8;
            legR = -facingSign * 4;
        }

        ctx.fillStyle = '#0f172a'; // Zapatillas
        ctx.fillRect(-5 + legL, 8 + breathY, 4, 5);
        ctx.fillRect(2 + legR, 8 + breathY, 4, 5);

        // 2. PANTALÓN CORTO
        ctx.fillStyle = shortsColor;
        ctx.fillRect(-6, 2 + breathY, 13, 7);

        // 3. CAMISETA / DORSAL
        ctx.fillStyle = isGK ? (isTeam1 ? this.team1Color.gk : this.team2Color.gk) : kitColor;
        ctx.fillRect(-7, -8 + breathY, 15, 11);

        // Detalles de equipación (rayas / hombreras 64-bit)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(-7, -8 + breathY, 15, 2);

        // 4. CABEZA Y ROSTRO
        ctx.fillStyle = skinColor;
        ctx.fillRect(-5, -16 + breathY, 10, 8);

        // Ojos orientados según la dirección de mirada
        ctx.fillStyle = '#0f172a';
        if (facingSign > 0) {
            ctx.fillRect(1, -13 + breathY, 2, 2);
        } else {
            ctx.fillRect(-3, -13 + breathY, 2, 2);
        }

        // 5. CABELLO PERSONALIZADO
        ctx.fillStyle = hairColor;
        ctx.fillRect(-6, -19 + breathY, 12, 5);

        // 6. ANIMACIÓN DE CELEBRACIÓN (Brazos en alto)
        if (p.state === 'celebrating') {
            ctx.fillStyle = skinColor;
            ctx.fillRect(-9, -18 + breathY, 3, 7);
            ctx.fillRect(7, -18 + breathY, 3, 7);
        }

        ctx.restore();
    }

    /**
     * Dibuja al árbitro en la cancha con uniforme de alta visibilidad.
     */
    renderReferee(ctx) {
        ctx.save();
        ctx.translate(Math.round(referee.x), Math.round(referee.y));

        ctx.fillStyle = '#000000';
        ctx.fillRect(-5, 7, 4, 5);
        ctx.fillRect(2, 7, 4, 5);
        ctx.fillRect(-6, 2, 13, 6);

        // Camiseta amarilla fluorescente de árbitro
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-6, -7, 13, 10);

        ctx.fillStyle = '#f0c294';
        ctx.fillRect(-4, -14, 8, 7);

        ctx.fillStyle = '#111111';
        ctx.fillRect(-5, -17, 10, 4);

        if (referee.state === 'showing_yellow' || referee.state === 'showing_red') {
            ctx.fillStyle = '#f0c294';
            ctx.fillRect(5, -17, 3, 9);
            ctx.fillStyle = referee.state === 'showing_red' ? '#ef4444' : '#facc15';
            ctx.fillRect(6, -24, 7, 10);
        }

        ctx.restore();
    }

    /**
     * Dibuja el balón de futsal 64-bit con relieve y estela de tiro.
     */
    renderBall(ctx) {
        // Estela luminosa
        this.ball.trail.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Balón de fútbol sala
        const ballScreenY = this.ball.y - this.ball.z;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.ball.x, ballScreenY, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pentágonos y texturizado 64-bit
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(this.ball.x, ballScreenY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dibuja la guía de apuntado para tiros libres y penales.
     */
    renderSetPieceAim(ctx) {
        const taker = this.setPiece.taker;
        const angle = this.setPiece.angle;
        const lineLen = 85;

        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(this.ball.x, this.ball.y);
        ctx.lineTo(this.ball.x + Math.cos(angle) * lineLen, this.ball.y + Math.sin(angle) * lineLen);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Dibuja notificaciones del árbitro y goles.
     */
    renderRefereeOverlay(ctx) {
        if (!referee.currentNotification) return;

        const notif = referee.currentNotification;
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = notif.type === 'red' ? '#ef4444' : notif.type === 'yellow' ? '#facc15' : '#38bdf8';
        ctx.lineWidth = 2.5;

        const boxW = 420;
        const boxH = 46;
        const boxX = COURT.width / 2 - boxW / 2;
        const boxY = 18;

        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P", Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(notif.text, COURT.width / 2, boxY + boxH / 2);

        ctx.restore();
    }

    /**
     * Dibuja la tarjeta de objetivo y consejos del modo Tutorial si está activo.
     */
    renderTutorialOverlay(ctx) {
        if (!tutorialManager.isActive) return;

        const step = tutorialManager.getCurrentStep();
        if (!step) return;

        ctx.save();
        const boxW = 560;
        const boxH = 68;
        const boxX = COURT.width / 2 - boxW / 2;
        const boxY = COURT.height - boxH - 12;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;

        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "Press Start 2P", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🎓 ${step.title}`, boxX + 16, boxY + 20);

        ctx.fillStyle = '#facc15';
        ctx.font = '10px "Press Start 2P", sans-serif';
        ctx.fillText(step.progressText(tutorialManager.stepProgress, step.targetCount), boxX + 16, boxY + 40);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px Outfit, sans-serif';
        ctx.fillText(step.instruction, boxX + 16, boxY + 58);

        ctx.restore();
    }
}
