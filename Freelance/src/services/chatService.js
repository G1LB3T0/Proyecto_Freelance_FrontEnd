// Servicio de Chat con WebSocket para comunicación en tiempo real

class ChatService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageHandlers = new Set();
        this.statusHandlers = new Set();
        this.isConnecting = false;
    }

    connect(userId, token) {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket already connected or connecting');
            return;
        }

        if (this.isConnecting) {
            console.log('Connection already in progress');
            return;
        }

        this.isConnecting = true;
        const WS_URL = import.meta?.env?.VITE_WS_URL || 'ws://localhost:3000';

        try {
            // Conectar al servidor WebSocket
            this.ws = new WebSocket(`${WS_URL}/chat?userId=${userId}&token=${token}`);

            this.ws.onopen = () => {
                console.log('✅ WebSocket conectado');
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                this.notifyStatus('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.isConnecting = false;
                this.notifyStatus('error');
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket desconectado');
                this.isConnecting = false;
                this.notifyStatus('disconnected');
                this.attemptReconnect(userId, token);
            };
        } catch (error) {
            console.error('Error al conectar WebSocket:', error);
            this.isConnecting = false;
            this.notifyStatus('error');
        }
    }

    attemptReconnect(userId, token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect(userId, token);
            }, this.reconnectDelay);
        } else {
            console.error('Máximo de intentos de reconexión alcanzado');
            this.notifyStatus('failed');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión automática
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn('WebSocket no está conectado');
            return false;
        }
    }

    handleMessage(data) {
        // Notificar a todos los handlers registrados
        this.messageHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('Error en message handler:', error);
            }
        });
    }

    notifyStatus(status) {
        this.statusHandlers.forEach(handler => {
            try {
                handler(status);
            } catch (error) {
                console.error('Error en status handler:', error);
            }
        });
    }

    // Registrar listener para mensajes
    onMessage(callback) {
        this.messageHandlers.add(callback);

        // Retornar función para desregistrar
        return () => {
            this.messageHandlers.delete(callback);
        };
    }

    // Registrar listener para cambios de estado
    onStatusChange(callback) {
        this.statusHandlers.add(callback);

        return () => {
            this.statusHandlers.delete(callback);
        };
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
const chatService = new ChatService();
export default chatService;
