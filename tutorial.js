/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MÓDULO DE TUTORIAL Y MODO ENTRENAMIENTO GUIADO
 * ============================================================================
 * Proporciona una experiencia interactiva paso a paso para aprender todos los
 * controles de Futsal 64-Bit:
 * 1. Movimiento y Sprint
 * 2. Pases rasos a compañeros
 * 3. Disparo a portería y gol
 * 4. Barrida defensiva y recuperación limpia
 * 5. Cambio táctico de jugador
 * 
 * Al completar todas las lecciones, otorga una recompensa de 250 monedas 🪙.
 */

import { sound } from './audio.js';
import { clubManager } from './cards.js';
import { REWARD_RULES } from './economy.js';

/**
 * Definición de las lecciones del tutorial interactivo.
 */
export const TUTORIAL_STEPS = [
    {
        id: 'move',
        title: 'LECCIÓN 1: MOVIMIENTO Y VELOCIDAD',
        instruction: 'Mueve a tu jugador con [WASD] o [Joystick Táctil] y mantén [ESPACIO / L] o [SPRINT] para acelerar.',
        targetCount: 120, // Frames de movimiento requeridos
        progressText: (current, target) => `Progreso de carrera: ${Math.min(100, Math.round((current / target) * 100))}%`,
        hint: '¡Siente la fluidez de movimiento en la cancha grande 64-Bit!'
    },
    {
        id: 'pass',
        title: 'LECCIÓN 2: EL ARTE DEL PASE',
        instruction: 'Pasa el balón a un compañero usando la tecla [J] o el botón [🅰️ PASE].',
        targetCount: 3,
        progressText: (current, target) => `Pases completados: ${current} / ${target}`,
        hint: 'Apunta en dirección a tu compañero antes de pulsar pase.'
    },
    {
        id: 'shoot',
        title: 'LECCIÓN 3: DISPARO Y DEFINICIÓN',
        instruction: 'Conduce hacia la portería rival y dispara con [K] o [⚽ TIRO] para marcar un gol.',
        targetCount: 1,
        progressText: (current, target) => `Goles marcados: ${current} / ${target}`,
        hint: 'Cuanto más cerca del área y mejor perfilado, más potente será el disparo.'
    },
    {
        id: 'tackle',
        title: 'LECCIÓN 4: BARRIDA DEFENSIVA Y ROBO',
        instruction: 'Cuando no tengas el balón, acércate al rival y pulsa [U] o [🛡️ ROBO] para barrerte.',
        targetCount: 1,
        progressText: (current, target) => `Robos limpios: ${current} / ${target}`,
        hint: 'Evita barrerte por detrás para no cometer falta ni recibir tarjeta amarilla.'
    },
    {
        id: 'switch',
        title: 'LECCIÓN 5: CAMBIO TÁCTICO DE JUGADOR',
        instruction: 'Cambia el control al compañero más cercano al balón usando [ESPACIO] o [🔄 CAMBIO].',
        targetCount: 3,
        progressText: (current, target) => `Cambios realizados: ${current} / ${target}`,
        hint: 'Cambiar rápidamente al defensa adecuado te permite anticipar las jugadas del rival.'
    }
];

/**
 * Gestor del Modo Tutorial interactivo.
 */
export class TutorialManager {
    /**
     * Constructor del Tutorial.
     */
    constructor() {
        this.isActive = false;
        this.currentStepIndex = 0;
        this.stepProgress = 0;
        this.completed = false;
        this.onStepComplete = null;
        this.onTutorialFinish = null;
    }

    /**
     * Inicia el modo tutorial desde la primera lección.
     * @param {Function} onFinishCallback - Función ejecutada al completar todo el tutorial.
     */
    startTutorial(onFinishCallback = null) {
        this.isActive = true;
        this.currentStepIndex = 0;
        this.stepProgress = 0;
        this.completed = false;
        this.onTutorialFinish = onFinishCallback;
        sound.playWhistle('short');
        console.log('🎓 [Tutorial] Iniciando Modo Entrenamiento 64-Bit.');
    }

    /**
     * Obtiene los datos de la lección actual.
     * @returns {Object|null} Objeto con la información del paso actual.
     */
    getCurrentStep() {
        if (!this.isActive || this.currentStepIndex >= TUTORIAL_STEPS.length) return null;
        return TUTORIAL_STEPS[this.currentStepIndex];
    }

    /**
     * Registra un evento de acción del usuario (movimiento, pase, tiro, barrida, cambio)
     * y comprueba si se cumple el objetivo de la lección actual.
     * 
     * @param {string} actionType - 'move', 'pass', 'shoot', 'tackle', 'switch'.
     * @param {number} [amount=1] - Cantidad de progreso a añadir.
     */
    recordAction(actionType, amount = 1) {
        if (!this.isActive) return;

        const step = this.getCurrentStep();
        if (!step || step.id !== actionType) return;

        this.stepProgress += amount;

        // Comprobar si se ha alcanzado la meta del paso actual
        if (this.stepProgress >= step.targetCount) {
            this.advanceToNextStep();
        }
    }

    /**
     * Avanza a la siguiente lección o finaliza el tutorial con recompensas.
     */
    advanceToNextStep() {
        sound.playGoalCheer();
        this.currentStepIndex++;
        this.stepProgress = 0;

        if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
            // ¡Tutorial completado con éxito!
            this.completeTutorial();
        } else {
            console.log(`🎓 [Tutorial] Avanzando a Lección ${this.currentStepIndex + 1}: ${this.getCurrentStep().title}`);
        }
    }

    /**
     * Finaliza el tutorial, entrega las 250 monedas de recompensa y notifica.
     */
    completeTutorial() {
        this.isActive = false;
        this.completed = true;

        const reward = REWARD_RULES.TUTORIAL_COMPLETION;
        clubManager.addCoins(reward);
        sound.playPackOpening();

        console.log(`🎉 [Tutorial] ¡Felicitaciones! Has completado el entrenamiento 64-Bit. Ganaste +${reward} monedas.`);

        if (this.onTutorialFinish) {
            this.onTutorialFinish({
                coinsEarned: reward,
                message: '¡Excelente entrenamiento! Ya dominas la cancha 64-Bit.'
            });
        }
    }

    /**
     * Cancela o sale del modo tutorial volviendo al menú.
     */
    exitTutorial() {
        this.isActive = false;
        this.currentStepIndex = 0;
        this.stepProgress = 0;
    }
}

// Instancia global del tutorial
export const tutorialManager = new TutorialManager();
