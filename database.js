/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - BASE DE DATOS DE JUGADORES, NACIONES Y CARTAS
 * ============================================================================
 * Administra las definiciones de posiciones, rarezas, selecciones nacionales,
 * cartas legendarias predefinidas (OVR 100 - 120) y algoritmos generativos.
 */

import { customRoster } from './roster.js';

/**
 * Posiciones oficiales de Futsal 5v5 con sus códigos y colores temáticos.
 */
export const POSITIONS = {
    POR: { code: 'POR', name: 'Portero', color: '#f59e0b', role: 'Guardián del arco y achiques' },
    DEF: { code: 'DEF', name: 'Defensa (Cierre)', color: '#3b82f6', role: 'Líder defensivo y recuperaciones' },
    MC:  { code: 'MC',  name: 'Medio (Ala / Organizador)', color: '#10b981', role: 'Distribución y creación de juego' },
    DEL: { code: 'DEL', name: 'Delantero (Pívot)', color: '#ef4444', role: 'Definición letal y desmarques' }
};

/**
 * Categorías de Rareza de Cartas y rangos de Media Global (OVR 60 - 120).
 */
export const RARITIES = {
    BRONZE: { code: 'bronze', name: 'Bronce', minOvr: 60, maxOvr: 74, color: '#cd7f32', border: '#8b4513', glow: 'rgba(205, 127, 50, 0.4)' },
    SILVER: { code: 'silver', name: 'Plata', minOvr: 75, maxOvr: 84, color: '#e0e0e0', border: '#a0a0a0', glow: 'rgba(224, 224, 224, 0.4)' },
    GOLD:   { code: 'gold',   name: 'Oro',   minOvr: 85, maxOvr: 99, color: '#facc15', border: '#b45309', glow: 'rgba(250, 204, 21, 0.6)' },
    ICON:   { code: 'icon',   name: 'Leyenda 64-Bit', minOvr: 100, maxOvr: 120, color: '#a855f7', border: '#6366f1', glow: 'rgba(168, 85, 247, 0.8)' }
};

/**
 * Países disponibles para selecciones y jugadores con sus colores de equipación.
 */
export const NATIONS = [
    { code: 'BR', name: 'Brasil', flag: '🇧🇷', primaryColor: '#fde047', secondaryColor: '#15803d' },
    { code: 'ES', name: 'España', flag: '🇪🇸', primaryColor: '#dc2626', secondaryColor: '#eab308' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', primaryColor: '#7dd3fc', secondaryColor: '#ffffff' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', primaryColor: '#991b1b', secondaryColor: '#166534' },
    { code: 'FR', name: 'Francia', flag: '🇫🇷', primaryColor: '#1d4ed8', secondaryColor: '#ffffff' },
    { code: 'IT', name: 'Italia', flag: '🇮🇹', primaryColor: '#2563eb', secondaryColor: '#ffffff' },
    { code: 'JP', name: 'Japón', flag: '🇯🇵', primaryColor: '#1e3a8a', secondaryColor: '#dc2626' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', primaryColor: '#eab308', secondaryColor: '#1d4ed8' }
];

/**
 * Cartas Legendarias e Íconos Históricos de Futsal (Estadísticas 100 - 120).
 */
export const LEGEND_PLAYERS = [
    {
        id: 'leg_falcao',
        name: 'Falcão 12',
        position: 'DEL',
        nation: 'BR',
        ovr: 120,
        stats: { pas: 118, tir: 120, vel: 115, reg: 120, def: 85, fis: 95 },
        rarity: 'icon',
        skinColor: '#d4a373',
        hairColor: '#3a2010',
        specialMove: 'Lambretta Cósmica & Rabona'
    },
    {
        id: 'leg_ricardinho',
        name: 'Ricardinho O Mágico',
        position: 'MC',
        nation: 'PT',
        ovr: 119,
        stats: { pas: 120, tir: 116, vel: 118, reg: 120, def: 88, fis: 92 },
        rarity: 'icon',
        skinColor: '#f0c294',
        hairColor: '#1a1a1a',
        specialMove: 'Elástico Galáctico 64'
    },
    {
        id: 'leg_ronaldinho',
        name: 'Ronaldinho Gaucho',
        position: 'DEL',
        nation: 'BR',
        ovr: 118,
        stats: { pas: 116, tir: 115, vel: 114, reg: 120, def: 80, fis: 96 },
        rarity: 'icon',
        skinColor: '#8d5524',
        hairColor: '#111111',
        specialMove: 'No-Look Pass & Espuela'
    },
    {
        id: 'leg_higuita',
        name: 'René Higuita',
        position: 'POR',
        nation: 'CO',
        ovr: 115,
        stats: { pas: 105, tir: 110, vel: 100, reg: 105, def: 98, fis: 120 },
        rarity: 'icon',
        skinColor: '#c68642',
        hairColor: '#111111',
        specialMove: 'Escorpión Volador'
    },
    {
        id: 'leg_kike',
        name: 'Kike Boned',
        position: 'DEF',
        nation: 'ES',
        ovr: 116,
        stats: { pas: 112, tir: 105, vel: 108, reg: 104, def: 120, fis: 118 },
        rarity: 'icon',
        skinColor: '#f7d6bf',
        hairColor: '#2b1d0c',
        specialMove: 'Cierre de Hierro Impenetrable'
    },
    {
        id: 'leg_maradona',
        name: 'Diego D10S',
        position: 'MC',
        nation: 'AR',
        ovr: 120,
        stats: { pas: 120, tir: 118, vel: 112, reg: 120, def: 82, fis: 102 },
        rarity: 'icon',
        skinColor: '#e0ac69',
        hairColor: '#111111',
        specialMove: 'Gambeta Divina & Mano de Dios'
    },
    {
        id: 'leg_ferrao',
        name: 'Ferrao La Pantera',
        position: 'DEL',
        nation: 'BR',
        ovr: 114,
        stats: { pas: 100, tir: 120, vel: 108, reg: 112, def: 82, fis: 120 },
        rarity: 'icon',
        skinColor: '#8d5524',
        hairColor: '#111111',
        specialMove: 'Giro de Pívot Imparable'
    },
    {
        id: 'leg_guitta',
        name: 'Guitta',
        position: 'POR',
        nation: 'BR',
        ovr: 116,
        stats: { pas: 110, tir: 98, vel: 95, reg: 90, def: 95, fis: 120 },
        rarity: 'icon',
        skinColor: '#f0c294',
        hairColor: '#3a2010',
        specialMove: 'Muro Aéreo Reflejo 64'
    }
];

const FIRST_NAMES = [
    'Carlos', 'Mateo', 'Lucas', 'Santiago', 'Javier', 'Diego', 'Neymar', 'Bruno', 'Leo', 'Hugo',
    'Rodrigo', 'Sergio', 'Marcos', 'Tiago', 'Gabriel', 'Alejandro', 'Enzo', 'Joaquín', 'Rafael', 'Felipe',
    'Pablo', 'Kenji', 'Daisuke', 'Antoine', 'Kylian', 'Gianluigi', 'Paolo', 'Franco', 'Alex', 'Adrián'
];

const LAST_NAMES = [
    'Silva', 'López', 'Martínez', 'García', 'Santos', 'Fernández', 'Rodríguez', 'Costa', 'Gómez', 'Pereira',
    'Sánchez', 'Pérez', 'Torres', 'Romero', 'Álvarez', 'Morales', 'Suárez', 'Ramos', 'Navarro', 'Benítez',
    'Tanaka', 'Sato', 'Dubois', 'Moreau', 'Rossi', 'Ferrari', 'Conti', 'Hernández', 'Díaz', 'Vargas'
];

const SKIN_TONES = ['#f7d6bf', '#f0c294', '#e0ac69', '#d4a373', '#c68642', '#8d5524', '#5c3317'];
const HAIR_TONES = ['#1a1a1a', '#3a2010', '#593e1a', '#8a622a', '#d4af37', '#880808', '#silver'];

let generatedCounter = 1;

/**
 * Genera una carta de jugador de forma procedural con estadísticas entre minOvr y maxOvr.
 * 
 * @param {string|null} [forcedPosition=null] - Posición forzada ('POR', 'DEF', 'MC', 'DEL') o aleatoria.
 * @param {number} [minOvr=60] - Media mínima generada (60 a 120).
 * @param {number} [maxOvr=99] - Media máxima generada (60 a 120).
 * @returns {Object} Objeto carta de jugador generado.
 */
export function generateRandomPlayer(forcedPosition = null, minOvr = 60, maxOvr = 99) {
    const positionKeys = Object.keys(POSITIONS);
    const position = forcedPosition || positionKeys[Math.floor(Math.random() * positionKeys.length)];

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const nation = NATIONS[Math.floor(Math.random() * NATIONS.length)];

    const targetOvr = Math.floor(Math.random() * (maxOvr - minOvr + 1)) + minOvr;

    // Calcular estadísticas equilibradas según la posición
    const stats = calculateStatsForPosition(position, targetOvr);

    // Determinar rareza
    let rarity = 'bronze';
    if (targetOvr >= 100) rarity = 'icon';
    else if (targetOvr >= 85) rarity = 'gold';
    else if (targetOvr >= 75) rarity = 'silver';

    return {
        id: `gen_${Date.now()}_${generatedCounter++}`,
        name: `${firstName} ${lastName}`,
        position: position,
        nation: nation.code,
        ovr: targetOvr,
        stats: stats,
        rarity: rarity,
        skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
        hairColor: HAIR_TONES[Math.floor(Math.random() * HAIR_TONES.length)],
        specialMove: getSpecialMoveForPosition(position, targetOvr)
    };
}

/**
 * Calcula el reparto de estadísticas según la posición y la media global deseada.
 * 
 * @param {string} position - 'POR', 'DEF', 'MC', 'DEL'.
 * @param {number} targetOvr - Media global de 60 a 120.
 * @returns {Object} Objeto con las 6 estadísticas (pas, tir, vel, reg, def, fis).
 */
function calculateStatsForPosition(position, targetOvr) {
    const rnd = (variance = 6) => Math.floor((Math.random() - 0.5) * variance * 2);
    const clamp = (val) => Math.max(60, Math.min(120, Math.round(val)));

    switch (position) {
        case 'POR':
            return {
                def: clamp(targetOvr + 4 + rnd()),
                fis: clamp(targetOvr + 2 + rnd()),
                pas: clamp(targetOvr - 6 + rnd()),
                vel: clamp(targetOvr - 8 + rnd()),
                reg: clamp(targetOvr - 12 + rnd()),
                tir: clamp(targetOvr - 16 + rnd())
            };
        case 'DEF':
            return {
                def: clamp(targetOvr + 6 + rnd()),
                fis: clamp(targetOvr + 4 + rnd()),
                pas: clamp(targetOvr - 2 + rnd()),
                vel: clamp(targetOvr + rnd()),
                reg: clamp(targetOvr - 4 + rnd()),
                tir: clamp(targetOvr - 8 + rnd())
            };
        case 'MC':
            return {
                pas: clamp(targetOvr + 5 + rnd()),
                reg: clamp(targetOvr + 4 + rnd()),
                vel: clamp(targetOvr + 2 + rnd()),
                tir: clamp(targetOvr + rnd()),
                def: clamp(targetOvr - 2 + rnd()),
                fis: clamp(targetOvr - 3 + rnd())
            };
        case 'DEL':
        default:
            return {
                tir: clamp(targetOvr + 6 + rnd()),
                reg: clamp(targetOvr + 5 + rnd()),
                vel: clamp(targetOvr + 4 + rnd()),
                pas: clamp(targetOvr - 2 + rnd()),
                fis: clamp(targetOvr + rnd()),
                def: clamp(targetOvr - 12 + rnd())
            };
    }
}

/**
 * Obtiene un nombre dinámico para el movimiento especial del jugador.
 * 
 * @param {string} position - 'POR', 'DEF', 'MC', 'DEL'.
 * @param {number} ovr - Media global del jugador.
 * @returns {string} Nombre del movimiento especial.
 */
function getSpecialMoveForPosition(position, ovr) {
    if (ovr >= 100) return 'Tiro Galáctico 64-Bit';
    const moves = {
        POR: ['Vuelo Felino', 'Parada Imposible', 'Mano Salvadora', 'Salida Rápida'],
        DEF: ['Barrida Quirúrgica', 'Muro Defensivo', 'Intercepción Clave', 'Corte Limpio'],
        MC:  ['Pase Teledirigido', 'Ruleta Marsellesa', 'Visión 360', 'Regate Corto'],
        DEL: ['Cañonazo a la Escuadra', 'Punterazo Relámpago', 'Vaselina Sutil', 'Tiro con Efecto']
    };
    const list = moves[position] || moves.DEL;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Genera la plantilla titular inicial para nuevos jugadores (5 cartas equilibradas).
 * Incluye jugadores personalizados si existen.
 * 
 * @returns {Array<Object>} Arreglo con 5 cartas: [POR, DEF, MC, DEL, DEL].
 */
export function generateStarterSquad() {
    // Si el programador registró jugadores personalizados, dar prioridad
    const devGk = customRoster.find(p => p.position === 'POR');
    const devDef = customRoster.find(p => p.position === 'DEF');
    const devMc = customRoster.find(p => p.position === 'MC');
    const devDel = customRoster.filter(p => p.position === 'DEL');

    return [
        devGk || generateRandomPlayer('POR', 72, 80),
        devDef || generateRandomPlayer('DEF', 74, 82),
        devMc || generateRandomPlayer('MC', 75, 84),
        devDel[0] || generateRandomPlayer('DEL', 76, 85),
        devDel[1] || generateRandomPlayer('DEL', 73, 82)
    ];
}

/**
 * Genera cartas obtenidas al abrir un sobre de la tienda (Gacha Pack).
 * 
 * @param {string} packType - 'standard' (Bronce/Plata), 'premium' (Oro/Icon), 'legend' (Sobres de Leyendas).
 * @returns {Array<Object>} Arreglo de 3 cartas extraídas del sobre.
 */
export function generatePackCards(packType = 'standard') {
    const cards = [];
    const count = 3;

    for (let i = 0; i < count; i++) {
        const positions = ['POR', 'DEF', 'MC', 'DEL'];
        const pos = positions[Math.floor(Math.random() * positions.length)];

        if (packType === 'legend') {
            // Alta probabilidad de ícono histórico o jugador dev de media alta
            const legendPool = [...LEGEND_PLAYERS, ...customRoster.filter(p => p.ovr >= 100)];
            const legend = legendPool[Math.floor(Math.random() * legendPool.length)];
            cards.push({ ...legend, id: `pack_leg_${Date.now()}_${i}` });
        } else if (packType === 'premium') {
            // Cartas Oro o Leyenda (85 - 120 OVR)
            if (Math.random() < 0.28) {
                const legendPool = [...LEGEND_PLAYERS, ...customRoster.filter(p => p.ovr >= 100)];
                const legend = legendPool[Math.floor(Math.random() * legendPool.length)];
                cards.push({ ...legend, id: `pack_prem_${Date.now()}_${i}` });
            } else {
                cards.push(generateRandomPlayer(pos, 85, 99));
            }
        } else {
            // Sobre Estándar (Bronce, Plata y opción de Oro)
            const minOvr = 65;
            const maxOvr = Math.random() < 0.20 ? 88 : 78;
            cards.push(generateRandomPlayer(pos, minOvr, maxOvr));
        }
    }

    return cards;
}
