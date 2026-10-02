/**
 * =========================================================================================
 * ⚽ RETRO FUTSAL 64-BIT - MOTOR DE JUEGO PRINCIPAL STANDALONE ⚽
 * =========================================================================================
 * 100% Compatible con ejecución directa en HTML sin servidor (file:/// y http://).
 * Sin dependencias externas ni módulos ES: funciona de inmediato con doble clic.
 * 
 * 💡 NOTA IMPORTANTE PARA EL PROGRAMADOR:
 * Si deseas agregar jugadores, cambiar sus nombres o modificar sus estadísticas (OVR 60 - 120),
 * abre el archivo `players_config.js` que se encuentra en esta misma carpeta.
 * =========================================================================================
 */

(function(window, document) {
    'use strict';

    // =====================================================================================
    // 1. CARGA Y SINCRONIZACIÓN DE CONFIGURACIÓN DE JUGADORES (players_config.js)
    // =====================================================================================
    const PLAYERS_CFG = window.PLAYERS_CONFIG || {
        STARTER_SQUAD: [],
        LEGEND_PLAYERS: [],
        CUSTOM_PLAYERS: [],
        NATIONS: []
    };

    const POSITIONS = {
        POR: { code: 'POR', name: 'Portero', color: '#f59e0b', role: 'Guardián del arco' },
        DEF: { code: 'DEF', name: 'Defensa (Cierre)', color: '#3b82f6', role: 'Líder defensivo' },
        MC:  { code: 'MC',  name: 'Medio Centro (Ala)', color: '#10b981', role: 'Creador de juego' },
        DEL: { code: 'DEL', name: 'Delantero (Pívot)', color: '#ef4444', role: 'Goleador letal' }
    };

    const RARITIES = {
        bronze: { code: 'bronze', name: 'Bronce', minOvr: 60, maxOvr: 74, color: '#cd7f32' },
        silver: { code: 'silver', name: 'Plata', minOvr: 75, maxOvr: 84, color: '#e0e0e0' },
        gold:   { code: 'gold',   name: 'Oro',   minOvr: 85, maxOvr: 99, color: '#facc15' },
        icon:   { code: 'icon',   name: 'Leyenda 64-Bit', minOvr: 100, maxOvr: 120, color: '#a855f7' }
    };

    const NATIONS = (PLAYERS_CFG.NATIONS && PLAYERS_CFG.NATIONS.length > 0) ? PLAYERS_CFG.NATIONS : [
        { code: 'BR', name: 'Brasil', flag: '🇧🇷', primaryColor: '#fde047', secondaryColor: '#15803d' },
        { code: 'ES', name: 'España', flag: '🇪🇸', primaryColor: '#dc2626', secondaryColor: '#eab308' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷', primaryColor: '#7dd3fc', secondaryColor: '#ffffff' },
        { code: 'PT', name: 'Portugal', flag: '🇵🇹', primaryColor: '#991b1b', secondaryColor: '#166534' },
        { code: 'FR', name: 'Francia', flag: '🇫🇷', primaryColor: '#1d4ed8', secondaryColor: '#ffffff' },
        { code: 'IT', name: 'Italia', flag: '🇮🇹', primaryColor: '#2563eb', secondaryColor: '#ffffff' },
        { code: 'JP', name: 'Japón', flag: '🇯🇵', primaryColor: '#1e3a8a', secondaryColor: '#dc2626' },
        { code: 'CO', name: 'Colombia', flag: '🇨🇴', primaryColor: '#eab308', secondaryColor: '#1d4ed8' }
    ];

    const FIRST_NAMES = ['Carlos', 'Mateo', 'Lucas', 'Santiago', 'Javier', 'Diego', 'Neymar', 'Bruno', 'Leo', 'Hugo', 'Rodrigo', 'Sergio', 'Marcos', 'Tiago', 'Gabriel', 'Alejandro', 'Enzo', 'Joaquín', 'Rafael', 'Felipe', 'Pablo', 'Kenji', 'Antoine', 'Gianluigi', 'Franco', 'Alex', 'Adrián'];
    const LAST_NAMES = ['Silva', 'López', 'Martínez', 'García', 'Santos', 'Fernández', 'Rodríguez', 'Costa', 'Gómez', 'Pereira', 'Sánchez', 'Pérez', 'Torres', 'Romero', 'Álvarez', 'Morales', 'Suárez', 'Ramos', 'Tanaka', 'Rossi', 'Díaz', 'Vargas'];
    const SKIN_TONES = ['#f7d6bf', '#f0c294', '#e0ac69', '#d4a373', '#c68642', '#8d5524', '#5c3317'];
    const HAIR_TONES = ['#1a1a1a', '#3a2010', '#593e1a', '#8a622a', '#d4af37', '#880808'];

    function generateRandomCard(forcedPosition = null, minOvr = 65, maxOvr = 92) {
        const positions = ['POR', 'DEF', 'MC', 'DEL', 'DEL'];
        const position = forcedPosition || positions[Math.floor(Math.random() * positions.length)];
        const nationObj = NATIONS[Math.floor(Math.random() * NATIONS.length)];
        const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const name = `${fName} ${lName}`;

        const ovr = Math.min(120, Math.max(60, Math.floor(minOvr + Math.random() * (maxOvr - minOvr + 1))));

        let rarity = 'bronze';
        if (ovr >= 100) rarity = 'icon';
        else if (ovr >= 85) rarity = 'gold';
        else if (ovr >= 75) rarity = 'silver';

        const randStat = (bias = 0) => Math.min(120, Math.max(60, ovr + bias + Math.floor((Math.random() - 0.5) * 10)));

        let stats = {};
        if (position === 'POR') {
            stats = { vel: randStat(-4), tir: randStat(-15), pas: randStat(-5), reg: randStat(-8), def: randStat(4), fis: randStat(8) };
        } else if (position === 'DEF') {
            stats = { vel: randStat(0), tir: randStat(-6), pas: randStat(0), reg: randStat(-3), def: randStat(8), fis: randStat(6) };
        } else if (position === 'MC') {
            stats = { vel: randStat(2), tir: randStat(2), pas: randStat(8), reg: randStat(6), def: randStat(0), fis: randStat(0) };
        } else {
            stats = { vel: randStat(6), tir: randStat(10), pas: randStat(0), reg: randStat(8), def: randStat(-8), fis: randStat(2) };
        }

        return {
            id: `gen_card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            name,
            position,
            nation: nationObj.code,
            ovr,
            stats,
            rarity,
            skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
            hairColor: HAIR_TONES[Math.floor(Math.random() * HAIR_TONES.length)],
            specialMove: 'Disparo 64-Bit'
        };
    }

    // =====================================================================================
    // 2. MOTOR DE AUDIO SINTETIZADO (Web Audio API - Cero Archivos Externos)
    // =====================================================================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = true;
            this.masterVolume = 0.55;
            this.crowdNode = null;
            this.crowdGain = null;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.startCrowdAmbience();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggleSound() {
            this.enabled = !this.enabled;
            if (this.crowdGain && this.ctx) {
                this.crowdGain.gain.setValueAtTime(this.enabled ? 0.035 * this.masterVolume : 0, this.ctx.currentTime);
            }
            return this.enabled;
        }

        playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.2, pitchDecay = 0) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;

            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, now);
                if (pitchDecay !== 0) {
                    osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + pitchDecay), now + duration);
                }

                gain.gain.setValueAtTime(gainVal * this.masterVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + duration);
            } catch (e) {}
        }

        playNoise(duration = 0.12, gainVal = 0.25, filterFreq = 800) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;

            try {
                const bufferSize = this.ctx.sampleRate * duration;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(gainVal * this.masterVolume, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noise.start();
            } catch (e) {}
        }

        playKick(power = 1) {
            this.playTone(180 + power * 40, 'sine', 0.12, 0.4 * power, -120);
            this.playNoise(0.08, 0.25 * power, 1200);
        }

        playPass() {
            this.playTone(300, 'triangle', 0.08, 0.25, -100);
        }

        playPostHit() {
            this.playTone(1100, 'square', 0.35, 0.35, -400);
            this.playTone(850, 'triangle', 0.4, 0.3, -200);
        }

        playTackle() {
            this.playNoise(0.2, 0.35, 650);
        }

        playWhistle(type = 'short') {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;

            const duration = type === 'long' ? 0.75 : (type === 'double' ? 0.55 : 0.22);
            const now = this.ctx.currentTime;

            const playBurst = (startTime, len) => {
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(2800, startTime);
                    osc.frequency.linearRampToValueAtTime(3200, startTime + len);

                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, startTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + len);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + len);
                } catch (e) {}
            };

            if (type === 'double') {
                playBurst(now, 0.18);
                playBurst(now + 0.24, 0.28);
            } else {
                playBurst(now, duration);
            }
        }

        playGoal() {
            this.playWhistle('long');
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, 'sawtooth', 0.35, 0.3, 0);
                }, idx * 85);
            });
            this.surgeCrowd(3.0);
        }

        playCard(isRed = false) {
            this.playWhistle('double');
            if (isRed) {
                this.playTone(440, 'sawtooth', 0.25, 0.4, -200);
            } else {
                this.playTone(587.33, 'triangle', 0.2, 0.35, 0);
            }
        }

        playPackReveal(rarity = 'bronze') {
            this.init();
            if (!this.ctx) return;

            if (rarity === 'icon' || rarity === 'legend') {
                const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                chords.forEach((note, i) => {
                    setTimeout(() => {
                        this.playTone(note, 'sawtooth', 0.5, 0.35, 40);
                    }, i * 110);
                });
            } else if (rarity === 'gold') {
                const chords = [440, 554.37, 659.25, 880];
                chords.forEach((note, i) => {
                    setTimeout(() => {
                        this.playTone(note, 'triangle', 0.35, 0.3, 0);
                    }, i * 110);
                });
            } else {
                this.playTone(440, 'triangle', 0.15, 0.2, 100);
            }
        }

        startCrowdAmbience() {
            if (!this.ctx || this.crowdNode) return;
            try {
                const bufferSize = this.ctx.sampleRate * 2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.0;
                }

                this.crowdNode = this.ctx.createBufferSource();
                this.crowdNode.buffer = buffer;
                this.crowdNode.loop = true;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 450;
                filter.Q.value = 1.2;

                this.crowdGain = this.ctx.createGain();
                this.crowdGain.gain.setValueAtTime(0.035 * this.masterVolume, this.ctx.currentTime);

                this.crowdNode.connect(filter);
                filter.connect(this.crowdGain);
                this.crowdGain.connect(this.ctx.destination);
                this.crowdNode.start();
            } catch (e) {}
        }

        surgeCrowd(duration = 2.5) {
            if (!this.crowdGain || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                this.crowdGain.gain.cancelScheduledValues(now);
                this.crowdGain.gain.setValueAtTime(this.crowdGain.gain.value, now);
                this.crowdGain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, now + 0.3);
                this.crowdGain.gain.exponentialRampToValueAtTime(0.035 * this.masterVolume, now + duration);
            } catch (e) {}
        }
    }

    const sound = new SoundEngine();

    // =====================================================================================
    // 2.5. SISTEMA DE AUTENTICACIÓN Y ROLES (ADMIN '+-+-ALEX' vs USUARIOS)
    // =====================================================================================
    const AUTH_STORAGE_KEY = 'retro_futsal_auth_session_v1';
    const USERS_STORAGE_KEY = 'retro_futsal_users_list_v1';

    class AuthManager {
        constructor() {
            this.currentUser = {
                id: 'usr_guest',
                name: 'Invitado',
                role: 'user', // 'admin' | 'user'
                isBanned: false
            };
            this.users = [];
            this.load();
        }

        load() {
            try {
                const saved = localStorage.getItem(AUTH_STORAGE_KEY);
                if (saved) {
                    this.currentUser = JSON.parse(saved);
                }
            } catch (e) {}

            try {
                const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
                if (savedUsers) {
                    this.users = JSON.parse(savedUsers);
                } else {
                    this.initDefaultUsers();
                }
            } catch (e) {
                this.initDefaultUsers();
            }
        }

        initDefaultUsers() {
            this.users = [
                { id: 'u_1', name: 'Gamer_Pro99', ip: '190.24.112.5', ping: 22, matches: 38, status: 'playing', banned: false },
                { id: 'u_2', name: 'SpeedyFutsal', ip: '181.49.88.19', ping: 34, matches: 21, status: 'online', banned: false },
                { id: 'u_3', name: 'ShadowStriker', ip: '201.218.44.102', ping: 19, matches: 64, status: 'playing', banned: false },
                { id: 'u_4', name: 'TikiTakaMaster', ip: '190.158.71.4', ping: 45, matches: 15, status: 'online', banned: false },
                { id: 'u_5', name: 'ElPibe64', ip: '186.84.19.22', ping: 28, matches: 52, status: 'online', banned: false }
            ];
            this.saveUsers();
        }

        save() {
            try {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
            } catch (e) {}
        }

        saveUsers() {
            try {
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
            } catch (e) {}
        }

        login(inputCode) {
            const trimmed = (inputCode || '').trim();
            if (!trimmed) return { success: false, role: 'user' };

            if (trimmed === '+-+-ALEX') {
                this.currentUser = {
                    id: 'admin_alex',
                    name: 'ALEX',
                    role: 'admin',
                    isBanned: false
                };
            } else {
                const existing = this.users.find(u => u.name.toLowerCase() === trimmed.toLowerCase() || u.id === trimmed);
                const isBanned = existing ? !!existing.banned : false;

                this.currentUser = {
                    id: existing ? existing.id : `usr_${Date.now()}`,
                    name: trimmed,
                    role: 'user',
                    isBanned: isBanned
                };

                if (!existing) {
                    this.users.push({
                        id: this.currentUser.id,
                        name: trimmed,
                        ip: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
                        ping: Math.floor(Math.random() * 25 + 15),
                        matches: 1,
                        status: 'online',
                        banned: false
                    });
                    this.saveUsers();
                }
            }

            this.save();
            return { success: true, role: this.currentUser.role };
        }

        logout() {
            this.currentUser = {
                id: 'usr_guest',
                name: 'Invitado',
                role: 'user',
                isBanned: false
            };
            this.save();
        }

        isAdmin() {
            return this.currentUser.role === 'admin';
        }

        isCurrentBanned() {
            return !!this.currentUser.isBanned;
        }

        isUserBanned(userId) {
            const user = this.users.find(u => u.id === userId || u.name.toLowerCase() === (userId || '').toLowerCase());
            return user ? !!user.banned : false;
        }

        banUser(userId) {
            let user = this.users.find(u => u.id === userId || u.name.toLowerCase() === (userId || '').toLowerCase());
            if (!user) {
                user = { id: userId, name: userId, ip: '192.168.1.1', ping: 20, matches: 0, status: 'online', banned: true };
                this.users.push(user);
            } else {
                user.banned = true;
            }
            if (this.currentUser.id === user.id || this.currentUser.name === user.name) {
                this.currentUser.isBanned = true;
                this.save();
            }
            this.saveUsers();
            return true;
        }

        unbanUser(userId) {
            const user = this.users.find(u => u.id === userId || u.name.toLowerCase() === (userId || '').toLowerCase());
            if (user) {
                user.banned = false;
                if (this.currentUser.id === user.id || this.currentUser.name === user.name) {
                    this.currentUser.isBanned = false;
                    this.save();
                }
                this.saveUsers();
                return true;
            }
            return false;
        }

        addUser(name) {
            const id = `user_${Date.now()}`;
            this.users.push({
                id,
                name,
                ip: '192.168.1.50',
                ping: 25,
                matches: 0,
                status: 'online',
                banned: false
            });
            this.saveUsers();
            return id;
        }

        toggleBan(userId) {
            const user = this.users.find(u => u.id === userId || u.name === userId);
            if (user) {
                user.banned = !user.banned;
                if (this.currentUser.id === user.id || this.currentUser.name === user.name) {
                    this.currentUser.isBanned = user.banned;
                    this.save();
                }
                this.saveUsers();
                return user.banned;
            }
            return false;
        }
    }

    const authManager = new AuthManager();

    // =====================================================================================
    // 3. GESTOR DE CLUB, PLANTILLA E INVENTARIO
    // =====================================================================================
    const CLUB_STORAGE_KEY = 'retro_futsal_club_save_v3';

    class ClubManager {
        constructor() {
            this.coins = 250;
            this.squad = [];      // 5 cartas titulares [POR, DEF, MC, DEL, DEL]
            this.inventory = [];  // Todas las cartas en posesión
            this.teamName = 'Mi Club 64-Bit';
            this.packPrices = {
                standard: 100,
                premium: 250,
                legend: 500
            };
            this.load();
        }

        load() {
            try {
                const saved = localStorage.getItem(CLUB_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.coins = parsed.coins ?? 250;
                    this.squad = parsed.squad || [];
                    this.inventory = parsed.inventory || [];
                    this.teamName = parsed.teamName || 'Mi Club 64-Bit';
                    if (parsed.packPrices) this.packPrices = parsed.packPrices;
                }
            } catch (e) {}

            // Si no hay plantilla o faltan jugadores, inicializar con la plantilla de players_config.js
            if (!this.squad || this.squad.length < 5) {
                this.initDefaultSquad();
            }

            // Sincronizar siempre las leyendas y los jugadores de PLAYERS_CONFIG.CUSTOM_PLAYERS
            this.syncConfigPlayers();
        }

        initDefaultSquad() {
            const starters = (PLAYERS_CFG.STARTER_SQUAD && PLAYERS_CFG.STARTER_SQUAD.length === 5)
                ? [...PLAYERS_CFG.STARTER_SQUAD]
                : [
                    generateRandomCard('POR', 80, 88),
                    generateRandomCard('DEF', 82, 89),
                    generateRandomCard('MC',  84, 91),
                    generateRandomCard('DEL', 85, 93),
                    generateRandomCard('DEL', 84, 92)
                ];

            this.squad = [...starters];
            this.inventory = [...starters];
            this.coins = 250;
            this.save();
        }

        syncConfigPlayers() {
            const allConfigPlayers = [
                ...(PLAYERS_CFG.CUSTOM_PLAYERS || []),
                ...(PLAYERS_CFG.LEGEND_PLAYERS || [])
            ];

            let added = false;
            allConfigPlayers.forEach(player => {
                const exists = this.inventory.some(c => c.id === player.id || c.name === player.name);
                if (!exists) {
                    this.inventory.push(player);
                    added = true;
                }
            });

            if (added) this.save();
        }

        save() {
            try {
                const data = {
                    coins: this.coins,
                    squad: this.squad,
                    inventory: this.inventory,
                    teamName: this.teamName,
                    packPrices: this.packPrices
                };
                localStorage.setItem(CLUB_STORAGE_KEY, JSON.stringify(data));
            } catch (e) {}
        }

        addCoins(amount) {
            this.coins = Math.max(0, this.coins + amount);
            this.save();
        }

        setPackPrices(standard, premium, legend) {
            if (standard > 0) this.packPrices.standard = parseInt(standard, 10);
            if (premium > 0) this.packPrices.premium = parseInt(premium, 10);
            if (legend > 0) this.packPrices.legend = parseInt(legend, 10);
            this.save();
        }

        buyPack(packType = 'standard') {
            const cost = this.packPrices[packType] || 100;
            if (this.coins < cost) {
                return { success: false, reason: 'No tienes suficientes monedas 🪙' };
            }
            this.coins -= cost;

            let minOvr = 65, maxOvr = 88;
            if (packType === 'premium') { minOvr = 82; maxOvr = 105; }
            else if (packType === 'legend') { minOvr = 100; maxOvr = 120; }

            const newCards = [];
            const positions = ['POR', 'DEF', 'MC', 'DEL', 'DEL'];

            for (let i = 0; i < 3; i++) {
                if (packType === 'legend' && PLAYERS_CFG.LEGEND_PLAYERS && PLAYERS_CFG.LEGEND_PLAYERS.length > 0) {
                    const leg = PLAYERS_CFG.LEGEND_PLAYERS[Math.floor(Math.random() * PLAYERS_CFG.LEGEND_PLAYERS.length)];
                    newCards.push({ ...leg, id: `pack_leg_${Date.now()}_${i}` });
                } else if (packType === 'premium' && Math.random() < 0.35 && PLAYERS_CFG.LEGEND_PLAYERS && PLAYERS_CFG.LEGEND_PLAYERS.length > 0) {
                    const leg = PLAYERS_CFG.LEGEND_PLAYERS[Math.floor(Math.random() * PLAYERS_CFG.LEGEND_PLAYERS.length)];
                    newCards.push({ ...leg, id: `pack_leg_${Date.now()}_${i}` });
                } else {
                    newCards.push(generateRandomCard(positions[i % positions.length], minOvr, maxOvr));
                }
            }

            this.inventory.push(...newCards);
            this.save();
            return { success: true, cards: newCards };
        }

        setSquadSlot(slotIndex, cardId) {
            const card = this.inventory.find(c => c.id === cardId);
            if (!card) return false;

            const existingIdx = this.squad.findIndex(c => c.id === cardId);
            if (existingIdx !== -1) {
                const temp = this.squad[slotIndex];
                this.squad[slotIndex] = card;
                this.squad[existingIdx] = temp;
            } else {
                this.squad[slotIndex] = card;
            }

            this.save();
            return true;
        }

        addCustomPlayer(playerData) {
            const id = playerData.id || `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const ovr = Math.min(120, Math.max(60, parseInt(playerData.ovr || 85, 10)));
            const rarity = playerData.rarity || (ovr >= 100 ? 'icon' : (ovr >= 85 ? 'gold' : (ovr >= 75 ? 'silver' : 'bronze')));
            const stats = {
                vel: Math.min(120, Math.max(60, parseInt(playerData.vel ?? playerData.stats?.vel ?? ovr, 10))),
                tir: Math.min(120, Math.max(60, parseInt(playerData.tir ?? playerData.stats?.tir ?? ovr, 10))),
                pas: Math.min(120, Math.max(60, parseInt(playerData.pas ?? playerData.stats?.pas ?? ovr, 10))),
                reg: Math.min(120, Math.max(60, parseInt(playerData.reg ?? playerData.stats?.reg ?? ovr, 10))),
                def: Math.min(120, Math.max(60, parseInt(playerData.def ?? playerData.stats?.def ?? ovr, 10))),
                fis: Math.min(120, Math.max(60, parseInt(playerData.fis ?? playerData.stats?.fis ?? ovr, 10)))
            };

            const newCard = {
                id,
                name: playerData.name || 'Nuevo Crack',
                position: playerData.position || 'DEL',
                nation: playerData.nation || 'ES',
                ovr,
                rarity,
                stats,
                skinColor: playerData.skinColor || '#f0c294',
                hairColor: playerData.hairColor || '#1a1a1a',
                specialMove: playerData.special || playerData.specialMove || 'Disparo 64-Bit'
            };

            if (!PLAYERS_CFG.CUSTOM_PLAYERS) PLAYERS_CFG.CUSTOM_PLAYERS = [];
            PLAYERS_CFG.CUSTOM_PLAYERS.push(newCard);
            this.inventory.push(newCard);
            this.save();
            return newCard;
        }

        modifyPlayerStats(playerId, updates) {
            const player = this.inventory.find(p => p.id === playerId);
            if (!player) return null;

            if (updates.name !== undefined) player.name = updates.name;
            if (updates.ovr !== undefined) {
                player.ovr = Math.min(120, Math.max(60, parseInt(updates.ovr, 10)));
                player.rarity = player.ovr >= 100 ? 'icon' : (player.ovr >= 85 ? 'gold' : (player.ovr >= 75 ? 'silver' : 'bronze'));
            }
            if (updates.rarity) player.rarity = updates.rarity;

            if (!player.stats) player.stats = {};
            if (updates.stats) Object.assign(player.stats, updates.stats);
            if (updates.vel !== undefined) player.stats.vel = Math.min(120, Math.max(60, parseInt(updates.vel, 10)));
            if (updates.tir !== undefined) player.stats.tir = Math.min(120, Math.max(60, parseInt(updates.tir, 10)));
            if (updates.pas !== undefined) player.stats.pas = Math.min(120, Math.max(60, parseInt(updates.pas, 10)));
            if (updates.reg !== undefined) player.stats.reg = Math.min(120, Math.max(60, parseInt(updates.reg, 10)));
            if (updates.def !== undefined) player.stats.def = Math.min(120, Math.max(60, parseInt(updates.def, 10)));
            if (updates.fis !== undefined) player.stats.fis = Math.min(120, Math.max(60, parseInt(updates.fis, 10)));

            const squadIdx = this.squad.findIndex(p => p && p.id === playerId);
            if (squadIdx !== -1) {
                this.squad[squadIdx] = player;
            }

            this.save();
            return player;
        }

        getTeamRating() {
            if (!this.squad || this.squad.length === 0) return 80;
            const total = this.squad.reduce((sum, c) => sum + (c ? (c.ovr || 80) : 80), 0);
            return Math.round(total / this.squad.length);
        }
    }

    const clubManager = new ClubManager();

    // =====================================================================================
    // 4. DIMENSIONES DE CANCHA Y FÍSICAS 2D+Z
    // =====================================================================================
    const COURT = {
        width: 1050,
        height: 620,
        minX: 65,
        maxX: 985,
        minY: 50,
        maxY: 570,
        goalTop: 245,
        goalBottom: 375,
        goalDepth: 45,
        penaltySpotX1: 175,
        penaltySpotX2: 875,
        doublePenaltySpotX1: 250,
        doublePenaltySpotX2: 800
    };

    class Ball {
        constructor(x = COURT.width / 2, y = COURT.height / 2) {
            this.x = x;
            this.y = y;
            this.z = 0;
            this.vx = 0;
            this.vy = 0;
            this.vz = 0;
            this.radius = 7;
            this.friction = 0.982;
            this.gravity = 0.35;
            this.bounce = 0.42;
            this.owner = null;
            this.lastKickedBy = null;
            this.targetMate = null;
            this.trail = [];
            this.rotationAngle = 0;
        }

        reset(x = COURT.width / 2, y = COURT.height / 2) {
            this.x = x;
            this.y = y;
            this.z = 0;
            this.vx = 0;
            this.vy = 0;
            this.vz = 0;
            this.owner = null;
            this.targetMate = null;
            this.trail = [];
            this.rotationAngle = 0;
        }

        kick(vx, vy, vz = 0, player = null) {
            this.owner = null;
            this.vx = vx;
            this.vy = vy;
            this.vz = vz;
            this.lastKickedBy = player;
        }

        update() {
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > 4.2) {
                this.trail.push({ x: this.x, y: this.y - this.z, alpha: 0.85 });
                if (this.trail.length > 7) this.trail.shift();
            } else {
                this.trail = [];
            }
            this.trail.forEach(t => t.alpha *= 0.82);

            this.rotationAngle += speed * 0.12;

            if (this.owner) {
                const offset = 12;
                this.x = this.owner.x + Math.cos(this.owner.facingAngle) * offset;
                this.y = this.owner.y + Math.sin(this.owner.facingAngle) * offset;
                this.z = 0;
                this.vx = this.owner.vx;
                this.vy = this.owner.vy;
                this.vz = 0;

                // Contener al dueño y balón dentro de los márgenes de la cancha
                this.x = Math.max(COURT.minX + 8, Math.min(COURT.maxX - 8, this.x));
                this.y = Math.max(COURT.minY + 8, Math.min(COURT.maxY - 8, this.y));
                return;
            }

            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;

            this.vx *= this.friction;
            this.vy *= this.friction;

            if (this.z > 0 || this.vz !== 0) {
                this.vz -= this.gravity;
                if (this.z <= 0) {
                    this.z = 0;
                    if (Math.abs(this.vz) > 0.8) {
                        this.vz = -this.vz * this.bounce;
                        this.vx *= 0.86;
                        this.vy *= 0.86;
                    } else {
                        this.vz = 0;
                    }
                }
            }

            // =====================================================================
            // BARRERAS PERIMETRALES 64-BIT Y REBOTES (EL BALÓN NUNCA SE SALE DEL MAPA)
            // =====================================================================
            // Rebotes laterales (Líneas de banda)
            if (this.y - this.radius < COURT.minY) {
                this.y = COURT.minY + this.radius;
                this.vy = -this.vy * 0.72;
                if (Math.abs(this.vy) > 0.8) sound.playTone(450, 'triangle', 0.05, 0.15);
            } else if (this.y + this.radius > COURT.maxY) {
                this.y = COURT.maxY - this.radius;
                this.vy = -this.vy * 0.72;
                if (Math.abs(this.vy) > 0.8) sound.playTone(450, 'triangle', 0.05, 0.15);
            }

            // Rebotes de fondo y redes de porterías
            const inGoalY = this.y >= COURT.goalTop && this.y <= COURT.goalBottom;
            if (inGoalY) {
                // Dentro del marco: amortiguar al tocar el fondo de la red
                if (this.x < COURT.minX - COURT.goalDepth + 4) {
                    this.x = COURT.minX - COURT.goalDepth + 4;
                    this.vx = -this.vx * 0.25;
                } else if (this.x > COURT.maxX + COURT.goalDepth - 4) {
                    this.x = COURT.maxX + COURT.goalDepth - 4;
                    this.vx = -this.vx * 0.25;
                }
            } else {
                // Fuera del marco: rebotar firmemente contra las vallas publicitarias de fondo
                if (this.x - this.radius < COURT.minX) {
                    this.x = COURT.minX + this.radius;
                    this.vx = -this.vx * 0.75;
                    if (Math.abs(this.vx) > 0.8) sound.playTone(500, 'triangle', 0.05, 0.15);
                } else if (this.x + this.radius > COURT.maxX) {
                    this.x = COURT.maxX - this.radius;
                    this.vx = -this.vx * 0.75;
                    if (Math.abs(this.vx) > 0.8) sound.playTone(500, 'triangle', 0.05, 0.15);
                }
            }

            // Guardián de seguridad (Watchdog anti-escape absoluto)
            if (isNaN(this.x) || isNaN(this.y) || this.x < 10 || this.x > COURT.width - 10 || this.y < 10 || this.y > COURT.height - 10) {
                this.reset(COURT.width / 2, COURT.height / 2);
            }

            if (Math.hypot(this.vx, this.vy) < 0.05) {
                this.vx = 0;
                this.vy = 0;
            }
        }
    }

    class Player {
        constructor(id, card, team, isPlayerControlled = false, slotPos = 0) {
            this.id = id;
            this.card = card;
            this.team = team;
            this.isPlayerControlled = isPlayerControlled;
            this.slotPos = slotPos;

            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.facingAngle = team === 1 ? 0 : Math.PI;

            this.state = 'idle'; // 'idle', 'running', 'kicking', 'tackling', 'celebrating'
            this.stateTimer = 0;
            this.animFrame = 0;
            this.animTimer = 0;
            this.breathTimer = Math.random() * Math.PI * 2;

            this.stamina = 100;
            this.isExpelled = false;
            this.tackleCooldown = 0;
        }

        resetPos(x, y, facingRight = true) {
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.facingAngle = facingRight ? 0 : Math.PI;
            this.state = 'idle';
            this.stateTimer = 0;
            this.animFrame = 0;
        }

        update() {
            if (this.isExpelled) return;

            if (this.tackleCooldown > 0) this.tackleCooldown--;
            if (this.stateTimer > 0) {
                this.stateTimer--;
                if (this.stateTimer <= 0 && this.state !== 'celebrating') {
                    this.state = 'idle';
                }
            }

            this.vx *= 0.84;
            this.vy *= 0.84;

            this.x += this.vx;
            this.y += this.vy;

            this.x = Math.max(COURT.minX + 8, Math.min(COURT.maxX - 8, this.x));
            this.y = Math.max(COURT.minY + 8, Math.min(COURT.maxY - 8, this.y));

            const speed = Math.hypot(this.vx, this.vy);
            this.breathTimer += 0.06;

            if (this.state === 'tackling' || this.state === 'kicking' || this.state === 'celebrating') {
                // Mantener estado especial
            } else if (speed > 0.3) {
                this.state = 'running';
                this.animTimer += speed * 0.22;
                if (this.animTimer > 1) {
                    this.animFrame = (this.animFrame + 1) % 6;
                    this.animTimer = 0;
                }
                this.facingAngle = Math.atan2(this.vy, this.vx);
            } else {
                this.state = 'idle';
                this.animFrame = 0;
            }
        }
    }

    // =====================================================================================
    // 5. MOTOR DE REGLAS Y FALTAS (SIN TARJETAS, SIN EXPULSIONES Y SIN ÁRBITRO FÍSICO)
    // =====================================================================================
    class MatchRulesEngine {
        constructor() {
            this.accumulatedFouls = { team1: 0, team2: 0 };
            this.yellowCards = new Map();
            this.redCards = new Set();
            this.currentNotification = null;
        }

        resetMatch() {
            this.accumulatedFouls = { team1: 0, team2: 0 };
            this.yellowCards.clear();
            this.redCards.clear();
            this.currentNotification = null;
        }

        resetHalf() {
            this.accumulatedFouls = { team1: 0, team2: 0 };
        }

        update() {
            if (this.currentNotification) {
                this.currentNotification.timer--;
                if (this.currentNotification.timer <= 0) this.currentNotification = null;
            }
        }

        showNotification(text, type = 'info', duration = 160) {
            this.currentNotification = { text, type, timer: duration };
        }

        processTackleFoul(tackler, victim) {
            const angleDiff = Math.abs(tackler.facingAngle - victim.facingAngle);
            const fromBehind = angleDiff < Math.PI / 2.8;
            const foulChance = Math.max(0.08, Math.min(0.65, 0.2 + (fromBehind ? 0.3 : 0)));

            if (Math.random() > foulChance) return null;

            const key = tackler.team === 1 ? 'team1' : 'team2';
            this.accumulatedFouls[key]++;

            // REGLAMENTO LIMPIO: SIN TARJETAS NI EXPULSIONES
            tackler.isExpelled = false;
            sound.playWhistle('short');

            if (this.accumulatedFouls[key] >= 6) {
                this.showNotification(`🎯 ¡DOBLE PENAL! (${this.accumulatedFouls[key]}ª falta)`, 'double_penalty', 160);
                return { isFoul: true, card: null, isDoublePenalty: true };
            } else {
                this.showNotification(`⚠️ Falta de ${tackler.card.name}`, 'info', 100);
                return { isFoul: true, card: null, isDoublePenalty: false };
            }
        }
    }

    const referee = new MatchRulesEngine();

    // =====================================================================================
    // 6. ENTRADA UNIVERSAL (Teclado P1/P2 Personalizable, Mandos Bluetooth/USB, Táctil y Pausa)
    // =====================================================================================
    class InputManager {
        constructor() {
            this.keys = {};
            this.touch = {
                stick: { active: false, x: 0, y: 0 },
                buttons: { pass: false, shoot: false, sprint: false, tackle: false, switch: false }
            };
            this.isMobile = this.detectMobile();

            // Configuración de controles personalizables con persistencia
            this.defaultBindings = {
                p1: {
                    up: { code: 'KeyW', label: 'W' },
                    down: { code: 'KeyS', label: 'S' },
                    left: { code: 'KeyA', label: 'A' },
                    right: { code: 'KeyD', label: 'D' },
                    pass: { code: 'KeyJ', label: 'J' },
                    shoot: { code: 'KeyK', label: 'K' },
                    tackle: { code: 'KeyU', label: 'U' },
                    sprint: { code: 'KeyL', label: 'L' },
                    switchPlayer: { code: 'Space', label: 'Espacio' }
                },
                p2: {
                    up: { code: 'ArrowUp', label: '↑' },
                    down: { code: 'ArrowDown', label: '↓' },
                    left: { code: 'ArrowLeft', label: '←' },
                    right: { code: 'ArrowRight', label: '→' },
                    pass: { code: 'Numpad1', label: 'Num 1' },
                    shoot: { code: 'Numpad2', label: 'Num 2' },
                    tackle: { code: 'Numpad5', label: 'Num 5' },
                    sprint: { code: 'Numpad3', label: 'Num 3' },
                    switchPlayer: { code: 'Numpad0', label: 'Num 0' }
                }
            };

            this.bindings = JSON.parse(JSON.stringify(this.defaultBindings));
            this.loadBindings();

            // Asignación configurable de mandos por jugador
            // inputMode: 'keyboard', 'gamepad', 'both' (teclado+mando simultáneo)
            // gamepadIndex: índice del mando asignado (-1 = auto/primero disponible)
            this.defaultGamepadConfig = {
                p1: { inputMode: 'both', gamepadIndex: 0 },
                p2: { inputMode: 'both', gamepadIndex: 1 }
            };
            this.gamepadConfig = JSON.parse(JSON.stringify(this.defaultGamepadConfig));
            this.loadGamepadConfig();

            this.listeningBinding = null;
            this.prevGpButtons = {};

            this.init();
        }

        detectMobile() {
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            return (/android|iphone|ipad|ipod|mobile/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1));
        }

        loadBindings() {
            try {
                const saved = localStorage.getItem('retro_futsal_controls_config');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.p1 && parsed.p2) {
                        this.bindings = {
                            p1: { ...this.defaultBindings.p1, ...parsed.p1 },
                            p2: { ...this.defaultBindings.p2, ...parsed.p2 }
                        };
                    }
                }
            } catch (err) {
                console.warn('No se pudieron cargar controles personalizados:', err);
            }
        }

        saveBindings() {
            try {
                localStorage.setItem('retro_futsal_controls_config', JSON.stringify(this.bindings));
            } catch (err) {
                console.warn('Error al guardar controles:', err);
            }
        }

        resetBindings() {
            this.bindings = JSON.parse(JSON.stringify(this.defaultBindings));
            this.saveBindings();
        }

        // Gestión de configuración de mandos por jugador
        loadGamepadConfig() {
            try {
                const saved = localStorage.getItem('retro_futsal_gamepad_config');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.p1 && parsed.p2) {
                        this.gamepadConfig = {
                            p1: { ...this.defaultGamepadConfig.p1, ...parsed.p1 },
                            p2: { ...this.defaultGamepadConfig.p2, ...parsed.p2 }
                        };
                    }
                }
            } catch (err) {
                console.warn('No se pudo cargar config de mandos:', err);
            }
        }

        saveGamepadConfig() {
            try {
                localStorage.setItem('retro_futsal_gamepad_config', JSON.stringify(this.gamepadConfig));
            } catch (err) {
                console.warn('Error al guardar config de mandos:', err);
            }
        }

        setPlayerInputMode(player, mode) {
            if (this.gamepadConfig[player]) {
                this.gamepadConfig[player].inputMode = mode;
                this.saveGamepadConfig();
            }
        }

        setPlayerGamepadIndex(player, index) {
            if (this.gamepadConfig[player]) {
                this.gamepadConfig[player].gamepadIndex = parseInt(index);
                this.saveGamepadConfig();
            }
        }

        resetGamepadConfig() {
            this.gamepadConfig = JSON.parse(JSON.stringify(this.defaultGamepadConfig));
            this.saveGamepadConfig();
        }

        getGamepadForPlayer(player) {
            const cfg = this.gamepadConfig[player];
            if (!cfg || cfg.inputMode === 'keyboard') return null;
            const gamepads = this.getConnectedGamepads();
            if (gamepads.length === 0) return null;
            const idx = cfg.gamepadIndex;
            // Buscar el mando con el índice asignado
            const found = gamepads.find(gp => gp.index === idx);
            if (found) return found;
            // Fallback: si solo hay un mando y el jugador tiene auto, usar ese
            if (gamepads.length === 1 && idx <= 0) return gamepads[0];
            return null;
        }

        formatKeyLabel(code, key) {
            if (code === 'Space') return 'Espacio';
            if (code === 'ArrowUp') return '↑';
            if (code === 'ArrowDown') return '↓';
            if (code === 'ArrowLeft') return '←';
            if (code === 'ArrowRight') return '→';
            if (code.startsWith('Key')) return code.slice(3).toUpperCase();
            if (code.startsWith('Digit')) return code.slice(5);
            if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
            if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
            if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
            if (code === 'Enter') return 'Enter';
            if (code === 'Backspace') return 'Atrás';
            return key ? key.toUpperCase() : code;
        }

        startListening(player, action, buttonEl) {
            if (this.listeningBinding && this.listeningBinding.buttonEl) {
                const prev = this.listeningBinding;
                prev.buttonEl.classList.remove('listening');
                prev.buttonEl.textContent = this.bindings[prev.player][prev.action].label;
            }

            this.listeningBinding = { player, action, buttonEl };
            buttonEl.classList.add('listening');
            buttonEl.textContent = '⌨️ Pulsa tecla...';
        }

        handleKeyRemap(e) {
            if (!this.listeningBinding) return false;

            e.preventDefault();
            e.stopPropagation();

            const { player, action, buttonEl } = this.listeningBinding;
            const label = this.formatKeyLabel(e.code, e.key);

            this.bindings[player][action] = {
                code: e.code,
                label: label
            };

            this.saveBindings();

            buttonEl.textContent = label;
            buttonEl.classList.remove('listening');
            this.listeningBinding = null;

            const toast = document.getElementById('controls-save-toast');
            if (toast) {
                toast.textContent = `✅ Asignado: [${label}] para ${action.toUpperCase()} (${player.toUpperCase()})`;
                toast.classList.remove('hidden');
                setTimeout(() => toast.classList.add('hidden'), 2500);
            }

            sound.playTone(550, 'sine', 0.08, 0.2);
            return true;
        }

        init() {
            window.addEventListener('keydown', (e) => {
                if (this.listeningBinding) {
                    this.handleKeyRemap(e);
                    return;
                }

                if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    if (document.activeElement === document.body || document.activeElement.tagName === 'CANVAS') {
                        e.preventDefault();
                    }
                }

                // Atajo de teclado para Pausa (Escape o tecla P)
                if (e.code === 'Escape' || e.code === 'KeyP') {
                    if (window.retroFutsalApp && window.retroFutsalApp.matchEngine && window.retroFutsalApp.matchEngine.isRunning) {
                        window.retroFutsalApp.matchEngine.togglePause();
                    }
                }

                this.keys[e.code] = true;
                if (e.key) this.keys[e.key.toLowerCase()] = true;
            });

            window.addEventListener('keyup', (e) => {
                this.keys[e.code] = false;
                if (e.key) this.keys[e.key.toLowerCase()] = false;
            });

            // Escuchar mandos Bluetooth / USB
            window.addEventListener('gamepadconnected', (e) => {
                console.log('🎮 Mando Bluetooth/USB conectado:', e.gamepad.id);
                this.updateGamepadStatus();
            });

            window.addEventListener('gamepaddisconnected', (e) => {
                console.log('🎮 Mando desconectado:', e.gamepad.id);
                this.updateGamepadStatus();
            });

            this.initTouch();
        }

        getConnectedGamepads() {
            if (!navigator.getGamepads) return [];
            const raw = navigator.getGamepads();
            const list = [];
            for (let i = 0; i < raw.length; i++) {
                if (raw[i] && raw[i].connected) list.push(raw[i]);
            }
            return list;
        }

        updateGamepadStatus() {
            const gps = this.getConnectedGamepads();
            const badge = document.getElementById('gamepad-status');
            const pill = document.getElementById('gamepad-live-status-pill');
            const nameEl = document.getElementById('gamepad-connected-name');

            if (gps.length === 0) {
                if (badge) badge.textContent = '⌨️ Teclado / 📱 Táctil';
                if (pill) {
                    pill.className = 'status-pill status-disconnected';
                    pill.textContent = '🔴 Sin mandos detectados';
                }
                if (nameEl) nameEl.textContent = 'Ningún mando activo (Presiona cualquier botón en tu mando Bluetooth para activarlo)';
            } else if (gps.length === 1) {
                const name = gps[0].id.length > 28 ? gps[0].id.substring(0, 26) + '...' : gps[0].id;
                if (badge) badge.textContent = `🎮 ${name} (BT/USB)`;
                if (pill) {
                    pill.className = 'status-pill status-connected';
                    pill.textContent = '🟢 Mando Bluetooth / USB Conectado';
                }
                if (nameEl) nameEl.textContent = `${gps[0].id} (Índice: ${gps[0].index})`;
            } else {
                if (badge) badge.textContent = `🎮 2 Mandos Detectados (P1 y P2)`;
                if (pill) {
                    pill.className = 'status-pill status-connected';
                    pill.textContent = `🟢 ${gps.length} Mandos Bluetooth / USB Conectados`;
                }
                if (nameEl) nameEl.textContent = `P1: ${gps[0].id} | P2: ${gps[1].id}`;
            }
        }

        pollGamepadTester() {
            const gps = this.getConnectedGamepads();
            if (gps.length === 0) return;

            const gp = gps[0];
            const checkBtn = (btnIdx, domId) => {
                const el = document.getElementById(domId);
                if (!el) return;
                const pressed = !!(gp.buttons[btnIdx] && gp.buttons[btnIdx].pressed);
                el.classList.toggle('active', pressed);
            };

            checkBtn(0, 'gp-btn-0');
            checkBtn(1, 'gp-btn-1');
            checkBtn(2, 'gp-btn-2');
            checkBtn(3, 'gp-btn-3');
            checkBtn(4, 'gp-btn-4');
            checkBtn(5, 'gp-btn-5');
            checkBtn(6, 'gp-btn-6');
            checkBtn(7, 'gp-btn-7');
            checkBtn(9, 'gp-btn-9');

            const upEl = document.getElementById('gp-dir-up');
            const downEl = document.getElementById('gp-dir-down');
            const leftEl = document.getElementById('gp-dir-left');
            const rightEl = document.getElementById('gp-dir-right');

            const axX = Math.abs(gp.axes[0] || 0) > 0.25 ? gp.axes[0] : 0;
            const axY = Math.abs(gp.axes[1] || 0) > 0.25 ? gp.axes[1] : 0;

            const dUp = !!(gp.buttons[12]?.pressed || axY < -0.3);
            const dDown = !!(gp.buttons[13]?.pressed || axY > 0.3);
            const dLeft = !!(gp.buttons[14]?.pressed || axX < -0.3);
            const dRight = !!(gp.buttons[15]?.pressed || axX > 0.3);

            if (upEl) upEl.classList.toggle('active', dUp);
            if (downEl) downEl.classList.toggle('active', dDown);
            if (leftEl) leftEl.classList.toggle('active', dLeft);
            if (rightEl) rightEl.classList.toggle('active', dRight);
        }

        isActionDown(player, action) {
            const b = this.bindings[player] && this.bindings[player][action];
            if (!b) return false;

            if (this.keys[b.code]) return true;

            if (b.code.startsWith('Key')) {
                const char = b.code.slice(3).toLowerCase();
                if (this.keys[char]) return true;
            }

            if (action === 'sprint' && player === 'p1' && (this.keys['ShiftLeft'] || this.keys['ShiftRight'])) return true;
            if (action === 'switchPlayer' && player === 'p1' && this.keys['Space']) return true;

            return false;
        }

        initTouch() {
            const joystickBase = document.getElementById('touch-joystick-base');
            const thumb = document.getElementById('touch-joystick-thumb');
            if (!joystickBase || !thumb) return;

            const maxR = 40;
            let touchId = null;

            const handleMove = (clientX, clientY, rect) => {
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = clientX - cx;
                const dy = clientY - cy;
                const dist = Math.hypot(dx, dy);

                let clampX = dx;
                let clampY = dy;
                if (dist > maxR) {
                    clampX = (dx / dist) * maxR;
                    clampY = (dy / dist) * maxR;
                }

                this.touch.stick.x = clampX / maxR;
                this.touch.stick.y = clampY / maxR;
                thumb.style.transform = `translate(${clampX}px, ${clampY}px)`;
            };

            joystickBase.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const t = e.changedTouches[0];
                touchId = t.identifier;
                this.touch.stick.active = true;
                handleMove(t.clientX, t.clientY, joystickBase.getBoundingClientRect());
            }, { passive: false });

            joystickBase.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === touchId) {
                        handleMove(t.clientX, t.clientY, joystickBase.getBoundingClientRect());
                        break;
                    }
                }
            }, { passive: false });

            const endTouch = () => {
                this.touch.stick.active = false;
                this.touch.stick.x = 0;
                this.touch.stick.y = 0;
                thumb.style.transform = 'translate(0px, 0px)';
            };

            joystickBase.addEventListener('touchend', endTouch);
            joystickBase.addEventListener('touchcancel', endTouch);

            const bindBtn = (id, key) => {
                const btn = document.getElementById(id);
                if (!btn) return;
                const press = (e) => { e.preventDefault(); this.touch.buttons[key] = true; btn.classList.add('pressed'); };
                const release = (e) => { e.preventDefault(); this.touch.buttons[key] = false; btn.classList.remove('pressed'); };
                btn.addEventListener('touchstart', press, { passive: false });
                btn.addEventListener('touchend', release);
                btn.addEventListener('touchcancel', release);
                btn.addEventListener('mousedown', press);
                btn.addEventListener('mouseup', release);
                btn.addEventListener('mouseleave', release);
            };

            bindBtn('btn-touch-pass', 'pass');
            bindBtn('btn-touch-shoot', 'shoot');
            bindBtn('btn-touch-sprint', 'sprint');
            bindBtn('btn-touch-tackle', 'tackle');
            bindBtn('btn-touch-switch', 'switch');
        }

        getPlayer1Input() {
            const cfg = this.gamepadConfig.p1;
            const useKeyboard = cfg.inputMode === 'keyboard' || cfg.inputMode === 'both';
            const useGamepad = cfg.inputMode === 'gamepad' || cfg.inputMode === 'both';

            let x = 0, y = 0;
            if (useKeyboard) {
                if (this.isActionDown('p1', 'up')) y -= 1;
                if (this.isActionDown('p1', 'down')) y += 1;
                if (this.isActionDown('p1', 'left')) x -= 1;
                if (this.isActionDown('p1', 'right')) x += 1;
            }

            if (this.touch.stick.active) {
                x += this.touch.stick.x;
                y += this.touch.stick.y;
            }

            let pass = (useKeyboard && this.isActionDown('p1', 'pass')) || this.touch.buttons.pass;
            let shoot = (useKeyboard && this.isActionDown('p1', 'shoot')) || this.touch.buttons.shoot;
            let sprint = (useKeyboard && this.isActionDown('p1', 'sprint')) || this.touch.buttons.sprint;
            let tackle = (useKeyboard && this.isActionDown('p1', 'tackle')) || this.touch.buttons.tackle;
            let switchPlayer = (useKeyboard && this.isActionDown('p1', 'switchPlayer')) || this.touch.buttons.switch;

            // Soporte de Mando Bluetooth / USB para Jugador 1 (usa mando asignado)
            if (useGamepad) {
                const gp = this.getGamepadForPlayer('p1');
                if (gp) {
                    const deadzone = 0.22;

                    let gpX = Math.abs(gp.axes[0] || 0) > deadzone ? gp.axes[0] : 0;
                    let gpY = Math.abs(gp.axes[1] || 0) > deadzone ? gp.axes[1] : 0;

                    if (gp.buttons[12]?.pressed) gpY = -1;
                    if (gp.buttons[13]?.pressed) gpY = 1;
                    if (gp.buttons[14]?.pressed) gpX = -1;
                    if (gp.buttons[15]?.pressed) gpX = 1;

                    if (gpX !== 0 || gpY !== 0) {
                        x = gpX;
                        y = gpY;
                    }

                    if (gp.buttons[0]?.pressed) pass = true; // A / Cruz
                    if (gp.buttons[1]?.pressed) tackle = true; // B / Círculo
                    if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) shoot = true; // X / Cuadrado o Y
                    if (gp.buttons[4]?.pressed || gp.buttons[6]?.pressed || (gp.buttons[6]?.value > 0.3)) switchPlayer = true; // LB o LT
                    if (gp.buttons[5]?.pressed || gp.buttons[7]?.pressed || (gp.buttons[7]?.value > 0.3)) sprint = true; // RB o RT

                    if (gp.buttons[9]?.pressed) {
                        if (!this.prevGpButtons['start_p1']) {
                            if (window.retroFutsalApp && window.retroFutsalApp.matchEngine && window.retroFutsalApp.matchEngine.isRunning) {
                                window.retroFutsalApp.matchEngine.togglePause();
                            }
                        }
                        this.prevGpButtons['start_p1'] = true;
                    } else {
                        this.prevGpButtons['start_p1'] = false;
                    }
                }
            }

            const len = Math.hypot(x, y);
            if (len > 1) { x /= len; y /= len; }

            return { x, y, pass, shoot, sprint, tackle, switchPlayer };
        }

        getPlayer2Input() {
            const cfg = this.gamepadConfig.p2;
            const useKeyboard = cfg.inputMode === 'keyboard' || cfg.inputMode === 'both';
            const useGamepad = cfg.inputMode === 'gamepad' || cfg.inputMode === 'both';

            let x = 0, y = 0;
            if (useKeyboard) {
                if (this.isActionDown('p2', 'up')) y -= 1;
                if (this.isActionDown('p2', 'down')) y += 1;
                if (this.isActionDown('p2', 'left')) x -= 1;
                if (this.isActionDown('p2', 'right')) x += 1;
            }

            let pass = useKeyboard && this.isActionDown('p2', 'pass');
            let shoot = useKeyboard && this.isActionDown('p2', 'shoot');
            let sprint = useKeyboard && this.isActionDown('p2', 'sprint');
            let tackle = useKeyboard && this.isActionDown('p2', 'tackle');
            let switchPlayer = useKeyboard && this.isActionDown('p2', 'switchPlayer');

            // Soporte de Mando Bluetooth / USB para Jugador 2 (usa mando asignado)
            if (useGamepad) {
                const gp = this.getGamepadForPlayer('p2');
                if (gp) {
                    const deadzone = 0.22;

                    let gpX = Math.abs(gp.axes[0] || 0) > deadzone ? gp.axes[0] : 0;
                    let gpY = Math.abs(gp.axes[1] || 0) > deadzone ? gp.axes[1] : 0;

                    if (gp.buttons[12]?.pressed) gpY = -1;
                    if (gp.buttons[13]?.pressed) gpY = 1;
                    if (gp.buttons[14]?.pressed) gpX = -1;
                    if (gp.buttons[15]?.pressed) gpX = 1;

                    if (gpX !== 0 || gpY !== 0) {
                        x = gpX;
                        y = gpY;
                    }

                    if (gp.buttons[0]?.pressed) pass = true;
                    if (gp.buttons[1]?.pressed) tackle = true;
                    if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) shoot = true;
                    if (gp.buttons[4]?.pressed || gp.buttons[6]?.pressed) switchPlayer = true;
                    if (gp.buttons[5]?.pressed || gp.buttons[7]?.pressed) sprint = true;

                    if (gp.buttons[9]?.pressed) {
                        if (!this.prevGpButtons['start_p2']) {
                            if (window.retroFutsalApp && window.retroFutsalApp.matchEngine && window.retroFutsalApp.matchEngine.isRunning) {
                                window.retroFutsalApp.matchEngine.togglePause();
                            }
                        }
                        this.prevGpButtons['start_p2'] = true;
                    } else {
                        this.prevGpButtons['start_p2'] = false;
                    }
                }
            }

            const len = Math.hypot(x, y);
            if (len > 1) { x /= len; y /= len; }

            return { x, y, pass, shoot, sprint, tackle, switchPlayer };
        }
    }

    const input = new InputManager();
    window.retroFutsalInput = input;
    window.input = input;

    // =====================================================================================
    // 7. MOTOR DE INTELIGENCIA ARTIFICIAL (IA) CON EVASIÓN SUAVE
    // =====================================================================================
    class AIEngine {
        constructor(difficulty = 'normal') {
            this.difficulty = difficulty;
        }

        updateTeamAI(teamPlayers, oppPlayers, ball, isAttackingRight) {
            const teamHasBall = ball.owner && teamPlayers.includes(ball.owner);

            teamPlayers.forEach(player => {
                if (player.isExpelled) return;

                if (player.card.position === 'POR') {
                    this.updateGoalkeeper(player, ball, isAttackingRight);
                } else if (player === ball.owner) {
                    this.updateCarrier(player, teamPlayers, oppPlayers, ball, isAttackingRight);
                } else if (teamHasBall) {
                    this.updateOffBall(player, ball, isAttackingRight);
                } else {
                    this.updateDefense(player, oppPlayers, ball, isAttackingRight);
                }

                this.applySoftAvoidance(player, teamPlayers, oppPlayers);
            });
        }

        updateGoalkeeper(gk, ball, isAttackingRight) {
            const goalX = isAttackingRight ? COURT.minX + 35 : COURT.maxX - 35;
            const targetY = Math.max(COURT.goalTop + 15, Math.min(COURT.goalBottom - 15, ball.y));

            const dx = goalX - gk.x;
            const dy = targetY - gk.y;
            const speed = 2.4;

            gk.vx += dx * 0.15;
            gk.vy += dy * 0.15;
            const len = Math.hypot(gk.vx, gk.vy);
            if (len > speed) { gk.vx = (gk.vx / len) * speed; gk.vy = (gk.vy / len) * speed; }
            gk.facingAngle = isAttackingRight ? 0 : Math.PI;
        }

        updateCarrier(player, team, opp, ball, isAttackingRight) {
            const targetX = isAttackingRight ? COURT.maxX - 60 : COURT.minX + 60;
            const targetY = COURT.height / 2;

            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const distToGoal = Math.hypot(dx, dy);

            const maxSpeed = 2.8 + (player.card.stats.vel / 120) * 1.4;

            // Disparo si está cerca del área rival
            if (distToGoal < 300) {
                const shotPower = 7.5 + (player.card.stats.tir / 120) * 4.5;
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.25;
                ball.kick(Math.cos(angle) * shotPower, Math.sin(angle) * shotPower, 2.5, player);
                player.state = 'kicking';
                player.stateTimer = 18;
                sound.playKick(1.2);
                return;
            }

            // Oportunidad de pase a compañero mejor perfilado
            if (Math.random() < 0.035) {
                const openMate = team.find(m => m !== player && m.card.position !== 'POR' && !m.isExpelled);
                if (openMate) {
                    const passDx = openMate.x - player.x;
                    const passDy = openMate.y - player.y;
                    const passDist = Math.hypot(passDx, passDy);
                    if (passDist > 80 && passDist < 350) {
                        const passSpd = 6.5 + (player.card.stats.pas / 120) * 3;
                        ball.kick((passDx / passDist) * passSpd, (passDy / passDist) * passSpd, 0, player);
                        player.state = 'kicking';
                        player.stateTimer = 12;
                        sound.playPass();
                        return;
                    }
                }
            }

            // Conducción hacia portería rival
            player.vx += (dx / distToGoal) * 0.5;
            player.vy += (dy / distToGoal) * 0.5;
            const curSpd = Math.hypot(player.vx, player.vy);
            if (curSpd > maxSpeed) { player.vx = (player.vx / curSpd) * maxSpeed; player.vy = (player.vy / curSpd) * maxSpeed; }
            player.facingAngle = Math.atan2(player.vy, player.vx);
        }

        updateOffBall(player, ball, isAttackingRight) {
            const baseX = isAttackingRight ? COURT.width * 0.65 : COURT.width * 0.35;
            const baseY = player.slotPos === 1 ? COURT.height * 0.3 : (player.slotPos === 2 ? COURT.height * 0.5 : COURT.height * 0.7);

            const dx = (baseX + (ball.x - COURT.width / 2) * 0.4) - player.x;
            const dy = baseY - player.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 25) {
                player.vx += (dx / dist) * 0.35;
                player.vy += (dy / dist) * 0.35;
            }
        }

        updateDefense(player, oppPlayers, ball, isAttackingRight) {
            const targetX = ball.x;
            const targetY = ball.y;
            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const dist = Math.hypot(dx, dy);

            const maxSpeed = 2.6 + (player.card.stats.vel / 120) * 1.2;

            if (dist < 35 && player.tackleCooldown <= 0 && ball.owner && ball.owner.team !== player.team) {
                // Intento de robo / barrida
                player.state = 'tackling';
                player.stateTimer = 22;
                player.tackleCooldown = 65;
                sound.playTackle();

                const foulRes = referee.processTackleFoul(player, ball.owner);
                if (!foulRes) {
                    // Robo limpio
                    ball.owner = player;
                }
                return;
            }

            if (dist > 15) {
                player.vx += (dx / dist) * 0.45;
                player.vy += (dy / dist) * 0.45;
                const spd = Math.hypot(player.vx, player.vy);
                if (spd > maxSpeed) { player.vx = (player.vx / spd) * maxSpeed; player.vy = (player.vy / spd) * maxSpeed; }
            }
        }

        applySoftAvoidance(player, team, opp) {
            const allOthers = [...team, ...opp].filter(p => p !== player && !p.isExpelled);
            const avoidDist = 28;

            allOthers.forEach(other => {
                const dx = player.x - other.x;
                const dy = player.y - other.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < avoidDist) {
                    const force = (avoidDist - dist) / avoidDist;
                    player.vx += (dx / dist) * force * 0.35;
                    player.vy += (dy / dist) * force * 0.35;
                }
            });
        }
    }

    const aiEngine = new AIEngine('normal');

    // =====================================================================================
    // 8. MOTOR DE PARTIDO Y RENDERIZADOR 60 FPS
    // =====================================================================================
    class MatchEngine {
        constructor(canvas, onMatchEndCallback) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.onMatchEnd = onMatchEndCallback;

            this.isRunning = false;
            this.isPaused = false;
            this.mode = 'vs_cpu'; // 'vs_cpu', 'local_2p', 'online', 'tutorial'
            this.difficulty = 'normal';

            this.score = { team1: 0, team2: 0 };
            this.matchTime = 0; // segundos
            this.half = 1;      // 1: 1er tiempo, 2: 2do tiempo, 3: descanso, 4: final
            this.halfDuration = 90; // 90 seg por tiempo

            this.ball = new Ball();
            this.referee = referee;
            this.team1 = [];
            this.team2 = [];
            this.controlledPlayer1 = null;
            this.controlledPlayer2 = null;

            this.matchStats = { shots1: 0, shots2: 0, possession1: 50, possession2: 50, possFrames1: 0, possFrames2: 0 };
            this.celebrationTimer = 0;
            this.goalText = '';
        }

        initMatch(mode = 'vs_cpu', difficulty = 'normal') {
            return this.startMatch(mode, difficulty);
        }

        startMatch(mode = 'vs_cpu', difficulty = 'normal', durationMinutes = 3) {
            this.mode = mode;
            this.difficulty = difficulty;
            aiEngine.difficulty = difficulty;

            this.durationMinutes = Number(durationMinutes) || 3;
            this.totalDuration = this.durationMinutes * 60; // segundos en tiempo real
            this.halfDuration = this.totalDuration / 2;     // segundos en tiempo real por tiempo

            this.score = { team1: 0, team2: 0 };
            this.matchTime = 0;
            this.half = 1;
            this.isPaused = false;
            this.switchCooldown = { 1: 0, 2: 0 };
            this.matchStats = { shots1: 0, shots2: 0, possession1: 50, possession2: 50, possFrames1: 0, possFrames2: 0 };

            document.getElementById('pause-modal')?.classList.add('hidden');

            referee.resetMatch();
            this.setupTeams();
            this.resetKickoff(1);

            this.isRunning = true;
            sound.playWhistle('double');
        }

        togglePause(forcedState = null) {
            if (!this.isRunning) return;
            this.isPaused = (forcedState !== null) ? forcedState : !this.isPaused;

            const modal = document.getElementById('pause-modal');
            if (modal) {
                if (this.isPaused) {
                    modal.classList.remove('hidden');
                    const btnRestart = document.getElementById('btn-restart-match');
                    if (btnRestart) {
                        btnRestart.style.display = 'block';
                    }
                } else {
                    modal.classList.add('hidden');
                }
            }
        }

        restartMatch() {
            this.isPaused = false;
            document.getElementById('pause-modal')?.classList.add('hidden');
            this.score = { team1: 0, team2: 0 };
            this.matchTime = 0;
            this.half = 1;
            this.switchCooldown = { 1: 0, 2: 0 };
            this.matchStats = { shots1: 0, shots2: 0, possession1: 50, possession2: 50, possFrames1: 0, possFrames2: 0 };
            referee.resetMatch();
            this.resetKickoff(1);
            this.isRunning = true;
            sound.playWhistle('double');
        }

        setupTeams() {
            // Equipo 1: Mi Plantilla (5 jugadores)
            this.team1 = clubManager.squad.map((card, idx) => new Player(`p1_${idx}`, card, 1, false, idx));

            // Equipo 2: Rival
            const rivalNation = NATIONS[Math.floor(Math.random() * NATIONS.length)];
            const rivalMinOvr = this.difficulty === 'legend' ? 100 : (this.difficulty === 'hard' ? 88 : (this.difficulty === 'normal' ? 80 : 68));
            const rivalMaxOvr = this.difficulty === 'legend' ? 120 : (this.difficulty === 'hard' ? 105 : (this.difficulty === 'normal' ? 92 : 78));

            const positions = ['POR', 'DEF', 'MC', 'DEL', 'DEL'];
            this.team2 = positions.map((pos, idx) => {
                const card = generateRandomCard(pos, rivalMinOvr, rivalMaxOvr);
                card.nation = rivalNation.code;
                return new Player(`p2_${idx}`, card, 2, false, idx);
            });

            this.controlledPlayer1 = this.team1[3] || this.team1[0];
            this.controlledPlayer1.isPlayerControlled = true;

            if (this.mode === 'local_2p') {
                this.controlledPlayer2 = this.team2[3] || this.team2[0];
                this.controlledPlayer2.isPlayerControlled = true;
            }
        }

        resetKickoff(kickingTeam = 1) {
            const cy = COURT.height / 2;

            // Posiciones iniciales Equipo 1 (Defiende izquierda)
            const t1Pos = [
                { x: COURT.minX + 35, y: cy },
                { x: COURT.width * 0.25, y: cy },
                { x: COURT.width * 0.38, y: cy * 0.6 },
                { x: COURT.width * 0.44, y: cy * 1.4 },
                { x: kickingTeam === 1 ? COURT.width / 2 - 15 : COURT.width * 0.45, y: cy }
            ];

            this.team1.forEach((p, idx) => p.resetPos(t1Pos[idx].x, t1Pos[idx].y, true));

            // Posiciones iniciales Equipo 2 (Defiende derecha)
            const t2Pos = [
                { x: COURT.maxX - 35, y: cy },
                { x: COURT.width * 0.75, y: cy },
                { x: COURT.width * 0.62, y: cy * 0.6 },
                { x: COURT.width * 0.56, y: cy * 1.4 },
                { x: kickingTeam === 2 ? COURT.width / 2 + 15 : COURT.width * 0.55, y: cy }
            ];

            this.team2.forEach((p, idx) => p.resetPos(t2Pos[idx].x, t2Pos[idx].y, false));

            this.ball.reset(COURT.width / 2, COURT.height / 2);
            this.celebrationTimer = 0;
            this.goalText = '';
        }

        update() {
            if (!this.isRunning || this.isPaused) return;

            // Temporizador de celebración de gol
            if (this.celebrationTimer > 0) {
                this.celebrationTimer--;
                if (this.celebrationTimer <= 0) {
                    this.resetKickoff(this.lastScoringTeam === 1 ? 2 : 1);
                }
                return;
            }

            // Cronómetro de partido en tiempo real
            this.matchTime += 1 / 60;
            if (this.half === 1 && this.matchTime >= this.halfDuration) {
                this.half = 3; // Descanso
                this.isRunning = false;
                sound.playWhistle('double');
                return;
            } else if (this.half === 2 && this.matchTime >= (this.totalDuration || (this.halfDuration * 2))) {
                this.half = 4; // Final del partido
                this.isRunning = false;
                sound.playWhistle('long');
                this.handleMatchEnd();
                return;
            }

            if (!this.switchCooldown) this.switchCooldown = { 1: 0, 2: 0 };
            if (this.switchCooldown[1] > 0) this.switchCooldown[1]--;
            if (this.switchCooldown[2] > 0) this.switchCooldown[2]--;

            // Control de Entrada Jugador 1
            const in1 = input.getPlayer1Input();
            if (this.controlledPlayer1 && !this.controlledPlayer1.isExpelled) {
                this.applyPlayerInput(this.controlledPlayer1, in1, this.team1, 1);
            }

            // Cambio de jugador P1 con protección de repetición (debounce)
            if (in1.switchPlayer && this.switchCooldown[1] <= 0) {
                this.switchActivePlayer(1);
                this.switchCooldown[1] = 16;
            }

            // Control de Entrada Jugador 2 (si es 1v1 local)
            if (this.mode === 'local_2p' && this.controlledPlayer2 && !this.controlledPlayer2.isExpelled) {
                const in2 = input.getPlayer2Input();
                this.applyPlayerInput(this.controlledPlayer2, in2, this.team2, 2);
                if (in2.switchPlayer && this.switchCooldown[2] <= 0) {
                    this.switchActivePlayer(2);
                    this.switchCooldown[2] = 16;
                }
            }

            // IA para el resto de jugadores
            const aiTeam1 = this.team1.filter(p => p !== this.controlledPlayer1);
            aiEngine.updateTeamAI(aiTeam1, this.team2, this.ball, true);

            const aiTeam2 = (this.mode === 'local_2p') ? this.team2.filter(p => p !== this.controlledPlayer2) : this.team2;
            aiEngine.updateTeamAI(aiTeam2, this.team1, this.ball, false);

            // Actualizar entidades (el árbitro ya NO se actualiza en la pista)
            this.team1.forEach(p => p.update());
            this.team2.forEach(p => p.update());
            this.ball.update();
            referee.update();

            // Detección de posesión y contacto con el balón
            this.checkBallCollisions();

            // Detección de GOL
            this.checkGoal();
        }

        applyPlayerInput(player, inData, team, teamNum) {
            // Corrección de velocidad y cálculo de sprint + regate 64-bit
            const velBonus = ((player.card.stats.vel || 80) / 120) * 1.6;
            const regBonus = ((player.card.stats.reg || 80) / 120) * 0.7;
            const maxSpd = (inData.sprint ? 3.9 : 2.6) + velBonus + (inData.sprint ? regBonus : 0);

            player.vx += inData.x * 0.65;
            player.vy += inData.y * 0.65;
            const spd = Math.hypot(player.vx, player.vy);
            if (spd > maxSpd) {
                player.vx = (player.vx / spd) * maxSpd;
                player.vy = (player.vy / spd) * maxSpd;
            }

            if (inData.x !== 0 || inData.y !== 0) {
                player.facingAngle = Math.atan2(inData.y, inData.x);
            }

            // Pase inteligente y teledirigido 64-bit (sin pérdidas erráticas)
            if (inData.pass && this.ball.owner === player) {
                const mates = team.filter(m => m !== player && !m.isExpelled);
                let bestMate = mates[0];
                let bestScore = -999;

                mates.forEach(m => {
                    const dx = m.x - player.x;
                    const dy = m.y - player.y;
                    const dist = Math.hypot(dx, dy);
                    const dot = (dx / dist) * Math.cos(player.facingAngle) + (dy / dist) * Math.sin(player.facingAngle);
                    const score = dot * 2.5 - (dist / 900);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMate = m;
                    }
                });

                if (bestMate) {
                    // Pase al espacio / con anticipación
                    const leadX = bestMate.x + (bestMate.vx || 0) * 7;
                    const leadY = bestMate.y + (bestMate.vy || 0) * 7;
                    const dx = leadX - player.x;
                    const dy = leadY - player.y;
                    const dist = Math.hypot(dx, dy);
                    const passPower = 7.6 + ((player.card.stats.pas || 80) / 120) * 3.8;
                    this.ball.targetMate = bestMate;
                    this.ball.kick((dx / dist) * passPower, (dy / dist) * passPower, 0, player);
                } else {
                    this.ball.kick(Math.cos(player.facingAngle) * 8.5, Math.sin(player.facingAngle) * 8.5, 0, player);
                }
                player.state = 'kicking';
                player.stateTimer = 14;
                sound.playPass();
            }

            // Tiro potente y calibrado a postes
            if (inData.shoot && this.ball.owner === player) {
                const targetGoalX = teamNum === 1 ? COURT.maxX : COURT.minX;
                const cornerOffset = (Math.random() - 0.5) * (COURT.goalBottom - COURT.goalTop - 25);
                const targetGoalY = COURT.height / 2 + cornerOffset;
                const dx = targetGoalX - player.x;
                const dy = targetGoalY - player.y;
                const dist = Math.hypot(dx, dy);

                const shotPower = 8.8 + ((player.card.stats.tir || 80) / 120) * 5.2;
                this.ball.kick((dx / dist) * shotPower, (dy / dist) * shotPower, 3.2, player);
                player.state = 'kicking';
                player.stateTimer = 16;
                sound.playKick(1.4);

                if (teamNum === 1) this.matchStats.shots1++;
                else this.matchStats.shots2++;
            }

            // Barrida / Robo calibrado con éxito según estadística DEF
            if (inData.tackle && player.tackleCooldown <= 0 && this.ball.owner !== player) {
                player.state = 'tackling';
                player.stateTimer = 26;
                player.tackleCooldown = 55;
                player.vx += Math.cos(player.facingAngle) * 5.2;
                player.vy += Math.sin(player.facingAngle) * 5.2;
                sound.playTackle();

                if (this.ball.owner && this.ball.owner.team !== teamNum) {
                    const dist = Math.hypot(player.x - this.ball.owner.x, player.y - this.ball.owner.y);
                    if (dist < 42) {
                        const foul = referee.processTackleFoul(player, this.ball.owner);
                        if (!foul) {
                            const defStat = player.card.stats.def || 80;
                            const regStat = this.ball.owner.card.stats.reg || 80;
                            const stealChance = 0.55 + ((defStat - regStat) / 200);
                            if (Math.random() < Math.max(0.35, Math.min(0.9, stealChance))) {
                                this.ball.owner = player;
                                this.ball.vx = player.vx * 0.4;
                                this.ball.vy = player.vy * 0.4;
                            } else {
                                this.ball.owner = null;
                                this.ball.vx = (Math.random() - 0.5) * 5;
                                this.ball.vy = (Math.random() - 0.5) * 5;
                            }
                        }
                    }
                }
            }
        }

        switchActivePlayer(teamNum) {
            const team = teamNum === 1 ? this.team1 : this.team2;
            const current = teamNum === 1 ? this.controlledPlayer1 : this.controlledPlayer2;

            // ¡AHORA PUEDES CAMBIAR AL PORTERO! Se eliminó el filtro de posición POR
            const candidates = team.filter(p => p !== current && !p.isExpelled);
            if (candidates.length === 0) return;

            let closest = candidates[0];
            let minDist = 9999;
            candidates.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minDist) { minDist = d; closest = p; }
            });

            if (current) current.isPlayerControlled = false;
            closest.isPlayerControlled = true;

            if (teamNum === 1) this.controlledPlayer1 = closest;
            else this.controlledPlayer2 = closest;

            // Indicar si se seleccionó el portero
            if (closest.card.position === 'POR') {
                sound.playTone(600, 'sine', 0.06, 0.2);
            } else {
                sound.playTone(480, 'sine', 0.05, 0.15);
            }
        }

        checkBallCollisions() {
            const allPlayers = [...this.team1, ...this.team2].filter(p => !p.isExpelled);

            if (this.ball.owner) {
                if (this.ball.owner.team === 1) this.matchStats.possFrames1++;
                else this.matchStats.possFrames2++;

                const totalPoss = this.matchStats.possFrames1 + this.matchStats.possFrames2;
                if (totalPoss > 0) {
                    this.matchStats.possession1 = Math.round((this.matchStats.possFrames1 / totalPoss) * 100);
                    this.matchStats.possession2 = 100 - this.matchStats.possession1;
                }
                return;
            }

            allPlayers.forEach(p => {
                const dist = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                const isTarget = this.ball.targetMate === p;
                const snapThreshold = isTarget ? 26 : 20;

                if (dist < snapThreshold && this.ball.z < 18) {
                    this.ball.owner = p;
                    this.ball.targetMate = null;
                    sound.playTone(240, 'triangle', 0.06, 0.15);
                }
            });
        }

        checkGoal() {
            const b = this.ball;
            const inGoalY = b.y >= COURT.goalTop && b.y <= COURT.goalBottom;

            // Gol Equipo 1 (Portería derecha)
            if (b.x >= COURT.maxX && inGoalY) {
                this.score.team1++;
                this.lastScoringTeam = 1;
                this.celebrationTimer = 160;
                const homeName = authManager.currentUser.name || 'MI CLUB';
                this.goalText = `⚽ ¡¡¡GOOOOOOL DE ${homeName.toUpperCase()}!!! ⚽`;
                sound.playGoal();
                this.team1.forEach(p => p.state = 'celebrating');
            }
            // Gol Equipo 2 (Portería izquierda)
            else if (b.x <= COURT.minX && inGoalY) {
                this.score.team2++;
                this.lastScoringTeam = 2;
                this.celebrationTimer = 160;
                this.goalText = '⚽ ¡GOL DEL RIVAL! ⚽';
                sound.playGoal();
                this.team2.forEach(p => p.state = 'celebrating');
            }
        }

        resumeSecondHalf() {
            this.half = 2;
            this.isRunning = true;
            referee.resetHalf();
            this.resetKickoff(2);
            sound.playWhistle('double');
        }

        handleMatchEnd() {
            const reward = this.calculateCoinsReward();
            clubManager.addCoins(reward);

            if (this.onMatchEnd) {
                this.onMatchEnd({
                    score: this.score,
                    stats: this.matchStats,
                    coinsEarned: reward
                });
            }
        }

        calculateCoinsReward() {
            let coins = 40;
            if (this.score.team1 > this.score.team2) {
                coins = this.difficulty === 'legend' ? 350 : (this.difficulty === 'hard' ? 260 : (this.difficulty === 'normal' ? 200 : 150));
            } else if (this.score.team1 === this.score.team2) {
                coins = 80;
            }
            coins += this.score.team1 * 35;
            if (this.score.team2 === 0 && this.score.team1 > 0) coins += 100; // Portería a cero
            return coins;
        }

        render() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, COURT.width, COURT.height);

            this.renderPitch(ctx);
            this.renderEntities(ctx);
            this.renderOverlays(ctx);
        }

        renderPitch(ctx) {
            // Fondo Parquet de Futsal con tablones estilizados 64-bit
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(0, 0, COURT.width, COURT.height);

            // Suelo azul de cancha premium
            const grad = ctx.createLinearGradient(0, 0, COURT.width, COURT.height);
            grad.addColorStop(0, '#172554');
            grad.addColorStop(1, '#1e3a8a');
            ctx.fillStyle = grad;
            ctx.fillRect(COURT.minX, COURT.minY, COURT.maxX - COURT.minX, COURT.maxY - COURT.minY);

            // Líneas de cancha blancas
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 3;

            // Borde exterior
            ctx.strokeRect(COURT.minX, COURT.minY, COURT.maxX - COURT.minX, COURT.maxY - COURT.minY);

            // Línea de medio campo
            ctx.beginPath();
            ctx.moveTo(COURT.width / 2, COURT.minY);
            ctx.lineTo(COURT.width / 2, COURT.maxY);
            ctx.stroke();

            // Círculo central
            ctx.beginPath();
            ctx.arc(COURT.width / 2, COURT.height / 2, 85, 0, Math.PI * 2);
            ctx.stroke();

            // Áreas de 6 metros
            ctx.beginPath();
            ctx.arc(COURT.minX, COURT.height / 2, 105, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(COURT.maxX, COURT.height / 2, 105, Math.PI / 2, -Math.PI / 2);
            ctx.stroke();

            // Porterías (Postes y redes)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(COURT.minX - COURT.goalDepth, COURT.goalTop, COURT.goalDepth, COURT.goalBottom - COURT.goalTop);
            ctx.fillRect(COURT.maxX, COURT.goalTop, COURT.goalDepth, COURT.goalBottom - COURT.goalTop);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(COURT.minX - COURT.goalDepth, COURT.goalTop, COURT.goalDepth, COURT.goalBottom - COURT.goalTop);
            ctx.strokeRect(COURT.maxX, COURT.goalTop, COURT.goalDepth, COURT.goalBottom - COURT.goalTop);
        }

        renderEntities(ctx) {
            // Balón sombra y estela 64-bit
            if (this.ball.trail.length > 0) {
                this.ball.trail.forEach(t => {
                    ctx.fillStyle = `rgba(250, 204, 21, ${t.alpha * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            // NOTA: El árbitro ha sido ELIMINADO de la pista por completo a petición del usuario.
            // (Ya no se dibuja ni interrumpe la jugabilidad en el campo).

            // Dibujar Jugadores ordenados por Y para profundidad y perspectiva 64-bit
            const allEntities = [...this.team1, ...this.team2].sort((a, b) => a.y - b.y);
            allEntities.forEach(p => {
                if (p.isExpelled) return;
                const isHome = p.team === 1;
                const kitColor = isHome ? '#2563eb' : '#dc2626';
                const trimColor = isHome ? '#ffffff' : '#facc15';
                this.renderPlayerSprite(ctx, p, kitColor, trimColor, p.card.name, p.isPlayerControlled);
            });

            // Dibujar Balón 64-bit con sombra volumétrica y rotación de costuras
            const b = this.ball;
            const shadowScale = Math.max(0.3, 1 - (b.z / 60));
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(b.x, b.y, b.radius * shadowScale, (b.radius * 0.55) * shadowScale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Balón flotante en Z con rotación
            const ballY = b.y - b.z;
            ctx.save();
            ctx.translate(b.x, ballY);
            ctx.rotate(b.rotationAngle);

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.6;
            ctx.stroke();

            // Costuras / Pentágonos 64-bit dinámicos
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-2, -2, 4, 4);
            ctx.fillRect(-5, 0, 2, 2);
            ctx.fillRect(3, 1, 2, 2);
            ctx.restore();
        }

        renderPlayerSprite(ctx, p, kitColor, trimColor, name, isControlled) {
            ctx.save();
            ctx.translate(p.x, p.y);

            const speed = Math.hypot(p.vx, p.vy);
            const isTackling = p.state === 'tackling';
            const isCelebrating = p.state === 'celebrating';

            // 1. Sombra ovalada realista
            ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
            ctx.beginPath();
            if (isTackling) {
                ctx.ellipse(0, 4, 18, 7, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(0, 4, 12, 6, 0, 0, Math.PI * 2);
            }
            ctx.fill();

            // 2. Partículas de polvo de barrida
            if (isTackling) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                for (let i = 0; i < 3; i++) {
                    const px = -Math.cos(p.facingAngle) * (14 + i * 8) + (Math.random() - 0.5) * 6;
                    const py = -Math.sin(p.facingAngle) * (14 + i * 8) + (Math.random() - 0.5) * 6;
                    ctx.beginPath();
                    ctx.arc(px, py, 3 - i * 0.7, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 3. Indicador de control P1 / P2
            if (isControlled) {
                const bounceY = Math.sin(Date.now() * 0.008) * 3;
                ctx.fillStyle = p.team === 1 ? '#38bdf8' : '#f87171';
                ctx.beginPath();
                ctx.moveTo(0, -36 + bounceY);
                ctx.lineTo(-7, -46 + bounceY);
                ctx.lineTo(7, -46 + bounceY);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 4. Inclinación dinámica de carrera o barrida 64-bit
            if (isTackling) {
                ctx.rotate(p.facingAngle + (p.team === 1 ? 0.3 : -0.3));
            } else if (speed > 1) {
                ctx.rotate((p.vx / 10) * 0.25);
            }

            // 5. Piernas animadas con ciclo de carrera
            const legSwing = (speed > 0.4 && !isTackling) ? Math.sin(p.animFrame * Math.PI / 3) * 6 : 0;
            const bootColor = trimColor || '#ffffff';

            if (!isTackling) {
                // Pierna Izquierda + bota
                ctx.fillStyle = kitColor;
                ctx.fillRect(-6, -8, 4, 8 + legSwing);
                ctx.fillStyle = bootColor;
                ctx.fillRect(-7, -1 + legSwing, 6, 4);

                // Pierna Derecha + bota
                ctx.fillStyle = kitColor;
                ctx.fillRect(2, -8, 4, 8 - legSwing);
                ctx.fillStyle = bootColor;
                ctx.fillRect(1, -1 - legSwing, 6, 4);

                // Shorts
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-7, -11, 14, 5);
            } else {
                // Pose de barrida lateral
                ctx.fillStyle = kitColor;
                ctx.fillRect(-8, -6, 16, 5);
                ctx.fillStyle = bootColor;
                ctx.fillRect(8, -7, 6, 6);
            }

            // 6. Torso / Camiseta 64-bit con franja
            const celebrationBob = isCelebrating ? Math.abs(Math.sin(p.breathTimer * 6)) * 4 : 0;
            const torsoY = isTackling ? -8 : -22 - celebrationBob;

            ctx.fillStyle = kitColor;
            ctx.fillRect(-8, torsoY, 16, 13);

            ctx.fillStyle = trimColor;
            ctx.fillRect(-8, torsoY + 4, 16, 3);

            // Brazos
            if (isCelebrating) {
                ctx.fillStyle = p.card?.skinColor || '#f0c294';
                ctx.fillRect(-11, torsoY - 6, 3, 10);
                ctx.fillRect(8, torsoY - 6, 3, 10);
            } else if (isTackling) {
                ctx.fillStyle = p.card?.skinColor || '#f0c294';
                ctx.fillRect(-11, torsoY + 2, 4, 4);
            } else {
                const armSwing = Math.sin(p.animFrame * Math.PI / 3) * 4;
                ctx.fillStyle = p.card?.skinColor || '#f0c294';
                ctx.fillRect(-11, torsoY + 3 + armSwing, 3, 7);
                ctx.fillRect(8, torsoY + 3 - armSwing, 3, 7);
            }

            // 7. Cabeza y Pelo
            const headY = torsoY - 8;
            ctx.fillStyle = p.card?.skinColor || '#f0c294';
            ctx.fillRect(-6, headY, 12, 8);

            ctx.fillStyle = p.card?.hairColor || '#1a1a1a';
            ctx.fillRect(-7, headY - 3, 14, 5);

            // Ojos con dirección
            ctx.fillStyle = '#0f172a';
            const eyeDir = Math.cos(p.facingAngle) > 0 ? 1 : -1;
            ctx.fillRect(eyeDir * 2, headY + 3, 2, 2);

            // 8. Nombre de jugador
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(name.split(' ')[0], 0, torsoY - 14);

            ctx.restore();
        }

        renderOverlays(ctx) {
            // Notificación de Gol en pantalla
            if (this.celebrationTimer > 0) {
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(0, COURT.height / 2 - 40, COURT.width, 80);

                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 24px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(this.goalText, COURT.width / 2, COURT.height / 2 + 10);
                ctx.restore();
            }

            // Notificación del Árbitro
            if (referee.currentNotification) {
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                ctx.fillRect(COURT.width / 2 - 200, 20, 400, 36);

                ctx.strokeStyle = referee.currentNotification.type === 'red' ? '#ef4444' : (referee.currentNotification.type === 'yellow' ? '#facc15' : '#38bdf8');
                ctx.lineWidth = 2;
                ctx.strokeRect(COURT.width / 2 - 200, 20, 400, 36);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(referee.currentNotification.text, COURT.width / 2, 43);
                ctx.restore();
            }
        }
    }

    // =====================================================================================
    // 9. CONTROLADOR PRINCIPAL DE LA APLICACIÓN Y MENÚS
    // =====================================================================================
    class App {
        constructor() {
            this.canvas = document.getElementById('futsal-canvas');
            this.authManager = authManager;
            this.clubManager = clubManager;
            this.input = input;
            this.matchEngine = null;
            this.selectedSquadSlot = null;

            this.init();
        }

        init() {
            this.setupNavigation();
            this.setupHeader();
            this.setupPacksStore();
            this.setupSquadView();
            this.setupModals();
            this.setupControlsTab();
            this.setupAdminPanel();
            this.initMatchEngine();
            this.updateCoinsDisplay();
            this.updateUserSessionUI();

            window.addEventListener('resize', () => this.resizeCanvas());
            this.resizeCanvas();

            if (window.location.hash) {
                const targetTab = window.location.hash.replace('#', '');
                const tabBtn = document.querySelector(`.nav-tab[data-tab="${targetTab}"]`);
                if (tabBtn) tabBtn.click();
            }
            if (window.location.search.includes('launch=')) {
                const params = new URLSearchParams(window.location.search);
                const mode = params.get('launch') || 'vs_cpu';
                const dur = parseInt(params.get('duration') || '3', 10);
                setTimeout(() => this.launchMatch(mode, 'normal', dur), 150);
            }
        }

        setupNavigation() {
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    sound.playTone(400, 'sine', 0.05, 0.15);
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    const targetId = tab.dataset.tab;
                    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                    const pane = document.getElementById(targetId);
                    if (pane) pane.classList.add('active');

                    if (targetId === 'tab-squad') this.renderSquadView();
                    if (targetId === 'tab-admin') this.populateAdminFields();
                    if (targetId === 'tab-controls') this.renderControlsTab();
                });
            });
        }

        setupHeader() {
            const btnCrt = document.getElementById('btn-toggle-crt');
            if (btnCrt) {
                btnCrt.addEventListener('click', () => {
                    document.body.classList.toggle('crt-enabled');
                });
            }

            const btnSound = document.getElementById('btn-toggle-sound');
            if (btnSound) {
                btnSound.addEventListener('click', () => {
                    const isEnabled = sound.toggleSound();
                    btnSound.textContent = isEnabled ? '🔊' : '🔇';
                });
            }

            // Botón Pantalla Completa en HUD de partido
            const btnFs = document.getElementById('btn-toggle-fullscreen');
            if (btnFs) {
                btnFs.addEventListener('click', () => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => {});
                    } else {
                        document.exitFullscreen().catch(() => {});
                    }
                });
            }

            document.addEventListener('fullscreenchange', () => {
                setTimeout(() => this.resizeCanvas(), 60);
            });

            // Botón Login / Cambio de Usuario en cabecera
            const btnLogin = document.getElementById('btn-open-login');
            if (btnLogin) {
                btnLogin.addEventListener('click', () => {
                    document.getElementById('login-modal')?.classList.remove('hidden');
                    document.getElementById('login-username')?.focus();
                });
            }

            // Botón Jugar VS CPU con duración real (1, 3, 5, 10 min)
            const btnCpu = document.getElementById('btn-start-cpu-match');
            if (btnCpu) {
                btnCpu.addEventListener('click', () => {
                    const diff = document.getElementById('select-cpu-difficulty')?.value || 'normal';
                    const dur = document.getElementById('select-cpu-duration')?.value || '3';
                    this.launchMatch('vs_cpu', diff, parseFloat(dur));
                });
            }

            // Botón Jugar Local 1v1 con duración real
            const btnLocal = document.getElementById('btn-start-local-match');
            if (btnLocal) {
                btnLocal.addEventListener('click', () => {
                    const dur = document.getElementById('select-local-duration')?.value || '3';
                    this.launchMatch('local_2p', 'normal', parseFloat(dur));
                });
            }

            // Botón Tutorial
            const btnTutorial = document.getElementById('btn-start-tutorial');
            if (btnTutorial) {
                btnTutorial.addEventListener('click', () => {
                    this.launchMatch('vs_cpu', 'easy', 3);
                });
            }
        }

        updateUserSessionUI() {
            const badge = document.getElementById('user-profile-badge');
            const nameEl = document.getElementById('user-name-display');
            const iconEl = document.getElementById('user-role-icon');
            const adminTab = document.getElementById('nav-tab-admin');

            const user = authManager.currentUser;
            const isAdmin = authManager.isAdmin();

            if (nameEl) nameEl.textContent = user.name || 'Invitado';
            if (iconEl) iconEl.textContent = isAdmin ? '👑' : '👤';

            if (badge) {
                badge.classList.toggle('is-admin', isAdmin);
                badge.title = isAdmin ? 'Superadmin Oficial (+-+-ALEX)' : `Usuario: ${user.name}`;
            }

            // Mostrar u ocultar pestaña de Administración (exclusivo para Admin)
            if (adminTab) {
                adminTab.classList.toggle('hidden', !isAdmin);
            }

            // Verificar si el usuario actual está baneado
            if (authManager.isCurrentBanned()) {
                document.getElementById('banned-modal')?.classList.remove('hidden');
            } else {
                document.getElementById('banned-modal')?.classList.add('hidden');
            }
        }

        setupModals() {
            // Modal de apertura de sobres
            const btnClosePack = document.getElementById('btn-close-pack-modal');
            if (btnClosePack) {
                btnClosePack.addEventListener('click', () => {
                    document.getElementById('pack-opening-modal')?.classList.add('hidden');
                    this.renderSquadView();
                });
            }

            // Modal de descanso
            const btnContinueHalf = document.getElementById('btn-continue-second-half');
            if (btnContinueHalf) {
                btnContinueHalf.addEventListener('click', () => {
                    document.getElementById('halftime-modal')?.classList.add('hidden');
                    this.matchEngine.resumeSecondHalf();
                });
            }

            // Modal de fin de partido
            const btnBackMenu = document.getElementById('btn-back-to-menu');
            if (btnBackMenu) {
                btnBackMenu.addEventListener('click', () => {
                    this.returnToMenu();
                });
            }

            // Modal de PAUSA durante el partido
            const btnPauseHud = document.getElementById('btn-pause-match');
            if (btnPauseHud) {
                btnPauseHud.addEventListener('click', () => {
                    this.matchEngine.togglePause();
                });
            }

            const btnResume = document.getElementById('btn-resume-match');
            if (btnResume) {
                btnResume.addEventListener('click', () => {
                    this.matchEngine.togglePause(false);
                });
            }

            const btnRestart = document.getElementById('btn-restart-match');
            if (btnRestart) {
                btnRestart.addEventListener('click', () => {
                    this.matchEngine.restartMatch();
                });
            }

            const btnExitMenu = document.getElementById('btn-exit-to-menu');
            if (btnExitMenu) {
                btnExitMenu.addEventListener('click', () => {
                    document.getElementById('pause-modal')?.classList.add('hidden');
                    this.returnToMenu();
                });
            }

            // Modal de INICIO DE SESIÓN / ROLES
            const formLogin = document.getElementById('form-login');
            if (formLogin) {
                formLogin.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const inputEl = document.getElementById('login-username');
                    const val = inputEl ? inputEl.value.trim() : '';

                    if (val) {
                        authManager.login(val);
                        this.updateUserSessionUI();
                        document.getElementById('login-modal')?.classList.add('hidden');
                        sound.playTone(600, 'triangle', 0.15, 0.25);

                        if (authManager.isAdmin()) {
                            alert('👑 ¡ACCESO CONCEDIDO! Bienvenido Administrador ALEX. El panel de administración ha sido desbloqueado.');
                            this.populateAdminFields();
                        } else {
                            alert(`⚽ ¡Bienvenido ${val}! Tu perfil ha sido sincronizado.`);
                        }
                    }
                });
            }

            const btnCancelLogin = document.getElementById('btn-cancel-login');
            if (btnCancelLogin) {
                btnCancelLogin.addEventListener('click', () => {
                    document.getElementById('login-modal')?.classList.add('hidden');
                });
            }

            // Modal de USUARIO BANEADO
            const btnBannedLogout = document.getElementById('btn-banned-logout');
            if (btnBannedLogout) {
                btnBannedLogout.addEventListener('click', () => {
                    authManager.logout();
                    document.getElementById('banned-modal')?.classList.add('hidden');
                    document.getElementById('login-modal')?.classList.remove('hidden');
                    this.updateUserSessionUI();
                });
            }
        }

        setupPacksStore() {
            this.updatePackButtonsDisplay();

            const buyBtns = document.querySelectorAll('.btn-buy-pack');
            buyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const packType = btn.dataset.packType || 'standard';
                    const res = clubManager.buyPack(packType);

                    if (res.success) {
                        this.updateCoinsDisplay();
                        this.showPackRevealModal(res.cards);
                    } else {
                        alert(res.reason);
                    }
                });
            });
        }

        updatePackButtonsDisplay() {
            const prices = clubManager.packPrices;
            const standardBtn = document.querySelector('.btn-buy-pack[data-pack-type="standard"]');
            const premiumBtn = document.querySelector('.btn-buy-pack[data-pack-type="premium"]');
            const legendBtn = document.querySelector('.btn-buy-pack[data-pack-type="legend"]');

            if (standardBtn) {
                standardBtn.textContent = `ABRIR (${prices.standard} 🪙)`;
                const priceBadge = standardBtn.parentElement?.querySelector('.pack-price');
                if (priceBadge) priceBadge.textContent = `${prices.standard} 🪙`;
            }
            if (premiumBtn) {
                premiumBtn.textContent = `ABRIR (${prices.premium} 🪙)`;
                const priceBadge = premiumBtn.parentElement?.querySelector('.pack-price');
                if (priceBadge) priceBadge.textContent = `${prices.premium} 🪙`;
            }
            if (legendBtn) {
                legendBtn.textContent = `ABRIR (${prices.legend} 🪙)`;
                const priceBadge = legendBtn.parentElement?.querySelector('.pack-price');
                if (priceBadge) priceBadge.textContent = `${prices.legend} 🪙`;
            }
        }

        showPackRevealModal(cards) {
            const modal = document.getElementById('pack-opening-modal');
            const grid = document.getElementById('pack-cards-reveal');
            if (!modal || !grid) return;

            grid.innerHTML = '';
            cards.forEach(card => {
                const cardEl = this.createCardElement(card);
                grid.appendChild(cardEl);
            });

            const best = cards.reduce((prev, curr) => (curr.ovr > prev.ovr ? curr : prev), cards[0]);
            sound.playPackReveal(best.rarity);
            modal.classList.remove('hidden');
        }

        setupControlsTab() {
            // Configurar botones interactivos para reasignar teclas
            const bindButtons = document.querySelectorAll('.btn-keybind');
            bindButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const player = btn.dataset.player;
                    const action = btn.dataset.action;
                    input.startListening(player, action, btn);
                });
            });

            // Botón de restablecer controles oficiales
            const btnReset = document.getElementById('btn-reset-controls');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    input.resetBindings();
                    input.resetGamepadConfig();
                    this.renderControlsTab();
                    const toast = document.getElementById('controls-save-toast');
                    if (toast) {
                        toast.textContent = '🔄 Controles y mandos restablecidos a los valores oficiales';
                        toast.classList.remove('hidden');
                        setTimeout(() => toast.classList.add('hidden'), 2500);
                    }
                    sound.playTone(400, 'sine', 0.1, 0.2);
                });
            }

            // Asignación de modo de entrada por jugador (teclado, mando, ambos)
            ['p1', 'p2'].forEach(player => {
                const modeSelect = document.getElementById(`gp-input-mode-${player}`);
                if (modeSelect) {
                    modeSelect.addEventListener('change', () => {
                        input.setPlayerInputMode(player, modeSelect.value);
                        this.showControlsSaveToast(`Modo de entrada de ${player.toUpperCase()} cambiado a: ${modeSelect.options[modeSelect.selectedIndex].text}`);
                    });
                }

                const gpIndexSelect = document.getElementById(`gp-index-${player}`);
                if (gpIndexSelect) {
                    gpIndexSelect.addEventListener('change', () => {
                        input.setPlayerGamepadIndex(player, gpIndexSelect.value);
                        this.showControlsSaveToast(`${player.toUpperCase()} asignado al mando #${gpIndexSelect.value}`);
                    });
                }
            });

            this.renderControlsTab();

            // Actualización periódica en vivo del probador de mandos Bluetooth / USB
            setInterval(() => {
                input.updateGamepadStatus();
                input.pollGamepadTester();
                this.updateGamepadDropdowns();
            }, 100);
        }

        showControlsSaveToast(message) {
            const toast = document.getElementById('controls-save-toast');
            if (toast) {
                toast.textContent = `✅ ${message}`;
                toast.classList.remove('hidden');
                setTimeout(() => toast.classList.add('hidden'), 2500);
            }
            sound.playTone(550, 'sine', 0.08, 0.2);
        }

        updateGamepadDropdowns() {
            const gamepads = input.getConnectedGamepads();
            ['p1', 'p2'].forEach(player => {
                const select = document.getElementById(`gp-index-${player}`);
                if (!select) return;

                const currentVal = select.value;
                const optionsHtml = gamepads.length === 0
                    ? '<option value="0">Sin mandos conectados</option>'
                    : gamepads.map(gp => {
                        const name = gp.id.length > 30 ? gp.id.substring(0, 28) + '...' : gp.id;
                        return `<option value="${gp.index}">#${gp.index} - ${name}</option>`;
                    }).join('');

                // Solo actualizar si el HTML cambió para evitar flickering
                if (select.dataset.lastHtml !== optionsHtml) {
                    select.dataset.lastHtml = optionsHtml;
                    select.innerHTML = optionsHtml;
                    // Restaurar selección
                    const cfg = input.gamepadConfig[player];
                    if (cfg) {
                        select.value = cfg.gamepadIndex;
                    }
                }
            });

            // Actualizar el contador de mandos conectados
            const counter = document.getElementById('gp-connected-count');
            if (counter) {
                counter.textContent = `${gamepads.length} mando(s) detectado(s)`;
            }
        }

        renderControlsTab() {
            const players = ['p1', 'p2'];
            players.forEach(p => {
                const pBindings = input.bindings[p];
                if (!pBindings) return;
                Object.keys(pBindings).forEach(action => {
                    const btn = document.getElementById(`bind-${p}-${action}`);
                    if (btn) {
                        btn.textContent = pBindings[action].label || pBindings[action].code;
                        btn.classList.remove('listening');
                    }
                });

                // Sincronizar dropdowns de modo de entrada
                const modeSelect = document.getElementById(`gp-input-mode-${p}`);
                if (modeSelect && input.gamepadConfig[p]) {
                    modeSelect.value = input.gamepadConfig[p].inputMode;
                }
            });

            this.updateGamepadDropdowns();
        }

        setupAdminPanel() {
            // Formulario 1: Agregar nuevo jugador
            const formAdd = document.getElementById('form-admin-add-player');
            if (formAdd) {
                formAdd.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!authManager.isAdmin()) {
                        alert('Acceso denegado: solo el administrador (+-+-ALEX) puede usar esta función.');
                        return;
                    }

                    const name = document.getElementById('admin-add-name')?.value.trim();
                    const position = document.getElementById('admin-add-pos')?.value;
                    const nation = document.getElementById('admin-add-nation')?.value;
                    const ovr = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-ovr')?.value || '115', 10)));
                    const rarity = document.getElementById('admin-add-rarity')?.value || 'icon';

                    const vel = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-vel')?.value || '118', 10)));
                    const tir = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-tir')?.value || '116', 10)));
                    const pas = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-pas')?.value || '112', 10)));
                    const reg = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-reg')?.value || '120', 10)));
                    const def = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-def')?.value || '78', 10)));
                    const fis = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-add-fis')?.value || '98', 10)));

                    const special = document.getElementById('admin-add-special')?.value.trim() || 'Disparo 64-Bit';

                    const newCard = {
                        id: `admin_custom_${Date.now()}`,
                        name,
                        position,
                        nation,
                        ovr,
                        rarity,
                        stats: { vel, tir, pas, reg, def, fis },
                        skinColor: '#f0c294',
                        hairColor: '#1a1a1a',
                        specialMove: special
                    };

                    if (!PLAYERS_CFG.CUSTOM_PLAYERS) PLAYERS_CFG.CUSTOM_PLAYERS = [];
                    PLAYERS_CFG.CUSTOM_PLAYERS.push(newCard);
                    clubManager.inventory.push(newCard);
                    clubManager.save();

                    sound.playTone(880, 'triangle', 0.2, 0.3);
                    alert(`✅ ¡Jugador "${name}" creado exitosamente con media OVR ${ovr}! Se ha agregado a tu inventario.`);

                    formAdd.reset();
                    this.populateAdminFields();
                    this.renderSquadView();
                });
            }

            // Formulario 2: Modificar jugador existente
            const selectEdit = document.getElementById('admin-select-player-edit');
            if (selectEdit) {
                selectEdit.addEventListener('change', () => {
                    const cardId = selectEdit.value;
                    const card = clubManager.inventory.find(c => c.id === cardId);
                    if (card) {
                        const nameInp = document.getElementById('admin-edit-name');
                        const ovrInp = document.getElementById('admin-edit-ovr');
                        const rarityInp = document.getElementById('admin-edit-rarity');
                        const velInp = document.getElementById('admin-edit-vel');
                        const tirInp = document.getElementById('admin-edit-tir');
                        const pasInp = document.getElementById('admin-edit-pas');
                        const regInp = document.getElementById('admin-edit-reg');
                        const defInp = document.getElementById('admin-edit-def');
                        const fisInp = document.getElementById('admin-edit-fis');

                        if (nameInp) nameInp.value = card.name;
                        if (ovrInp) ovrInp.value = card.ovr;
                        if (rarityInp) rarityInp.value = card.rarity || 'gold';
                        if (velInp) velInp.value = card.stats?.vel || card.ovr;
                        if (tirInp) tirInp.value = card.stats?.tir || card.ovr;
                        if (pasInp) pasInp.value = card.stats?.pas || card.ovr;
                        if (regInp) regInp.value = card.stats?.reg || card.ovr;
                        if (defInp) defInp.value = card.stats?.def || card.ovr;
                        if (fisInp) fisInp.value = card.stats?.fis || card.ovr;
                    }
                });
            }

            const formEdit = document.getElementById('form-admin-edit-player');
            if (formEdit) {
                formEdit.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!authManager.isAdmin()) {
                        alert('Acceso denegado: solo el administrador (+-+-ALEX) puede usar esta función.');
                        return;
                    }

                    const cardId = selectEdit?.value;
                    const card = clubManager.inventory.find(c => c.id === cardId);
                    if (card) {
                        const newName = document.getElementById('admin-edit-name')?.value.trim();
                        const newOvr = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-ovr')?.value || '90', 10)));
                        const newRarity = document.getElementById('admin-edit-rarity')?.value || card.rarity;

                        if (newName) card.name = newName;
                        card.ovr = newOvr;
                        card.rarity = newRarity;

                        if (!card.stats) card.stats = {};
                        card.stats.vel = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-vel')?.value || '90', 10)));
                        card.stats.tir = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-tir')?.value || '90', 10)));
                        card.stats.pas = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-pas')?.value || '90', 10)));
                        card.stats.reg = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-reg')?.value || '90', 10)));
                        card.stats.def = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-def')?.value || '90', 10)));
                        card.stats.fis = Math.min(120, Math.max(60, parseInt(document.getElementById('admin-edit-fis')?.value || '90', 10)));

                        // Si está en el 5 titular, actualizarlo también
                        const squadIdx = clubManager.squad.findIndex(c => c.id === cardId);
                        if (squadIdx !== -1) {
                            clubManager.squad[squadIdx] = { ...card };
                        }

                        clubManager.save();
                        sound.playTone(800, 'triangle', 0.2, 0.3);
                        alert(`✅ ¡Jugador "${card.name}" actualizado correctamente!`);
                        this.renderSquadView();
                    }
                });
            }

            // Panel 3: Gestión de precios de tienda
            const btnSavePrices = document.getElementById('btn-admin-save-prices');
            if (btnSavePrices) {
                btnSavePrices.addEventListener('click', () => {
                    if (!authManager.isAdmin()) return;
                    const pStd = parseInt(document.getElementById('admin-price-standard')?.value || '100', 10);
                    const pPrem = parseInt(document.getElementById('admin-price-premium')?.value || '250', 10);
                    const pLeg = parseInt(document.getElementById('admin-price-legend')?.value || '500', 10);

                    clubManager.setPackPrices(pStd, pPrem, pLeg);
                    this.updatePackButtonsDisplay();
                    sound.playTone(700, 'sine', 0.1, 0.2);
                    alert(`🪙 ¡Precios de la tienda actualizados! Estándar: ${pStd}🪙, Oro: ${pPrem}🪙, Leyendas: ${pLeg}🪙`);
                });
            }

            const btnGrantCoins = document.getElementById('btn-admin-grant-coins');
            if (btnGrantCoins) {
                btnGrantCoins.addEventListener('click', () => {
                    if (!authManager.isAdmin()) return;
                    clubManager.addCoins(2000);
                    this.updateCoinsDisplay();
                    sound.playTone(1046, 'sawtooth', 0.25, 0.35);
                    alert('🎁 ¡Has recibido +2,000 🪙 Monedas en tu cuenta de Administrador!');
                });
            }
        }

        populateAdminFields() {
            if (!authManager.isAdmin()) return;

            // Rellenar precios
            const prices = clubManager.packPrices;
            const pStdInp = document.getElementById('admin-price-standard');
            const pPremInp = document.getElementById('admin-price-premium');
            const pLegInp = document.getElementById('admin-price-legend');
            if (pStdInp) pStdInp.value = prices.standard;
            if (pPremInp) pPremInp.value = prices.premium;
            if (pLegInp) pLegInp.value = prices.legend;

            // Rellenar selector de modificación de jugador
            const selectEdit = document.getElementById('admin-select-player-edit');
            if (selectEdit) {
                selectEdit.innerHTML = '';
                clubManager.inventory.forEach(card => {
                    const opt = document.createElement('option');
                    opt.value = card.id;
                    opt.textContent = `${card.name} (${card.position} - ${card.ovr} OVR)`;
                    selectEdit.appendChild(opt);
                });
                selectEdit.dispatchEvent(new Event('change'));
            }

            // Rellenar tabla de monitoreo de usuarios
            this.renderAdminUsersTable();
        }

        renderAdminUsersTable() {
            const tbody = document.getElementById('admin-users-table-body');
            if (!tbody) return;

            tbody.innerHTML = '';
            authManager.users.forEach(u => {
                const tr = document.createElement('tr');
                const isBanned = !!u.banned;
                const statusBadge = isBanned 
                    ? `<span class="status-badge banned">🚫 BANEADO</span>` 
                    : (u.status === 'playing' ? `<span class="status-badge playing">🔵 JUGANDO</span>` : `<span class="status-badge online">🟢 EN LÍNEA</span>`);

                const btnAction = isBanned
                    ? `<button class="btn-table-action btn-unban" data-id="${u.id}">✅ Desbanear</button>`
                    : `<button class="btn-table-action btn-ban" data-id="${u.id}">🚫 Banear</button>`;

                tr.innerHTML = `
                    <td><strong>${u.name}</strong></td>
                    <td><code>${u.ip}</code></td>
                    <td>${u.ping} ms</td>
                    <td>${u.matches || 1}</td>
                    <td>${statusBadge}</td>
                    <td>${btnAction}</td>
                `;

                const actionBtn = tr.querySelector('.btn-table-action');
                if (actionBtn) {
                    actionBtn.addEventListener('click', () => {
                        const newBanStatus = authManager.toggleBan(u.id);
                        this.renderAdminUsersTable();
                        this.renderOnlineLobby();
                        this.updateUserSessionUI();
                        alert(`El usuario ${u.name} ha sido ${newBanStatus ? 'BANEADO' : 'DESBANEADO'}.`);
                    });
                }

                tbody.appendChild(tr);
            });
        }

        setupSquadView() {
            this.renderSquadView();
        }

        renderSquadView() {
            const squadGrid = document.getElementById('active-squad-grid');
            const inventoryGrid = document.getElementById('inventory-cards-grid');
            const ratingEl = document.getElementById('team-rating-display');

            if (ratingEl) ratingEl.textContent = clubManager.getTeamRating();

            if (squadGrid) {
                squadGrid.innerHTML = '';
                clubManager.squad.forEach((card, idx) => {
                    const slotBox = document.createElement('div');
                    slotBox.className = 'squad-slot-box';
                    slotBox.innerHTML = `<div class="slot-title">HUECO ${idx + 1} (${card.position})</div>`;
                    const cardEl = this.createCardElement(card);
                    slotBox.appendChild(cardEl);
                    squadGrid.appendChild(slotBox);
                });
            }

            if (inventoryGrid) {
                inventoryGrid.innerHTML = '';
                clubManager.inventory.forEach(card => {
                    const cardEl = this.createCardElement(card);
                    cardEl.title = 'Haz clic para asignar a tu 5 titular';
                    cardEl.addEventListener('click', () => {
                        const slot = prompt(`¿En qué hueco (1 al 5) deseas colocar a ${card.name}?`, '1');
                        const slotIdx = parseInt(slot, 10) - 1;
                        if (!isNaN(slotIdx) && slotIdx >= 0 && slotIdx < 5) {
                            clubManager.setSquadSlot(slotIdx, card.id);
                            sound.playTone(520, 'triangle', 0.1, 0.2);
                            this.renderSquadView();
                        }
                    });
                    inventoryGrid.appendChild(cardEl);
                });
            }
        }

        createCardElement(card) {
            const div = document.createElement('div');
            div.className = `futsal-card card-${card.rarity || 'bronze'}`;
            div.dataset.cardId = card.id;

            const nationObj = NATIONS.find(n => n.code === card.nation) || { flag: '⚽' };

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
                <div class="card-name" title="${card.name}">${nationObj.flag} ${card.name}</div>
                <div class="card-stats-grid">
                    <div><span>VEL:</span> ${card.stats?.vel || card.ovr}</div>
                    <div><span>TIR:</span> ${card.stats?.tir || card.ovr}</div>
                    <div><span>PAS:</span> ${card.stats?.pas || card.ovr}</div>
                    <div><span>REG:</span> ${card.stats?.reg || card.ovr}</div>
                    <div><span>DEF:</span> ${card.stats?.def || card.ovr}</div>
                    <div><span>FIS:</span> ${card.stats?.fis || card.ovr}</div>
                </div>
                <div class="card-special-move">${card.specialMove || 'Jugada 64-Bit'}</div>
            `;
            return div;
        }

        initMatchEngine() {
            this.matchEngine = new MatchEngine(this.canvas, (summary) => {
                this.handleMatchFinished(summary);
            });

            const loop = () => {
                if (this.matchEngine && this.matchEngine.isRunning) {
                    this.matchEngine.update();
                    this.matchEngine.render();
                    this.updateScoreboardHUD();
                }
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }

        launchMatch(mode = 'vs_cpu', difficulty = 'normal', durationMinutes = null) {
            if (authManager.isCurrentBanned()) {
                document.getElementById('banned-modal')?.classList.remove('hidden');
                return;
            }

            // Activar modo auto-fit de pantalla para el partido
            document.body.classList.add('in-match');
            document.getElementById('app-container')?.classList.add('in-match');

            document.getElementById('main-nav')?.classList.add('hidden');
            document.getElementById('tab-content-area')?.classList.add('hidden');
            document.getElementById('match-stage')?.classList.remove('hidden');

            const touchOverlay = document.getElementById('touch-controls-overlay');
            if (touchOverlay) {
                touchOverlay.style.display = input.isMobile ? 'flex' : 'none';
            }

            // Asignar el nombre del usuario en el marcador HUD
            const hudTeam1 = document.getElementById('hud-team1-name');
            const hudTeam2 = document.getElementById('hud-team2-name');

            if (hudTeam1) hudTeam1.textContent = (authManager.currentUser.name || 'MI CLUB').toUpperCase();

            if (hudTeam2) {
                if (mode === 'local_2p') {
                    hudTeam2.textContent = 'JUGADOR 2';
                } else {
                    hudTeam2.textContent = 'IA RIVAL';
                }
            }

            // Duración del partido en minutos de la vida real (1, 3, 5, 10 min)
            let realMinutes = durationMinutes;
            if (!realMinutes || isNaN(realMinutes)) {
                const durSelect = mode === 'local_2p'
                    ? document.getElementById('select-local-duration')
                    : document.getElementById('select-cpu-duration');
                realMinutes = durSelect ? parseFloat(durSelect.value) : 3;
            }

            this.matchEngine.startMatch(mode, difficulty, realMinutes);
            this.resizeCanvas();
            setTimeout(() => this.resizeCanvas(), 50);
        }

        returnToMenu() {
            // Desactivar modo in-match
            document.body.classList.remove('in-match');
            document.getElementById('app-container')?.classList.remove('in-match');

            document.getElementById('fulltime-modal')?.classList.add('hidden');
            document.getElementById('halftime-modal')?.classList.add('hidden');
            document.getElementById('pause-modal')?.classList.add('hidden');
            document.getElementById('match-stage')?.classList.add('hidden');
            document.getElementById('main-nav')?.classList.remove('hidden');
            document.getElementById('tab-content-area')?.classList.remove('hidden');

            this.matchEngine.isRunning = false;
            this.matchEngine.isPaused = false;
            this.updateCoinsDisplay();
            this.renderSquadView();
            this.resizeCanvas();
        }

        updateScoreboardHUD() {
            if (!this.matchEngine) return;

            const s1 = document.getElementById('hud-score-1');
            const s2 = document.getElementById('hud-score-2');
            const timer = document.getElementById('hud-match-timer');
            const fouls1 = document.getElementById('hud-fouls-1');
            const fouls2 = document.getElementById('hud-fouls-2');

            if (s1) s1.textContent = this.matchEngine.score.team1;
            if (s2) s2.textContent = this.matchEngine.score.team2;

            if (timer) {
                const totalSec = Math.floor(this.matchEngine.matchTime);
                const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
                const s = (totalSec % 60).toString().padStart(2, '0');
                timer.textContent = `${m}:${s}`;
            }

            if (fouls1) fouls1.textContent = `Faltas: ${referee.accumulatedFouls.team1}/5`;
            if (fouls2) fouls2.textContent = `Faltas: ${referee.accumulatedFouls.team2}/5`;

            if (this.matchEngine.half === 3 && document.getElementById('halftime-modal')?.classList.contains('hidden')) {
                this.showHalftimeModal();
            }
        }

        showHalftimeModal() {
            const modal = document.getElementById('halftime-modal');
            if (!modal) return;

            document.getElementById('ht-score-1').textContent = this.matchEngine.score.team1;
            document.getElementById('ht-score-2').textContent = this.matchEngine.score.team2;
            document.getElementById('ht-possession').textContent = `${this.matchEngine.matchStats.possession1}% - ${this.matchEngine.matchStats.possession2}%`;
            document.getElementById('ht-shots').textContent = `${this.matchEngine.matchStats.shots1} - ${this.matchEngine.matchStats.shots2}`;
            document.getElementById('ht-fouls').textContent = `${referee.accumulatedFouls.team1} - ${referee.accumulatedFouls.team2}`;

            modal.classList.remove('hidden');
        }

        handleMatchFinished(summary) {
            const modal = document.getElementById('fulltime-modal');
            if (!modal) return;

            document.getElementById('ft-score-1').textContent = summary.score.team1;
            document.getElementById('ft-score-2').textContent = summary.score.team2;
            document.getElementById('ft-reward-coins').textContent = `+${summary.coinsEarned} 🪙`;
            document.getElementById('ft-possession').textContent = `${summary.stats.possession1}% - ${summary.stats.possession2}%`;
            document.getElementById('ft-shots').textContent = `${summary.stats.shots1} - ${summary.stats.shots2}`;
            document.getElementById('ft-fouls').textContent = `${referee.accumulatedFouls.team1} - ${referee.accumulatedFouls.team2}`;

            const isWin = summary.score.team1 > summary.score.team2;
            document.getElementById('ft-title').textContent = isWin ? '🏆 ¡VICTORIA TOTAL!' : (summary.score.team1 === summary.score.team2 ? '🤝 ¡EMPATE ÉPICO!' : '💔 DERROTA');

            modal.classList.remove('hidden');
            this.updateCoinsDisplay();
        }

        updateCoinsDisplay() {
            const coinEl = document.getElementById('user-coins-display');
            if (coinEl) coinEl.textContent = clubManager.coins.toLocaleString();
        }

        resizeCanvas() {
            const wrapper = document.getElementById('canvas-wrapper');
            if (!wrapper || !this.canvas) return;

            const isMatch = document.body.classList.contains('in-match') || (!document.getElementById('match-stage')?.classList.contains('hidden'));

            const wrapW = wrapper.clientWidth || (window.innerWidth - 24);
            const wrapH = wrapper.clientHeight || (window.innerHeight - 100);

            // Relación nativa del campo futsal (1050 x 620)
            const scaleW = (wrapW - 8) / 1050;
            const scaleH = isMatch ? ((wrapH - 8) / 620) : scaleW;
            const scale = isMatch ? Math.max(0.25, Math.min(scaleW, scaleH)) : Math.min(1.0, Math.max(0.35, scaleW));

            this.canvas.style.transform = `scale(${scale})`;
            this.canvas.style.transformOrigin = 'center center';
        }
    }

    // Inicialización automática
    window.addEventListener('DOMContentLoaded', () => {
        window.retroFutsalApp = new App();
    });

})(window, document);
