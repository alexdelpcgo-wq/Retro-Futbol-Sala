/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - SINTETIZADOR DE AUDIO Y EFECTOS SONOROS CHIPTUNE
 * ============================================================================
 * Genera en tiempo real mediante la Web Audio API todos los sonidos arcade:
 * silbatos de árbitro, golpeos de balón, ambiente dinámico de público,
 * celebración de goles, barridas, choque de postes y fanfarrias de monedas.
 */

export class SoundEngine {
    /**
     * Constructor del motor de sonido.
     */
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterVolume = 0.65;
        this.crowdNode = null;
        this.crowdGain = null;
    }

    /**
     * Inicializa el contexto de audio del navegador tras la primera interacción del usuario.
     */
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.startCrowdAmbience();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Reproduce un tono sintético con oscilador de frecuencia y envolvente de volumen.
     * 
     * @param {number} freq - Frecuencia en Hz.
     * @param {string} [type='square'] - Tipo de onda: 'square', 'sine', 'sawtooth', 'triangle'.
     * @param {number} [duration=0.1] - Duración en segundos.
     * @param {number} [gainVal=0.2] - Volumen base (0 a 1).
     * @param {number} [pitchDecay=0] - Variación de frecuencia a lo largo del tiempo.
     */
    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.2, pitchDecay = 0) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (pitchDecay !== 0) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + pitchDecay), now + duration);
        }

        gain.gain.setValueAtTime(gainVal * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Genera un pulso de ruido blanco filtrado para simular impactos o fricción.
     * 
     * @param {number} [duration=0.15] - Duración.
     * @param {number} [gainVal=0.3] - Volumen.
     * @param {number} [filterFreq=800] - Frecuencia de corte del filtro pasa-bajos.
     */
    playNoise(duration = 0.15, gainVal = 0.3, filterFreq = 800) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

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
        filter.frequency.value = filterFreq;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    /**
     * Genera un murmullo atmosférico de estadio en bucle.
     */
    startCrowdAmbience() {
        if (!this.enabled || !this.ctx || this.crowdNode) return;

        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }

        this.crowdNode = this.ctx.createBufferSource();
        this.crowdNode.buffer = buffer;
        this.crowdNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 420;
        filter.Q.value = 1.0;

        this.crowdGain = this.ctx.createGain();
        this.crowdGain.gain.value = 0.04 * this.masterVolume;

        this.crowdNode.connect(filter);
        filter.connect(this.crowdGain);
        this.crowdGain.connect(this.ctx.destination);

        this.crowdNode.start();
    }

    /**
     * Reproduce el sonido de pase raso.
     */
    playPass() {
        this.playTone(480, 'triangle', 0.08, 0.25, -200);
    }

    /**
     * Reproduce el sonido de disparo a portería.
     * @param {number} [powerMult=1.0] - Multiplicador de potencia.
     */
    playKick(powerMult = 1.0) {
        this.playNoise(0.12, 0.4 * powerMult, 500);
        this.playTone(180 * powerMult, 'sine', 0.15, 0.5 * powerMult, -90);
    }

    /**
     * Reproduce el silbato reglamentario del árbitro.
     * @param {string} [type='short'] - 'short' o 'long'.
     */
    playWhistle(type = 'short') {
        const dur = type === 'short' ? 0.14 : 0.45;
        this.playTone(2800, 'square', dur, 0.35, 100);
        this.playTone(3200, 'square', dur, 0.3, -50);
    }

    /**
     * Reproduce la aclamación del estadio tras marcar un gol.
     */
    playGoalCheer() {
        this.playNoise(1.8, 0.8, 1200);
        this.playTone(523.25, 'triangle', 0.25, 0.4); // Do
        setTimeout(() => this.playTone(659.25, 'triangle', 0.25, 0.4), 100); // Mi
        setTimeout(() => this.playTone(783.99, 'triangle', 0.50, 0.5), 200); // Sol
    }

    /**
     * Reproduce el impacto metálico cuando el balón golpea el poste.
     */
    playPostHit() {
        this.playTone(1100, 'sine', 0.25, 0.6, -400);
        this.playNoise(0.08, 0.5, 2000);
    }

    /**
     * Reproduce el sonido de fricción de una barrida sobre el parqué.
     */
    playTackle() {
        this.playNoise(0.18, 0.45, 650);
    }

    /**
     * Reproduce el sonido de fanfarria al abrir un sobre o ganar monedas.
     */
    playPackOpening() {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 'square', 0.15, 0.35), idx * 80);
        });
    }

    /**
     * Alterna entre sonido activado y silenciado.
     * @returns {boolean} Nuevo estado (true = activo).
     */
    toggleSound() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.ctx) {
            this.ctx.suspend();
        } else if (this.enabled && this.ctx) {
            this.ctx.resume();
        }
        return this.enabled;
    }
}

// Instancia global del motor de audio
export const sound = new SoundEngine();
