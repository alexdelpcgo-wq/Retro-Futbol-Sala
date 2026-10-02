/**
 * Online P2P Multiplayer Engine using WebRTC (PeerJS)
 * Enables real-time 60fps online matches across PC, phone and tablets with room codes
 */

export class NetworkManager {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.isConnected = false;
        this.roomCode = null;
        this.onMatchStart = null;
        this.onRemoteInput = null;
        this.onStateUpdate = null;
        this.statusCallback = null;
    }

    setStatus(msg) {
        console.log('[Network]', msg);
        if (this.statusCallback) this.statusCallback(msg);
    }

    initPeer(onReady) {
        if (this.peer && !this.peer.destroyed) {
            if (onReady) onReady();
            return;
        }

        // Load PeerJS dynamically if not present
        if (typeof window.Peer === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
            script.onload = () => {
                this.createPeerInstance(onReady);
            };
            script.onerror = () => {
                this.setStatus('Error al cargar librería WebRTC. Verifica tu conexión.');
            };
            document.head.appendChild(script);
        } else {
            this.createPeerInstance(onReady);
        }
    }

    createPeerInstance(onReady) {
        try {
            const randomId = 'futsal16_' + Math.random().toString(36).substring(2, 8).toUpperCase();
            this.peer = new window.Peer(randomId, {
                debug: 1
            });

            this.peer.on('open', (id) => {
                this.setStatus(`Conectado al servidor de matchmaking. Tu ID: ${id}`);
                if (onReady) onReady(id);
            });

            this.peer.on('connection', (conn) => {
                this.isHost = true;
                this.conn = conn;
                this.setupConnection();
                this.setStatus('¡Un rival se ha unido a tu sala!');
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.setStatus(`Error de red: ${err.type || 'Desconocido'}`);
            });
        } catch (e) {
            console.error('Failed to init PeerJS:', e);
        }
    }

    createRoom(customCode, callback) {
        this.initPeer((peerId) => {
            const code = customCode ? customCode.toUpperCase() : ('SALA-' + Math.floor(1000 + Math.random() * 9000));
            this.roomCode = code;
            this.isHost = true;
            this.setStatus(`Sala creada: [${code}]. Esperando a que tu amigo se una...`);
            if (callback) callback(code);
        });
    }

    joinRoom(targetCode, callback) {
        const cleanCode = targetCode.trim();
        this.initPeer(() => {
            this.isHost = false;
            this.setStatus(`Conectando a la sala ${cleanCode}...`);

            // Target peer ID format
            const targetPeerId = cleanCode.startsWith('futsal16_') ? cleanCode : (cleanCode);
            
            // Connect
            this.conn = this.peer.connect(targetPeerId, {
                reliable: false // UDP-like speed for gaming
            });

            this.setupConnection();
            if (callback) callback();
        });
    }

    setupConnection() {
        if (!this.conn) return;

        this.conn.on('open', () => {
            this.isConnected = true;
            this.setStatus('¡Conexión establecida con éxito!');
            if (this.onMatchStart) this.onMatchStart(this.isHost);
        });

        this.conn.on('data', (data) => {
            if (data.type === 'input' && this.onRemoteInput) {
                this.onRemoteInput(data.input);
            } else if (data.type === 'state' && this.onStateUpdate) {
                this.onStateUpdate(data.state);
            }
        });

        this.conn.on('close', () => {
            this.isConnected = false;
            this.setStatus('El rival se ha desconectado.');
        });
    }

    sendInput(inputData) {
        if (this.conn && this.isConnected) {
            this.conn.send({ type: 'input', input: inputData });
        }
    }

    sendState(gameState) {
        if (this.conn && this.isConnected && this.isHost) {
            this.conn.send({ type: 'state', state: gameState });
        }
    }

    disconnect() {
        if (this.conn) this.conn.close();
        if (this.peer) this.peer.destroy();
        this.isConnected = false;
        this.conn = null;
        this.peer = null;
    }
}

export const network = new NetworkManager();
