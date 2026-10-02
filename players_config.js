/**
 * =========================================================================================
 * ⚽ RETRO FUTSAL 64-BIT - CONFIGURACIÓN Y CATÁLOGO DE JUGADORES POR CÓDIGO ⚽
 * =========================================================================================
 * ¡Bienvenido! Este archivo es el único lugar donde necesitas entrar para personalizar,
 * crear o modificar a todos los jugadores del juego.
 * 
 * =========================================================================================
 * 📖 GUÍA RÁPIDA: CÓMO REALIZAR CAMBIOS EN ESTE ARCHIVO
 * =========================================================================================
 * 
 * -----------------------------------------------------------------------------------------
 * 1️⃣ ¿CÓMO CAMBIAR EL NOMBRE DE UN JUGADOR EXISTENTE?
 * -----------------------------------------------------------------------------------------
 * Busca el jugador que quieras modificar abajo (en `STARTER_SQUAD`, `LEGEND_PLAYERS` o `CUSTOM_PLAYERS`)
 * y cambia el valor de la propiedad `name`:
 * 
 *   Ejemplo:
 *   name: "Carlos Crack",    <--- ¡Cambia el texto entre comillas por el nombre que desees!
 * 
 * -----------------------------------------------------------------------------------------
 * 2️⃣ ¿CÓMO MODIFICAR LAS ESTADÍSTICAS DE UN JUGADOR?
 * -----------------------------------------------------------------------------------------
 * Cada jugador tiene una media global (`ovr`) de 60 a 120, y 6 estadísticas individuales:
 * 
 *   ovr: 115,   // MEDIA GLOBAL DEL JUGADOR (Rango oficial: 60 a 120)
 *   stats: {
 *       vel: 118,  // VELOCIDAD: Rapidez de carrera y aceleración (60 - 120)
 *       tir: 115,  // TIRO: Potencia y puntería de los disparos a portería (60 - 120)
 *       pas: 112,  // PASE: Precisión y velocidad en pases rasos al pie (60 - 120)
 *       reg: 120,  // REGATE: Agilidad, control de balón y cambio de ritmo (60 - 120)
 *       def: 80,   // DEFENSA: Capacidad de robo de balón y barrida limpia (60 - 120)
 *       fis: 100   // FÍSICO / PARADAS: Resistencia, fuerza y reflejos de arquero (60 - 120)
 *   }
 * 
 * -----------------------------------------------------------------------------------------
 * 3️⃣ ¿CÓMO CAMBIAR LA POSICIÓN, PAÍS O APARIENCIA?
 * -----------------------------------------------------------------------------------------
 * - position: Posición en la cancha:
 *       'POR' -> Portero (Guardián bajo los palos)
 *       'DEF' -> Defensa / Cierre (Muro defensivo)
 *       'MC'  -> Medio Centro / Ala (Creador de juego y pasador)
 *       'DEL' -> Delantero / Pívot (Goleador letal)
 * 
 * - nation: País / Selección del jugador:
 *       'BR' -> 🇧🇷 Brasil       'ES' -> 🇪🇸 España
 *       'AR' -> 🇦🇷 Argentina    'PT' -> 🇵🇹 Portugal
 *       'FR' -> 🇫🇷 Francia      'IT' -> 🇮🇹 Italia
 *       'JP' -> 🇯🇵 Japón        'CO' -> 🇨🇴 Colombia
 * 
 * - skinColor: Color de piel en formato hexadecimal (ej. '#f0c294', '#8d5524', '#f7d6bf')
 * - hairColor: Color de pelo en formato hexadecimal (ej. '#1a1a1a', '#3a2010', '#d4af37')
 * - specialMove: Nombre del tiro o regate especial (ej. 'Cañonazo 64-Bit')
 * - rarity: Categoría de la carta:
 *       'bronze' -> Bronce (OVR 60 - 74)
 *       'silver' -> Plata (OVR 75 - 84)
 *       'gold'   -> Oro (OVR 85 - 99)
 *       'icon'   -> Leyenda 64-Bit (OVR 100 - 120)
 * 
 * -----------------------------------------------------------------------------------------
 * 4️⃣ ¿CÓMO AGREGAR UN NUEVO JUGADOR AL JUEGO?
 * -----------------------------------------------------------------------------------------
 * Simplemente copia el siguiente bloque y pégalo dentro del arreglo `CUSTOM_PLAYERS` (abajo en la sección 3):
 * 
 *   {
 *       id: 'mi_jugador_estrella',
 *       name: 'Tu Nombre Aquí',
 *       position: 'DEL',       // 'POR', 'DEF', 'MC', 'DEL'
 *       nation: 'ES',          // 'BR', 'ES', 'AR', 'PT', 'FR', 'IT', 'JP', 'CO'
 *       ovr: 118,              // Media global (60 - 120)
 *       stats: {
 *           vel: 118,
 *           tir: 120,
 *           pas: 110,
 *           reg: 119,
 *           def: 75,
 *           fis: 98
 *       },
 *       skinColor: '#f0c294',
 *       hairColor: '#1a1a1a',
 *       specialMove: 'Misil Teledirigido 64-Bit',
 *       rarity: 'icon'
 *   },
 * =========================================================================================
 */

(function(window) {
    'use strict';

    window.PLAYERS_CONFIG = {

        // =====================================================================================
        // SECCIÓN 1: PLANTILLA TITULAR INICIAL (5 JUGADORES: POR, DEF, MC, DEL, DEL)
        // =====================================================================================
        // Estos son los 5 jugadores con los que empiezas a jugar de forma predeterminada.
        // ¡Puedes editar sus nombres, posiciones o estadísticas libremente aquí mismo!
        // =====================================================================================
        STARTER_SQUAD: [
            {
                id: 'starter_gk',
                name: 'Hugo "El Muro" Ramos',
                position: 'POR',        // Portero
                nation: 'ES',           // España
                ovr: 88,
                stats: { vel: 85, tir: 65, pas: 80, reg: 70, def: 88, fis: 94 },
                skinColor: '#f7d6bf',
                hairColor: '#1a1a1a',
                specialMove: 'Parada Reflejo 64',
                rarity: 'gold'
            },
            {
                id: 'starter_def',
                name: 'Marcos "La Roca" Costa',
                position: 'DEF',        // Defensa / Cierre
                nation: 'BR',           // Brasil
                ovr: 89,
                stats: { vel: 87, tir: 78, pas: 85, reg: 82, def: 94, fis: 92 },
                skinColor: '#8d5524',
                hairColor: '#111111',
                specialMove: 'Barrida de Hierro',
                rarity: 'gold'
            },
            {
                id: 'starter_mc',
                name: 'Mateo "El Cerebro" Silva',
                position: 'MC',         // Medio Centro / Organizador
                nation: 'AR',           // Argentina
                ovr: 91,
                stats: { vel: 90, tir: 88, pas: 95, reg: 93, def: 82, fis: 86 },
                skinColor: '#f0c294',
                hairColor: '#3a2010',
                specialMove: 'Pase Filtrado Magistral',
                rarity: 'gold'
            },
            {
                id: 'starter_del1',
                name: 'Alex "El Rayo" Morales',
                position: 'DEL',        // Delantero / Pívot 1
                nation: 'ES',           // España
                ovr: 93,
                stats: { vel: 96, tir: 95, pas: 88, reg: 94, def: 70, fis: 88 },
                skinColor: '#e0ac69',
                hairColor: '#d4af37',
                specialMove: 'Zurdazo a la Escuadra',
                rarity: 'gold'
            },
            {
                id: 'starter_del2',
                name: 'Gabriel "El Mágico" Santos',
                position: 'DEL',        // Delantero / Pívot 2
                nation: 'BR',           // Brasil
                ovr: 92,
                stats: { vel: 95, tir: 92, pas: 90, reg: 97, def: 68, fis: 85 },
                skinColor: '#8d5524',
                hairColor: '#1a1a1a',
                specialMove: 'Doble Bicicleta Eléctrica',
                rarity: 'gold'
            }
        ],

        // =====================================================================================
        // SECCIÓN 2: LEYENDAS HISTÓRICAS DEL FUTSAL (OVR 100 - 120)
        // =====================================================================================
        // Disponibles en los Sobres de Leyendas o para asignar a tu equipo en cualquier momento.
        // =====================================================================================
        LEGEND_PLAYERS: [
            {
                id: 'leg_falcao',
                name: 'Falcão 12',
                position: 'DEL',
                nation: 'BR',
                ovr: 120,
                stats: { vel: 116, tir: 120, pas: 118, reg: 120, def: 85, fis: 96 },
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
                stats: { vel: 118, tir: 116, pas: 120, reg: 120, def: 88, fis: 92 },
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
                stats: { vel: 114, tir: 115, pas: 116, reg: 120, def: 80, fis: 96 },
                rarity: 'icon',
                skinColor: '#8d5524',
                hairColor: '#111111',
                specialMove: 'Pase sin Mirar & Espuela'
            },
            {
                id: 'leg_maradona',
                name: 'Diego Maradona D10S',
                position: 'MC',
                nation: 'AR',
                ovr: 120,
                stats: { vel: 112, tir: 118, pas: 120, reg: 120, def: 82, fis: 102 },
                rarity: 'icon',
                skinColor: '#e0ac69',
                hairColor: '#111111',
                specialMove: 'Gambeta Divina & Mano de Dios'
            },
            {
                id: 'leg_higuita',
                name: 'René Higuita',
                position: 'POR',
                nation: 'CO',
                ovr: 115,
                stats: { vel: 100, tir: 110, pas: 105, reg: 105, def: 98, fis: 120 },
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
                stats: { vel: 108, tir: 105, pas: 112, reg: 104, def: 120, fis: 118 },
                rarity: 'icon',
                skinColor: '#f7d6bf',
                hairColor: '#2b1d0c',
                specialMove: 'Cierre de Hierro Impenetrable'
            },
            {
                id: 'leg_ferrao',
                name: 'Ferrao La Pantera',
                position: 'DEL',
                nation: 'BR',
                ovr: 114,
                stats: { vel: 108, tir: 120, pas: 100, reg: 112, def: 82, fis: 120 },
                rarity: 'icon',
                skinColor: '#8d5524',
                hairColor: '#111111',
                specialMove: 'Giro de Pívot Imparable'
            },
            {
                id: 'leg_guitta',
                name: 'Guitta Muro',
                position: 'POR',
                nation: 'BR',
                ovr: 116,
                stats: { vel: 95, tir: 98, pas: 110, reg: 90, def: 95, fis: 120 },
                rarity: 'icon',
                skinColor: '#f0c294',
                hairColor: '#3a2010',
                specialMove: 'Muro Aéreo Reflejo 64'
            }
        ],

        // =====================================================================================
        // SECCIÓN 3: TUS JUGADORES PERSONALIZADOS CREADOS POR CÓDIGO
        // =====================================================================================
        // ¡AQUÍ ES DONDE PUEDES AGREGAR TODOS LOS JUGADORES QUE QUIERAS!
        // Aparecerán automáticamente en tu inventario del juego y en tu club.
        // =====================================================================================
        CUSTOM_PLAYERS: [
            {
                id: 'custom_neo_striker',
                name: 'Neo Striker 64',
                position: 'DEL',
                nation: 'JP',
                ovr: 116,
                stats: { vel: 120, tir: 118, pas: 105, reg: 119, def: 70, fis: 95 },
                skinColor: '#f7d6bf',
                hairColor: '#3b82f6',
                specialMove: 'Disparo Meteoro 64',
                rarity: 'icon'
            },
            {
                id: 'custom_cyber_wall',
                name: 'Cyber Muro 64',
                position: 'DEF',
                nation: 'AR',
                ovr: 114,
                stats: { vel: 108, tir: 95, pas: 110, reg: 102, def: 120, fis: 120 },
                skinColor: '#e0ac69',
                hairColor: '#1a1a1a',
                specialMove: 'Bloqueo Cuántico Impenetrable',
                rarity: 'icon'
            },
            {
                id: 'custom_phoenix_mid',
                name: 'Fénix El Maestro',
                position: 'MC',
                nation: 'ES',
                ovr: 117,
                stats: { vel: 115, tir: 112, pas: 120, reg: 118, def: 85, fis: 98 },
                skinColor: '#f0c294',
                hairColor: '#ef4444',
                specialMove: 'Ruleta Solar 64-Bit',
                rarity: 'icon'
            }
            // ⬇️ ¡Puedes agregar más jugadores aquí abajo separándolos con una coma ','!
        ],

        // =====================================================================================
        // SECCIÓN 4: PAÍSES / SELECCIONES OFICIALES
        // =====================================================================================
        NATIONS: [
            { code: 'BR', name: 'Brasil', flag: '🇧🇷', primaryColor: '#fde047', secondaryColor: '#15803d' },
            { code: 'ES', name: 'España', flag: '🇪🇸', primaryColor: '#dc2626', secondaryColor: '#eab308' },
            { code: 'AR', name: 'Argentina', flag: '🇦🇷', primaryColor: '#7dd3fc', secondaryColor: '#ffffff' },
            { code: 'PT', name: 'Portugal', flag: '🇵🇹', primaryColor: '#991b1b', secondaryColor: '#166534' },
            { code: 'FR', name: 'Francia', flag: '🇫🇷', primaryColor: '#1d4ed8', secondaryColor: '#ffffff' },
            { code: 'IT', name: 'Italia', flag: '🇮🇹', primaryColor: '#2563eb', secondaryColor: '#ffffff' },
            { code: 'JP', name: 'Japón', flag: '🇯🇵', primaryColor: '#1e3a8a', secondaryColor: '#dc2626' },
            { code: 'CO', name: 'Colombia', flag: '🇨🇴', primaryColor: '#eab308', secondaryColor: '#1d4ed8' }
        ]
    };

})(window);
