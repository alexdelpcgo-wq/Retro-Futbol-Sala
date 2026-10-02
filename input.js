/**
 * ============================================================================
 * RETRO FUTSAL 64-BIT - GESTOR UNIVERSAL DE ENTRADAS (INPUT MANAGER)
 * ============================================================================
 * Soporta de forma simultánea e instantánea:
 * 1. Teclado PC: Jugador 1 (WASD + J/K/U/ESPACIO) y Jugador 2 (Flechas + Num1/Num2/Num4/Num5).
 * 2. Mandos / Gamepads físicos mediante la HTML5 Gamepad API (Xbox, PlayStation, Mandos USB/Bluetooth).
 * 3. Controles táctiles virtuales en pantalla para smartphones y tablets (Touchpad + Botones).
 */

export class InputManager {
    /**
     * Constructor del gestor de entradas.
     */
    constructor() {
        this.keys = {};
        this.touchState = {
            active: false,
            joystick: { x: 0, y: 0, active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, id: null },
            buttons: { pass: false, shoot: false, sprint: false, tackle: false, switch: false }
        };
        this.gamepads = {};
        this.isMobile = this.detectMobile();
        this.touchOverlayVisible = this.isMobile;

        this.initKeyboard();
        this.initGamepad();
        this.initTouch();
    }

    /**
     * Detecta si el dispositivo del usuario es un celular o tablet con pantalla táctil.
     * @returns {boolean} True si es dispositivo táctil.
     */
    detectMobile() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        return (/android|avantgo|blackberry|iemobile|ipad|iphone|ipod|opera mini|palmsource|webos|windows phone/i.test(ua) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1));
    }

    /**
     * Inicializa los escuchadores de eventos de teclado en la ventana global.
     */
    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            // Evitar scroll de pantalla al pulsar flechas o barra espaciadora
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                if (document.activeElement === document.body || document.activeElement.tagName === 'CANVAS') {
                    e.preventDefault();
                }
            }
            this.keys[e.code] = true;
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Inicializa la detección y conexión de mandos físicos (Gamepad API).
     */
    initGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 [Gamepad] Conectado:', e.gamepad.id, 'en puerto', e.gamepad.index);
            this.gamepads[e.gamepad.index] = e.gamepad;
            const indicator = document.getElementById('gamepad-status');
            if (indicator) {
                indicator.textContent = `🎮 Mando: ${e.gamepad.id.substring(0, 18)}...`;
                indicator.classList.add('active');
            }
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 [Gamepad] Desconectado del puerto', e.gamepad.index);
            delete this.gamepads[e.gamepad.index];
            const indicator = document.getElementById('gamepad-status');
            if (indicator) {
                indicator.textContent = '⌨️ Teclado / 📱 Táctil';
                indicator.classList.remove('active');
            }
        });
    }

    /**
     * Inicializa los controles táctiles en pantalla (Joystick virtual + botones).
     */
    initTouch() {
        const joyBase = document.getElementById('touch-joystick-base');
        const joyThumb = document.getElementById('touch-joystick-thumb');

        if (!joyBase || !joyThumb) return;

        const handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = joyBase.getBoundingClientRect();
            this.touchState.joystick.active = true;
            this.touchState.joystick.id = touch.identifier;
            this.touchState.joystick.startX = rect.left + rect.width / 2;
            this.touchState.joystick.startY = rect.top + rect.height / 2;
            this.updateJoystickPos(touch.clientX, touch.clientY, joyThumb);
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.touchState.joystick.id) {
                    this.updateJoystickPos(touch.clientX, touch.clientY, joyThumb);
                    break;
                }
            }
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.touchState.joystick.id) {
                    this.touchState.joystick.active = false;
                    this.touchState.joystick.x = 0;
                    this.touchState.joystick.y = 0;
                    this.touchState.joystick.id = null;
                    joyThumb.style.transform = 'translate(0px, 0px)';
                    break;
                }
            }
        };

        joyBase.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        // Enlazar botones táctiles
        const bindButton = (btnId, stateKey) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            const startPress = (e) => {
                e.preventDefault();
                this.touchState.buttons[stateKey] = true;
                btn.classList.add('pressed');
            };
            const endPress = (e) => {
                e.preventDefault();
                this.touchState.buttons[stateKey] = false;
                btn.classList.remove('pressed');
            };
            btn.addEventListener('touchstart', startPress, { passive: false });
            btn.addEventListener('touchend', endPress, { passive: false });
            btn.addEventListener('touchcancel', endPress, { passive: false });
            btn.addEventListener('mousedown', startPress);
            btn.addEventListener('mouseup', endPress);
            btn.addEventListener('mouseleave', endPress);
        };

        bindButton('btn-touch-pass', 'pass');
        bindButton('btn-touch-shoot', 'shoot');
        bindButton('btn-touch-sprint', 'sprint');
        bindButton('btn-touch-tackle', 'tackle');
        bindButton('btn-touch-switch', 'switch');
    }

    /**
     * Calcula el vector normalizado de desplazamiento del joystick táctil.
     */
    updateJoystickPos(clientX, clientY, thumbEl) {
        const joy = this.touchState.joystick;
        const dx = clientX - joy.startX;
        const dy = clientY - joy.startY;
        const maxRadius = 45;
        const dist = Math.hypot(dx, dy);

        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;

        thumbEl.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
        joy.x = dist > 6 ? (thumbX / maxRadius) : 0;
        joy.y = dist > 6 ? (thumbY / maxRadius) : 0;
    }

    /**
     * Lee el estado del gamepad físico conectado en el índice especificado.
     * @param {number} [padIndex=0] - Índice del mando.
     * @returns {Object|null} Estado de botones y ejes.
     */
    pollGamepad(padIndex = 0) {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        const pad = pads[padIndex];
        if (!pad) return null;

        const deadzone = 0.18;
        let axisX = pad.axes[0] || 0;
        let axisY = pad.axes[1] || 0;

        if (Math.abs(axisX) < deadzone) axisX = 0;
        if (Math.abs(axisY) < deadzone) axisY = 0;

        // Cruceta D-Pad
        if (pad.buttons[14]?.pressed) axisX = -1;
        if (pad.buttons[15]?.pressed) axisX = 1;
        if (pad.buttons[12]?.pressed) axisY = -1;
        if (pad.buttons[13]?.pressed) axisY = 1;

        return {
            x: axisX,
            y: axisY,
            pass: pad.buttons[0]?.pressed || false,       // A / Cruz
            shoot: pad.buttons[2]?.pressed || pad.buttons[3]?.pressed || false, // X o Y
            tackle: pad.buttons[1]?.pressed || false,     // B / Círculo
            sprint: pad.buttons[5]?.pressed || pad.buttons[7]?.pressed || false, // RB o RT
            switchPlayer: pad.buttons[4]?.pressed || false // LB / L1
        };
    }

    /**
     * Obtiene el vector de entrada del Jugador 1 (WASD / Joystick táctil / Mando 1).
     * @returns {Object} { x, y, pass, shoot, sprint, tackle, switchPlayer }.
     */
    getPlayer1Input() {
        let moveX = 0;
        let moveY = 0;

        // Teclado WASD
        if (this.keys['KeyA'] || this.keys['a']) moveX -= 1;
        if (this.keys['KeyD'] || this.keys['d']) moveX += 1;
        if (this.keys['KeyW'] || this.keys['w']) moveY -= 1;
        if (this.keys['KeyS'] || this.keys['s']) moveY += 1;

        // Botones de acción Teclado P1
        let pass = this.keys['KeyJ'] || this.keys['j'] || false;
        let shoot = this.keys['KeyK'] || this.keys['k'] || false;
        let sprint = this.keys['KeyL'] || this.keys['l'] || this.keys['ShiftLeft'] || false;
        let tackle = this.keys['KeyU'] || this.keys['u'] || false;
        let switchPlayer = this.keys['Space'] || this.keys['KeyI'] || this.keys['i'] || false;

        // Táctil móvil
        if (this.touchState.joystick.active) {
            moveX = this.touchState.joystick.x;
            moveY = this.touchState.joystick.y;
        }
        if (this.touchState.buttons.pass) pass = true;
        if (this.touchState.buttons.shoot) shoot = true;
        if (this.touchState.buttons.sprint) sprint = true;
        if (this.touchState.buttons.tackle) tackle = true;
        if (this.touchState.buttons.switch) switchPlayer = true;

        // Mando físico 1
        const gp1 = this.pollGamepad(0);
        if (gp1) {
            if (Math.abs(gp1.x) > 0.05 || Math.abs(gp1.y) > 0.05) {
                moveX = gp1.x;
                moveY = gp1.y;
            }
            if (gp1.pass) pass = true;
            if (gp1.shoot) shoot = true;
            if (gp1.sprint) sprint = true;
            if (gp1.tackle) tackle = true;
            if (gp1.switchPlayer) switchPlayer = true;
        }

        // Normalizar vector diagonal si es por teclado
        const mag = Math.hypot(moveX, moveY);
        if (mag > 1) {
            moveX /= mag;
            moveY /= mag;
        }

        return { x: moveX, y: moveY, pass, shoot, sprint, tackle, switchPlayer };
    }

    /**
     * Obtiene el vector de entrada del Jugador 2 (Flechas / Numpad / Mando 2).
     * @returns {Object} { x, y, pass, shoot, sprint, tackle, switchPlayer }.
     */
    getPlayer2Input() {
        let moveX = 0;
        let moveY = 0;

        if (this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['ArrowRight']) moveX += 1;
        if (this.keys['ArrowUp']) moveY -= 1;
        if (this.keys['ArrowDown']) moveY += 1;

        let pass = this.keys['Numpad1'] || this.keys['Digit1'] || this.keys['KeyN'] || this.keys['n'] || false;
        let shoot = this.keys['Numpad2'] || this.keys['Digit2'] || this.keys['KeyM'] || this.keys['m'] || false;
        let sprint = this.keys['Numpad3'] || this.keys['Digit3'] || this.keys['ControlRight'] || false;
        let tackle = this.keys['Numpad5'] || this.keys['Digit4'] || this.keys['KeyH'] || this.keys['h'] || false;
        let switchPlayer = this.keys['Numpad0'] || this.keys['Enter'] || false;

        const gp2 = this.pollGamepad(1);
        if (gp2) {
            if (Math.abs(gp2.x) > 0.05 || Math.abs(gp2.y) > 0.05) {
                moveX = gp2.x;
                moveY = gp2.y;
            }
            if (gp2.pass) pass = true;
            if (gp2.shoot) shoot = true;
            if (gp2.sprint) sprint = true;
            if (gp2.tackle) tackle = true;
            if (gp2.switchPlayer) switchPlayer = true;
        }

        const mag = Math.hypot(moveX, moveY);
        if (mag > 1) {
            moveX /= mag;
            moveY /= mag;
        }

        return { x: moveX, y: moveY, pass, shoot, sprint, tackle, switchPlayer };
    }
}

// Instancia global del gestor de entradas
export const input = new InputManager();
