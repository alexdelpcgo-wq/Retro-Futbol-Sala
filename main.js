/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - CONTROLADOR PRINCIPAL DE APLICACIÓN Y MENÚS
 * ============================================================================
 * Coordina la navegación de pestañas, gestión de interfaz de usuario,
 * Creador de Jugadores para Programadores (Roster Dev), Modo Tutorial,
 * Apertura de Sobres, Guía de Ganancia de Monedas y el bucle a 60 FPS del canvas.
 */

import { MatchEngine } from './game.js';
import { clubManager } from './cards.js';
import { sound } from './audio.js';
import { input } from './input.js';
import { referee } from './referee.js';
import { tutorialManager } from './tutorial.js';
import { economyManager } from './economy.js';
import { registerCustomPlayer, customRoster, deleteCustomPlayer, exportRosterJSON, importRosterJSON, getDeveloperCodeTemplate } from './roster.js';

export class App {
    /**
     * Constructor principal de la aplicación.
     */
    constructor() {
        this.canvas = document.getElementById('futsal-canvas');
        this.currentTab = 'tab-play';
        this.matchEngine = null;
        this.crtEnabled = true;

        this.init();
    }

    /**
     * Inicializa todos los componentes, escuchadores de eventos y renderizado inicial.
     */
    init() {
        console.log('🚀 Inicializando Retro Futsal 64-Bit...');

        this.setupNavigation();
        this.setupHeaderActions();
        this.setupPlayModes();
        this.setupPacksStore();
        this.setupSquadBuilder();
        this.setupRosterDevCreator();
        this.setupEarnCoinsGuide();
        this.setupModals();
        this.setupGameLoop();
        this.updateCoinDisplay();

        // Actualizar tamaño de canvas responsive
        this.resizeMatchCanvas();
        window.addEventListener('resize', () => this.resizeMatchCanvas());
    }

    /**
     * Configura la navegación por pestañas del menú principal.
     */
    setupNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTabId = tab.dataset.tab;
                this.switchTab(targetTabId);
            });
        });
    }

    /**
     * Cambia la pestaña activa mostrada en la pantalla.
     * @param {string} tabId - ID de la sección a activar.
     */
    switchTab(tabId) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === tabId));
        this.currentTab = tabId;

        // Si se cambia a la pestaña de plantilla o roster, refrescar su renderizado
        if (tabId === 'tab-squad') {
            this.renderSquadView();
        } else if (tabId === 'tab-roster-dev') {
            this.renderCustomRosterList();
        } else if (tabId === 'tab-earn-coins') {
            this.renderEarnCoinsList();
        }

        sound.playTone(360, 'sine', 0.05, 0.15);
    }

    /**
     * Configura los botones de sonido y filtro CRT del encabezado superior.
     */
    setupHeaderActions() {
        const btnCrt = document.getElementById('btn-toggle-crt');
        const btnSound = document.getElementById('btn-toggle-sound');

        if (btnCrt) {
            btnCrt.addEventListener('click', () => {
                this.crtEnabled = !this.crtEnabled;
                document.body.classList.toggle('crt-enabled', this.crtEnabled);
                btnCrt.textContent = this.crtEnabled ? '📺' : '🖥️';
            });
        }

        if (btnSound) {
            btnSound.addEventListener('click', () => {
                const isEnabled = sound.toggleSound();
                btnSound.textContent = isEnabled ? '🔊' : '🔇';
            });
        }
    }

    /**
     * Actualiza el saldo de monedas mostrado en la esquina superior derecha.
     */
    updateCoinDisplay() {
        const coinEl = document.getElementById('user-coins-display');
        if (coinEl) {
            coinEl.textContent = clubManager.coins.toLocaleString();
        }
    }

    /**
     * Configura los botones de inicio de partidos (VS CPU, Local 2P y Tutorial).
     */
    setupPlayModes() {
        // Modo VS CPU
        const btnCpu = document.getElementById('btn-start-cpu-match');
        if (btnCpu) {
            btnCpu.addEventListener('click', () => {
                const difficulty = document.getElementById('select-cpu-difficulty')?.value || 'normal';
                this.startMatch('vs_cpu', difficulty);
            });
        }

        // Modo Local 2 Jugadores
        const btnLocal = document.getElementById('btn-start-local-match');
        if (btnLocal) {
            btnLocal.addEventListener('click', () => {
                this.startMatch('local_2p', 'normal');
            });
        }

        // Modo Tutorial Interactivo
        const btnTutorial = document.getElementById('btn-start-tutorial');
        if (btnTutorial) {
            btnTutorial.addEventListener('click', () => {
                this.startTutorialMode();
            });
        }
    }

    /**
     * Inicia un partido de futsal en el canvas.
     * @param {string} mode - 'vs_cpu', 'local_2p', 'tutorial'.
     * @param {string} difficulty - Dificultad del rival.
     */
    startMatch(mode = 'vs_cpu', difficulty = 'normal') {
        const matchStage = document.getElementById('match-stage');
        const mainNav = document.getElementById('main-nav');
        const contentArea = document.getElementById('tab-content-area');

        if (mainNav) mainNav.classList.add('hidden');
        if (contentArea) contentArea.classList.add('hidden');
        if (matchStage) matchStage.classList.remove('hidden');

        // Mostrar u ocultar controles táctiles en móvil
        const touchOverlay = document.getElementById('touch-controls-overlay');
        if (touchOverlay) {
            touchOverlay.style.display = input.isMobile ? 'flex' : 'none';
        }

        this.matchEngine.startMatch(mode, difficulty);
        this.resizeMatchCanvas();
    }

    /**
     * Inicia el modo de entrenamiento / tutorial interactivo 64-bit.
     */
    startTutorialMode() {
        tutorialManager.startTutorial((result) => {
            this.updateCoinDisplay();
            alert(`🎉 ¡Felicidades! Has completado el Tutorial 64-Bit.\nGanaste +${result.coinsEarned} Monedas 🪙.`);
            this.returnToMenu();
        });
        this.startMatch('tutorial', 'easy');
    }

    /**
     * Sale del partido activo y vuelve a los menús principales.
     */
    returnToMenu() {
        tutorialManager.exitTutorial();
        const matchStage = document.getElementById('match-stage');
        const mainNav = document.getElementById('main-nav');
        const contentArea = document.getElementById('tab-content-area');
        const ftModal = document.getElementById('fulltime-modal');
        const htModal = document.getElementById('halftime-modal');

        if (ftModal) ftModal.classList.add('hidden');
        if (htModal) htModal.classList.add('hidden');
        if (matchStage) matchStage.classList.add('hidden');
        if (mainNav) mainNav.classList.remove('hidden');
        if (contentArea) contentArea.classList.remove('hidden');

        this.matchEngine.isRunning = false;
        this.updateCoinDisplay();
        this.renderSquadView();
    }

    /**
     * Configura la tienda de sobres y apertura de cartas.
     */
    setupPacksStore() {
        const buyButtons = document.querySelectorAll('.btn-buy-pack');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const packType = btn.dataset.packType || 'standard';
                const cost = parseInt(btn.dataset.cost || '100', 10);
                const res = clubManager.buyPack(packType, cost);

                if (res.success) {
                    this.updateCoinDisplay();
                    this.showPackOpeningModal(res.cards);
                } else {
                    alert(res.reason);
                }
            });
        });
    }

    /**
     * Muestra la animación de apertura de sobres y las cartas obtenidas.
     * @param {Array<Object>} cards - Cartas recibidas.
     */
    showPackOpeningModal(cards) {
        const modal = document.getElementById('pack-opening-modal');
        const container = document.getElementById('pack-cards-reveal');
        if (!modal || !container) return;

        container.innerHTML = '';
        cards.forEach((card, idx) => {
            const cardEl = this.createCardElement(card);
            cardEl.style.animationDelay = `${idx * 0.25}s`;
            container.appendChild(cardEl);
        });

        modal.classList.remove('hidden');
    }

    /**
     * Genera el elemento HTML representativo de una carta de futsal 64-bit.
     * @param {Object} card - Objeto con datos de la carta.
     * @returns {HTMLElement} Elemento de la carta.
     */
    createCardElement(card) {
        const div = document.createElement('div');
        div.className = `futsal-card card-${card.rarity || 'bronze'}`;
        div.dataset.cardId = card.id;

        div.innerHTML = `
            <div class="card-header">
                <span class="card-ovr">${card.ovr}</span>
                <span class="card-pos">${card.position}</span>
            </div>
            <div class="card-avatar">
                <div class="pixel-player-head" style="background-color: ${card.skinColor || '#f0c294'};">
                    <div class="pixel-player-hair" style="background-color: ${card.hairColor || '#1a1a1a'};"></div>
                </div>
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-stats-grid">
                <div><span>VEL:</span> ${card.stats?.vel || card.ovr}</div>
                <div><span>TIR:</span> ${card.stats?.tir || card.ovr}</div>
                <div><span>PAS:</span> ${card.stats?.pas || card.ovr}</div>
                <div><span>REG:</span> ${card.stats?.reg || card.ovr}</div>
                <div><span>DEF:</span> ${card.stats?.def || card.ovr}</div>
                <div><span>FIS:</span> ${card.stats?.fis || card.ovr}</div>
            </div>
            <div class="card-special-move">${card.specialMove || 'Jugada Maestra'}</div>
        `;
        return div;
    }

    /**
     * Configura la vista de gestión de plantilla e inventario de cartas.
     */
    setupSquadBuilder() {
        this.renderSquadView();
    }

    /**
     * Renderiza los 5 jugadores titulares y el inventario del usuario.
     */
    renderSquadView() {
        const squadGrid = document.getElementById('active-squad-grid');
        const inventoryGrid = document.getElementById('inventory-cards-grid');
        const teamRatingEl = document.getElementById('team-rating-display');

        if (teamRatingEl) {
            teamRatingEl.textContent = clubManager.getTeamRating();
        }

        if (squadGrid) {
            squadGrid.innerHTML = '';
            clubManager.squad.forEach((card, slotIdx) => {
                const slotContainer = document.createElement('div');
                slotContainer.className = 'squad-slot-box';
                slotContainer.innerHTML = `<div class="slot-title">HUECO ${slotIdx + 1} (${card.position})</div>`;
                const cardEl = this.createCardElement(card);
                slotContainer.appendChild(cardEl);
                squadGrid.appendChild(slotContainer);
            });
        }

        if (inventoryGrid) {
            inventoryGrid.innerHTML = '';
            clubManager.inventory.forEach(card => {
                const cardEl = this.createCardElement(card);
                cardEl.title = 'Haz clic para asignar a la plantilla titular';
                cardEl.addEventListener('click', () => {
                    const slot = prompt('¿En qué hueco titular (1 al 5) deseas colocar a este jugador?', '1');
                    const slotNum = parseInt(slot, 10) - 1;
                    if (!isNaN(slotNum) && slotNum >= 0 && slotNum < 5) {
                        clubManager.setSquadSlot(slotNum, card.id);
                        this.renderSquadView();
                        sound.playTone(520, 'square', 0.1, 0.2);
                    }
                });
                inventoryGrid.appendChild(cardEl);
            });
        }
    }

    /**
     * Configura la pestaña del Creador de Roster para Programadores (Roster Dev).
     */
    setupRosterDevCreator() {
        const form = document.getElementById('form-create-dev-player');
        const btnExport = document.getElementById('btn-export-roster');
        const btnImport = document.getElementById('btn-import-roster');
        const codeSnippet = document.getElementById('code-template-snippet');

        if (codeSnippet) {
            codeSnippet.textContent = getDeveloperCodeTemplate();
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('dev-player-name')?.value || 'Jugador Pro';
                const pos = document.getElementById('dev-player-pos')?.value || 'DEL';
                const nation = document.getElementById('dev-player-nation')?.value || 'ES';
                const ovr = parseInt(document.getElementById('dev-player-ovr')?.value || '110', 10);
                const skin = document.getElementById('dev-player-skin')?.value || '#f0c294';
                const hair = document.getElementById('dev-player-hair')?.value || '#1a1a1a';
                const special = document.getElementById('dev-player-special')?.value || 'Disparo Cósmico';

                const newCard = registerCustomPlayer({
                    name,
                    position: pos,
                    nation,
                    ovr,
                    stats: { vel: ovr, tir: ovr, pas: ovr, reg: ovr, def: ovr, fis: ovr },
                    skinColor: skin,
                    hairColor: hair,
                    specialMove: special
                });

                if (newCard) {
                    clubManager.inventory.push(newCard);
                    clubManager.save();
                    sound.playPackOpening();
                    alert(`✅ ¡Jugador "${newCard.name}" (${newCard.ovr} OVR) creado y añadido a tu inventario!`);
                    this.renderCustomRosterList();
                    this.renderSquadView();
                }
            });
        }

        if (btnExport) {
            btnExport.addEventListener('click', () => {
                const json = exportRosterJSON();
                navigator.clipboard?.writeText(json);
                alert('📋 ¡Roster copiado al portapapeles en formato JSON!');
            });
        }

        if (btnImport) {
            btnImport.addEventListener('click', () => {
                const inputJson = prompt('Pega el JSON de jugadores a importar:');
                if (inputJson) {
                    const count = importRosterJSON(inputJson);
                    clubManager.syncCustomRoster();
                    this.renderCustomRosterList();
                    alert(`🎉 ¡${count} jugadores importados exitosamente!`);
                }
            });
        }
    }

    /**
     * Renderiza la lista de jugadores personalizados en la pestaña de Roster Dev.
     */
    renderCustomRosterList() {
        const listContainer = document.getElementById('custom-roster-cards-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        if (customRoster.length === 0) {
            listContainer.innerHTML = '<p class="empty-hint">No hay jugadores personalizados creados aún. ¡Crea uno arriba!</p>';
            return;
        }

        customRoster.forEach(card => {
            const cardEl = this.createCardElement(card);
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-card';
            deleteBtn.textContent = '🗑️ Eliminar';
            deleteBtn.addEventListener('click', () => {
                if (confirm(`¿Eliminar al jugador ${card.name}?`)) {
                    deleteCustomPlayer(card.id);
                    this.renderCustomRosterList();
                }
            });
            cardEl.appendChild(deleteBtn);
            listContainer.appendChild(cardEl);
        });
    }

    /**
     * Configura la pestaña y lista explicativa de cómo ganar monedas.
     */
    setupEarnCoinsGuide() {
        this.renderEarnCoinsList();
    }

    /**
     * Renderiza las opciones y reglas de ganancia de monedas en la pestaña informativa.
     */
    renderEarnCoinsList() {
        const guideContainer = document.getElementById('earn-coins-guide-list');
        if (!guideContainer) return;

        const methods = economyManager.getWaysToEarnCoinsGuide();
        guideContainer.innerHTML = '';

        methods.forEach(item => {
            const row = document.createElement('div');
            row.className = 'earn-coin-card';
            row.innerHTML = `
                <div class="earn-icon">${item.icon}</div>
                <div class="earn-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
                <div class="earn-reward-badge">${item.rewardText}</div>
            `;
            guideContainer.appendChild(row);
        });
    }

    /**
     * Configura los botones de cierre y confirmación de los modales.
     */
    setupModals() {
        // Modal de sobres
        const btnClosePack = document.getElementById('btn-close-pack-modal');
        if (btnClosePack) {
            btnClosePack.addEventListener('click', () => {
                document.getElementById('pack-opening-modal')?.classList.add('hidden');
                this.renderSquadView();
            });
        }

        // Descanso
        const btnContinueHalf = document.getElementById('btn-continue-second-half');
        if (btnContinueHalf) {
            btnContinueHalf.addEventListener('click', () => {
                this.matchEngine.resumeSecondHalf();
            });
        }

        // Fin de partido
        const btnBackToMenu = document.getElementById('btn-back-to-menu');
        if (btnBackToMenu) {
            btnBackToMenu.addEventListener('click', () => {
                this.returnToMenu();
            });
        }
    }

    /**
     * Inicializa el bucle de juego continuo a 60 FPS en el canvas.
     */
    setupGameLoop() {
        this.matchEngine = new MatchEngine(this.canvas, (summary) => {
            this.updateCoinDisplay();
        });

        const loop = () => {
            if (this.matchEngine.isRunning) {
                this.matchEngine.update();
                this.matchEngine.render();
                this.updateMatchHud();
            }
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    /**
     * Actualiza el marcador, cronómetro y nombres en el HUD del partido.
     */
    updateMatchHud() {
        const score1El = document.getElementById('hud-score-1');
        const score2El = document.getElementById('hud-score-2');
        const timerEl = document.getElementById('hud-match-timer');
        const fouls1El = document.getElementById('hud-fouls-1');
        const fouls2El = document.getElementById('hud-fouls-2');

        if (score1El) score1El.textContent = this.matchEngine.score.team1;
        if (score2El) score2El.textContent = this.matchEngine.score.team2;

        if (timerEl) {
            const totalSec = Math.floor(this.matchEngine.matchTime);
            const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
            const s = (totalSec % 60).toString().padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
        }

        if (fouls1El) fouls1El.textContent = `Faltas: ${referee.accumulatedFouls.team1}/5`;
        if (fouls2El) fouls2El.textContent = `Faltas: ${referee.accumulatedFouls.team2}/5`;
    }

    /**
     * Ajusta la escala del canvas para adaptarse responsive en PCs y móviles.
     */
    resizeMatchCanvas() {
        const wrapper = document.getElementById('canvas-wrapper');
        if (!wrapper || !this.canvas) return;

        const containerWidth = wrapper.clientWidth || window.innerWidth;
        const scale = Math.min(1.0, (containerWidth - 20) / 1050);
        this.canvas.style.transform = `scale(${Math.max(0.35, scale)})`;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    window.retroFutsalApp = new App();
});
