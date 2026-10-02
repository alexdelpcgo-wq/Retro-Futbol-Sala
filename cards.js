/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - GESTOR DE CLUB, PLANTILLA, SOBRES E INVENTARIO
 * ============================================================================
 * Maneja el almacenamiento persistente (LocalStorage), la plantilla activa
 * de 5 jugadores (POR, DEF, MC, DEL, DEL), la apertura de sobres en la tienda
 * y la integración de jugadores creados por programadores.
 */

import { generateStarterSquad, generatePackCards, POSITIONS, RARITIES, NATIONS } from './database.js';
import { customRoster } from './roster.js';
import { sound } from './audio.js';

const STORAGE_KEY = 'retro_futsal_save_64bit_v2';

export class ClubManager {
    /**
     * Constructor del gestor de club.
     */
    constructor() {
        this.coins = 250;
        this.squad = [];      // Arreglo de 5 cartas titulares: [POR, DEF, MC, DEL1, DEL2]
        this.inventory = [];  // Arreglo con todas las cartas desbloqueadas
        this.formation = '1-1-2';
        this.teamName = 'Los Galácticos 64-Bit';
        this.statsHistory = { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        this.load();
    }

    /**
     * Carga el estado guardado del club desde LocalStorage.
     */
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                this.coins = parsed.coins ?? 250;
                this.squad = parsed.squad || [];
                this.inventory = parsed.inventory || [];
                this.formation = parsed.formation || '1-1-2';
                this.teamName = parsed.teamName || 'Los Galácticos 64-Bit';
                this.statsHistory = parsed.statsHistory || this.statsHistory;
            }
        } catch (e) {
            console.warn('Fallo al cargar datos guardados de LocalStorage:', e);
        }

        // Si no hay plantilla inicial, generar la plantilla de inicio
        if (!this.squad || this.squad.length < 5) {
            this.initStarterSquad();
        }

        // Incorporar automáticamente los jugadores creados por programadores al inventario
        this.syncCustomRoster();
    }

    /**
     * Guarda el estado actual del club en LocalStorage.
     */
    save() {
        try {
            const data = {
                coins: this.coins,
                squad: this.squad,
                inventory: this.inventory,
                formation: this.formation,
                teamName: this.teamName,
                statsHistory: this.statsHistory
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Fallo al guardar datos en LocalStorage:', e);
        }
    }

    /**
     * Inicializa la plantilla inicial (5 titulares) y saldo de monedas inicial.
     */
    initStarterSquad() {
        const starterCards = generateStarterSquad();
        this.squad = [...starterCards];
        this.inventory = [...starterCards];
        this.coins = 250;
        this.save();
    }

    /**
     * Sincroniza las cartas del Custom Roster creadas por el programador con el inventario.
     */
    syncCustomRoster() {
        if (!Array.isArray(customRoster) || customRoster.length === 0) return;

        let added = false;
        customRoster.forEach(card => {
            const exists = this.inventory.some(c => c.id === card.id || c.name === card.name);
            if (!exists) {
                this.inventory.push(card);
                added = true;
            }
        });

        if (added) this.save();
    }

    /**
     * Añade o descuenta monedas del saldo del usuario.
     * @param {number} amount - Cantidad de monedas a sumar (positivo) o restar (negativo).
     */
    addCoins(amount) {
        this.coins = Math.max(0, this.coins + amount);
        this.save();
    }

    /**
     * Compra y abre un sobre en la tienda de cartas.
     * @param {string} [packType='standard'] - 'standard', 'premium', 'legend'.
     * @param {number} [cost=100] - Precio en monedas.
     * @returns {Object} Resultado de la compra con { success, cards, reason }.
     */
    buyPack(packType = 'standard', cost = 100) {
        if (this.coins < cost) {
            return { success: false, reason: 'No tienes suficientes monedas 🪙' };
        }
        this.coins -= cost;
        const newCards = generatePackCards(packType);
        this.inventory.push(...newCards);
        this.save();
        sound.playPackOpening();
        return { success: true, cards: newCards };
    }

    /**
     * Asigna una carta del inventario a un hueco titular de la plantilla.
     * @param {number} slotIndex - Índice del hueco (0 a 4).
     * @param {string} cardId - ID de la carta a colocar.
     * @returns {boolean} True si se asignó con éxito.
     */
    setSquadSlot(slotIndex, cardId) {
        const card = this.inventory.find(c => c.id === cardId);
        if (!card) return false;

        const existingIdx = this.squad.findIndex(c => c.id === cardId);
        if (existingIdx !== -1) {
            // Intercambiar posiciones
            const temp = this.squad[slotIndex];
            this.squad[slotIndex] = card;
            this.squad[existingIdx] = temp;
        } else {
            this.squad[slotIndex] = card;
        }

        this.save();
        return true;
    }

    /**
     * Calcula la media global del equipo titular (Team Rating OVR).
     * @returns {number} Media global del equipo (60 - 120).
     */
    getTeamRating() {
        if (!this.squad || this.squad.length === 0) return 70;
        const total = this.squad.reduce((sum, card) => sum + (card.ovr || 70), 0);
        return Math.round(total / this.squad.length);
    }
}

// Instancia global del gestor del club
export const clubManager = new ClubManager();
