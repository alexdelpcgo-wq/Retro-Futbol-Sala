/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - MÓDULO DE ROSTER Y REGISTRO DE JUGADORES PERSONALIZADOS
 * ============================================================================
 * Este archivo permite a cualquier programador agregar, modificar y registrar
 * jugadores y plantillas personalizadas en el juego directamente desde el código.
 * 
 * 🎮 CÓMO AGREGAR UN NUEVO JUGADOR COMO PROGRAMADOR:
 * --------------------------------------------------
 * Simplemente llama a la función `registerCustomPlayer()` pasando un objeto con
 * las propiedades deseadas (nombre, posición, estadísticas de 60 a 120, etc.).
 * 
 * Ejemplo de uso:
 * ```javascript
 * import { registerCustomPlayer } from './roster.js';
 * 
 * registerCustomPlayer({
 *     name: 'Mi Jugador Estrella',
 *     position: 'DEL', // 'POR', 'DEF', 'MC', 'DEL'
 *     nation: 'ES',    // 'BR', 'ES', 'AR', 'PT', 'FR', 'IT', 'JP', 'CO', etc.
 *     ovr: 115,        // Media global (60 - 120)
 *     stats: {
 *         vel: 118,    // Velocidad (60 - 120)
 *         tir: 115,    // Potencia y puntería de tiro (60 - 120)
 *         pas: 112,    // Precisión de pase (60 - 120)
 *         reg: 120,    // Regate y control de balón (60 - 120)
 *         def: 80,     // Capacidad de robo y barrida (60 - 120)
 *         fis: 100     // Resistencia y fuerza física (60 - 120)
 *     },
 *     skinColor: '#e0ac69', // Color hexadecimal de piel
 *     hairColor: '#1a1a1a', // Color hexadecimal de cabello
 *     specialMove: 'Rabona Eléctrica 64-Bit',
 *     rarity: 'icon'   // 'bronze', 'silver', 'gold', 'icon'
 * });
 * ```
 */

import { RARITIES, POSITIONS, NATIONS } from './database.js';

// Almacenamiento en memoria y clave local de jugadores personalizados
const CUSTOM_ROSTER_STORAGE_KEY = 'retro_futsal_custom_roster_64bit';

/**
 * Lista de jugadores personalizados registrados por el programador o creador.
 */
export const customRoster = [];

/**
 * Registra un nuevo jugador personalizado en el sistema.
 * Si el jugador es válido, se añade al catálogo global y se guarda para estar
 * disponible de inmediato en el juego y en el inventario del usuario.
 * 
 * @param {Object} playerConfig - Objeto con la configuración del jugador.
 * @param {string} playerConfig.name - Nombre visible del jugador (ej. "Carlos Crack").
 * @param {string} playerConfig.position - Posición: 'POR' (Portero), 'DEF' (Defensa), 'MC' (Medio), 'DEL' (Delantero).
 * @param {string} [playerConfig.nation='ES'] - Código de país ('BR', 'ES', 'AR', 'PT', 'FR', 'IT', 'JP', 'CO').
 * @param {number} [playerConfig.ovr=85] - Media global del jugador (rango 60 - 120).
 * @param {Object} [playerConfig.stats] - Estadísticas individuales (vel, tir, pas, reg, def, fis: 60-120).
 * @param {string} [playerConfig.skinColor='#f0c294'] - Color de piel en formato HEX.
 * @param {string} [playerConfig.hairColor='#1a1a1a'] - Color de pelo en formato HEX.
 * @param {string} [playerConfig.specialMove='Super Disparo 64-Bit'] - Nombre de la jugada especial.
 * @param {string} [playerConfig.rarity] - Rareza opcional: 'bronze', 'silver', 'gold', 'icon'.
 * @param {boolean} [addToInventory=true] - Si es true, añade automáticamente una copia al inventario activo.
 * @returns {Object} La carta de jugador creada y registrada.
 */
export function registerCustomPlayer(playerConfig, addToInventory = true) {
    if (!playerConfig || !playerConfig.name) {
        console.error('❌ Error en registerCustomPlayer: Debes especificar al menos un nombre para el jugador.');
        return null;
    }

    const pos = (playerConfig.position || 'DEL').toUpperCase();
    const validPos = POSITIONS[pos] ? pos : 'DEL';

    const ovr = Math.max(60, Math.min(120, playerConfig.ovr || 88));

    // Determinar rareza automática según la media si no se especifica
    let rarity = playerConfig.rarity;
    if (!rarity) {
        if (ovr >= 100) rarity = 'icon';
        else if (ovr >= 85) rarity = 'gold';
        else if (ovr >= 75) rarity = 'silver';
        else rarity = 'bronze';
    }

    // Estadísticas equilibradas por defecto si no se especifican todas
    const defaultStat = ovr;
    const stats = {
        vel: Math.max(60, Math.min(120, playerConfig.stats?.vel ?? defaultStat)),
        tir: Math.max(60, Math.min(120, playerConfig.stats?.tir ?? defaultStat)),
        pas: Math.max(60, Math.min(120, playerConfig.stats?.pas ?? defaultStat)),
        reg: Math.max(60, Math.min(120, playerConfig.stats?.reg ?? defaultStat)),
        def: Math.max(60, Math.min(120, playerConfig.stats?.def ?? defaultStat)),
        fis: Math.max(60, Math.min(120, playerConfig.stats?.fis ?? defaultStat))
    };

    const newPlayer = {
        id: playerConfig.id || `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: playerConfig.name.trim(),
        position: validPos,
        nation: playerConfig.nation || 'ES',
        ovr: ovr,
        stats: stats,
        rarity: rarity,
        skinColor: playerConfig.skinColor || '#f0c294',
        hairColor: playerConfig.hairColor || '#1a1a1a',
        specialMove: playerConfig.specialMove || 'Tiro Misil 64-Bit',
        isCustom: true,
        createdAt: Date.now()
    };

    // Agregar a la lista de custom roster si no existe ya
    const existingIndex = customRoster.findIndex(p => p.id === newPlayer.id || p.name.toLowerCase() === newPlayer.name.toLowerCase());
    if (existingIndex !== -1) {
        customRoster[existingIndex] = newPlayer;
    } else {
        customRoster.push(newPlayer);
    }

    saveCustomRoster();
    console.log(`✅ [Roster Dev] Jugador "${newPlayer.name}" (${newPlayer.position} - ${newPlayer.ovr} OVR) registrado con éxito.`);

    return newPlayer;
}

/**
 * Registra un equipo completo de 5 jugadores personalizados de una sola vez.
 * 
 * @param {string} teamName - Nombre del equipo (ej. "Los Cyber Ninjas 64").
 * @param {Array<Object>} playersArray - Arreglo de 5 configuraciones de jugador [POR, DEF, MC, DEL, DEL].
 * @returns {Array<Object>} Arreglo de las 5 cartas registradas.
 */
export function registerCustomSquad(teamName, playersArray) {
    if (!Array.isArray(playersArray) || playersArray.length < 5) {
        console.warn('⚠️ registerCustomSquad: Se recomienda proveer exactamente 5 jugadores [POR, DEF, MC, DEL, DEL].');
    }

    const registeredSquad = [];
    playersArray.forEach((config, idx) => {
        const fallbackPos = ['POR', 'DEF', 'MC', 'DEL', 'DEL'][idx] || 'DEL';
        const card = registerCustomPlayer({
            ...config,
            position: config.position || fallbackPos
        });
        if (card) registeredSquad.push(card);
    });

    console.log(`🏆 [Roster Dev] Plantilla completa "${teamName}" registrada con ${registeredSquad.length} jugadores.`);
    return registeredSquad;
}

/**
 * Carga los jugadores personalizados almacenados en LocalStorage.
 */
export function loadCustomRoster() {
    try {
        const saved = localStorage.getItem(CUSTOM_ROSTER_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                customRoster.length = 0;
                customRoster.push(...parsed);
                console.log(`📂 [Roster Dev] Se cargaron ${customRoster.length} jugadores personalizados.`);
            }
        }
    } catch (e) {
        console.error('Error al cargar custom roster:', e);
    }
}

/**
 * Guarda los jugadores personalizados en LocalStorage.
 */
export function saveCustomRoster() {
    try {
        localStorage.setItem(CUSTOM_ROSTER_STORAGE_KEY, JSON.stringify(customRoster));
    } catch (e) {
        console.error('Error al guardar custom roster:', e);
    }
}

/**
 * Elimina un jugador personalizado del roster por su ID.
 * 
 * @param {string} playerId - ID único del jugador.
 * @returns {boolean} True si se eliminó con éxito.
 */
export function deleteCustomPlayer(playerId) {
    const idx = customRoster.findIndex(p => p.id === playerId);
    if (idx !== -1) {
        const deleted = customRoster.splice(idx, 1);
        saveCustomRoster();
        console.log(`🗑️ [Roster Dev] Jugador "${deleted[0].name}" eliminado.`);
        return true;
    }
    return false;
}

/**
 * Exporta el catálogo actual de jugadores personalizados a formato JSON legible.
 * 
 * @returns {string} Cadena JSON formateada.
 */
export function exportRosterJSON() {
    return JSON.stringify(customRoster, null, 2);
}

/**
 * Importa una lista de jugadores desde una cadena JSON.
 * 
 * @param {string} jsonString - Cadena en formato JSON con la lista de jugadores.
 * @returns {number} Número de jugadores importados exitosamente.
 */
export function importRosterJSON(jsonString) {
    try {
        const list = JSON.parse(jsonString);
        if (Array.isArray(list)) {
            let count = 0;
            list.forEach(item => {
                if (item.name && item.position) {
                    registerCustomPlayer(item);
                    count++;
                }
            });
            return count;
        }
    } catch (e) {
        console.error('Error al importar roster JSON:', e);
    }
    return 0;
}

/**
 * Genera una plantilla de código JavaScript lista para copiar y pegar,
 * permitiendo a los programadores crear fácilmente nuevos jugadores.
 * 
 * @returns {string} Código de ejemplo en JavaScript.
 */
export function getDeveloperCodeTemplate() {
    return `// ==========================================
// EJEMPLO DE CÓDIGO PARA AGREGAR JUGADOR DEV:
// ==========================================
import { registerCustomPlayer } from './src/roster.js';

registerCustomPlayer({
    name: "Alex 'El Francotirador'",
    position: "DEL",       // 'POR', 'DEF', 'MC', 'DEL'
    nation: "ES",          // 'BR', 'ES', 'AR', 'PT', 'FR', 'IT', 'JP', 'CO'
    ovr: 118,              // Media global (60 - 120)
    stats: {
        vel: 116,          // Velocidad
        tir: 120,          // Tiro Letal
        pas: 110,          // Pases
        reg: 118,          // Regate
        def: 75,           // Defensa
        fis: 98            // Físico
    },
    skinColor: "#f7d6bf",  // Tono de piel
    hairColor: "#d4af37",  // Cabello Rubio/Dorado
    specialMove: "Cañonazo 64-Bit Teledirigido",
    rarity: "icon"         // 'bronze', 'silver', 'gold', 'icon'
});`;
}

// Inicializar y cargar el roster persistente al importar el módulo
loadCustomRoster();

// ============================================================================
// JUGADORES POR DEFECTO CREADOS COMO EJEMPLO PARA EL PROGRAMADOR:
// ============================================================================
if (customRoster.length === 0) {
    registerCustomPlayer({
        id: 'dev_player_neo_striker',
        name: 'Neo Striker 64',
        position: 'DEL',
        nation: 'JP',
        ovr: 116,
        stats: { vel: 120, tir: 118, pas: 105, reg: 119, def: 70, fis: 95 },
        skinColor: '#f7d6bf',
        hairColor: '#3b82f6',
        specialMove: 'Disparo Meteoro 64',
        rarity: 'icon'
    });

    registerCustomPlayer({
        id: 'dev_player_cyber_wall',
        name: 'Cyber Muro 64',
        position: 'DEF',
        nation: 'AR',
        ovr: 114,
        stats: { vel: 108, tir: 95, pas: 110, reg: 102, def: 120, fis: 120 },
        skinColor: '#e0ac69',
        hairColor: '#1a1a1a',
        specialMove: 'Bloqueo Imparable',
        rarity: 'icon'
    });
}
