/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MÓDULO DE ECONOMÍA Y RECOMPENSAS DE MONEDAS
 * ============================================================================
 * Gestiona el cálculo y entrega de monedas (Coins) ganadas en el juego:
 * - Victoria en partido (según dificultad)
 * - Empates y derrotas de consolación
 * - Goles anotados en el encuentro
 * - Bonificación por Portería a Cero (Clean Sheet)
 * - Recompensas por completar el Tutorial y misiones
 * - Registro de eventos y notificaciones flotantes de monedas
 */

export const REWARD_RULES = {
    // Monedas base por resultado del partido
    MATCH_WIN_EASY: 150,
    MATCH_WIN_NORMAL: 200,
    MATCH_WIN_HARD: 260,
    MATCH_WIN_LEGEND: 350,
    MATCH_DRAW: 80,
    MATCH_LOSS: 40,

    // Bonificaciones extra durante el partido
    GOAL_SCORED: 35,          // Por cada gol anotado por el usuario
    CLEAN_SHEET_BONUS: 100,   // Si el rival no anota ningún gol
    HATTRICK_BONUS: 75,       // Si un solo jugador marca 3 o más goles
    TUTORIAL_COMPLETION: 250, // Por completar el modo tutorial completo
    DAILY_MISSION: 120        // Por desafíos diarios
};

/**
 * Clase que gestiona los cálculos económicos y las recompensas del jugador.
 */
export class EconomyManager {
    /**
     * Constructor del gestor de economía.
     * @param {Function} onCoinsEarnedCallback - Función callback ejecutada al ganar monedas.
     */
    constructor(onCoinsEarnedCallback = null) {
        this.onCoinsEarned = onCoinsEarnedCallback;
        this.activeNotifications = [];
    }

    /**
     * Calcula el desglose completo de monedas al finalizar un partido de futsal.
     * 
     * @param {Object} matchResult - Resumen del partido jugado.
     * @param {number} matchResult.userScore - Goles del usuario (Equipo 1).
     * @param {number} matchResult.cpuScore - Goles del rival (Equipo 2).
     * @param {string} matchResult.difficulty - Dificultad: 'easy', 'normal', 'hard', 'legend'.
     * @param {Object} [matchResult.stats] - Estadísticas del partido (tiros, posesión, faltas).
     * @returns {Object} Desglose detallado con totalCoins y lista de items ganados.
     */
    calculateMatchRewards(matchResult) {
        const { userScore, cpuScore, difficulty = 'normal' } = matchResult;
        let totalCoins = 0;
        const breakdown = [];

        // 1. Recompensa base por resultado
        let baseCoins = REWARD_RULES.MATCH_LOSS;
        let resultLabel = 'Partipación en Partido';

        if (userScore > cpuScore) {
            // Victoria según dificultad
            switch (difficulty) {
                case 'easy':
                    baseCoins = REWARD_RULES.MATCH_WIN_EASY;
                    break;
                case 'hard':
                    baseCoins = REWARD_RULES.MATCH_WIN_HARD;
                    break;
                case 'legend':
                    baseCoins = REWARD_RULES.MATCH_WIN_LEGEND;
                    break;
                case 'normal':
                default:
                    baseCoins = REWARD_RULES.MATCH_WIN_NORMAL;
                    break;
            }
            resultLabel = `🏆 Victoria (${difficulty.toUpperCase()})`;
        } else if (userScore === cpuScore) {
            baseCoins = REWARD_RULES.MATCH_DRAW;
            resultLabel = '🤝 Empate en Futsal';
        }

        totalCoins += baseCoins;
        breakdown.push({ label: resultLabel, amount: baseCoins, icon: '🪙' });

        // 2. Bonificación por goles marcados
        if (userScore > 0) {
            const goalCoins = userScore * REWARD_RULES.GOAL_SCORED;
            totalCoins += goalCoins;
            breakdown.push({
                label: `⚽ Goles Anotados (${userScore}x +${REWARD_RULES.GOAL_SCORED})`,
                amount: goalCoins,
                icon: '⚽'
            });
        }

        // 3. Bonificación por portería imbatida (Clean Sheet)
        if (cpuScore === 0 && userScore > 0) {
            totalCoins += REWARD_RULES.CLEAN_SHEET_BONUS;
            breakdown.push({
                label: '🛡️ Portería a Cero (Clean Sheet)',
                amount: REWARD_RULES.CLEAN_SHEET_BONUS,
                icon: '🧤'
            });
        }

        // 4. Bonificación por Hat-Trick o goleada
        if (userScore >= 3) {
            totalCoins += REWARD_RULES.HATTRICK_BONUS;
            breakdown.push({
                label: '🔥 Goleada Imparable (+3 Goles)',
                amount: REWARD_RULES.HATTRICK_BONUS,
                icon: '🌟'
            });
        }

        return {
            totalCoins,
            breakdown
        };
    }

    /**
     * Genera una lista explicativa de todas las formas de ganar monedas en el juego.
     * Útil para mostrar al usuario en el modal "¿Cómo ganar monedas?".
     * 
     * @returns {Array<Object>} Lista de métodos para ganar monedas.
     */
    getWaysToEarnCoinsGuide() {
        return [
            {
                title: 'Ganar Partidos VS Máquina / Amigos',
                description: 'Supera al rival en la cancha. Cuanto mayor sea la dificultad (Novato, Normal, Clase Mundial, Leyenda), mayor será el botín.',
                rewardText: `+${REWARD_RULES.MATCH_WIN_NORMAL} a +${REWARD_RULES.MATCH_WIN_LEGEND} 🪙`,
                icon: '🏆'
            },
            {
                title: 'Anotar Goles en la Cancha',
                description: 'Cada gol que marques en tiempo reglamentario te otorga una bonificación directa de monedas.',
                rewardText: `+${REWARD_RULES.GOAL_SCORED} 🪙 por cada Gol`,
                icon: '⚽'
            },
            {
                title: 'Mantener la Portería a Cero (Clean Sheet)',
                description: 'Defiende con tu portero y cierres para no recibir ningún gol en contra durante el partido.',
                rewardText: `+${REWARD_RULES.CLEAN_SHEET_BONUS} 🪙 extra`,
                icon: '🧤'
            },
            {
                title: 'Completar el Modo Tutorial 64-Bit',
                description: 'Aprende los movimientos básicos y avanzados (pases, tiros potentes, barridas y cambio de jugador).',
                rewardText: `+${REWARD_RULES.TUTORIAL_COMPLETION} 🪙 al finalizar`,
                icon: '🎓'
            },
            {
                title: 'Goleadas y Hat-Tricks',
                description: 'Anota 3 o más goles en un solo encuentro para recibir una bonificación de espectáculo.',
                rewardText: `+${REWARD_RULES.HATTRICK_BONUS} 🪙 de show`,
                icon: '🔥'
            }
        ];
    }
}

// Instancia global del gestor de economía
export const economyManager = new EconomyManager();
