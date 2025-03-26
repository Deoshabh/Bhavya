const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map to store client connections
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', async (ws, req) => {
            try {
                // Authenticate connection
                const token = this.extractToken(req);
                const user = await this.verifyToken(token);
                
                // Store client connection with user info
                this.clients.set(ws, {
                    userId: user._id,
                    role: user.role,
                    subscriptions: new Set()
                });

                // Handle messages
                ws.on('message', (message) => this.handleMessage(ws, message));
                
                // Handle disconnection
                ws.on('close', () => this.handleDisconnection(ws));

                // Send initial connection success
                this.sendToClient(ws, {
                    type: 'CONNECTION_SUCCESS',
                    data: { userId: user._id }
                });
            } catch (error) {
                ws.close(1008, 'Authentication failed');
            }
        });
    }

    // Handle incoming messages
    async handleMessage(ws, message) {
        try {
            const parsedMessage = JSON.parse(message);
            const client = this.clients.get(ws);

            switch (parsedMessage.type) {
                case 'SUBSCRIBE_EVENT':
                    client.subscriptions.add(parsedMessage.eventId);
                    break;

                case 'UNSUBSCRIBE_EVENT':
                    client.subscriptions.delete(parsedMessage.eventId);
                    break;

                default:
                    console.warn('Unknown message type:', parsedMessage.type);
            }
        } catch (error) {
            console.error('WebSocket message handling error:', error);
        }
    }

    // Broadcast ticket updates to relevant clients
    broadcastTicketUpdate(eventId, data) {
        this.wss.clients.forEach((client) => {
            const clientData = this.clients.get(client);
            if (clientData?.subscriptions.has(eventId)) {
                this.sendToClient(client, {
                    type: 'TICKET_UPDATE',
                    data
                });
            }
        });
    }

    // Helper methods
    sendToClient(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    handleDisconnection(ws) {
        this.clients.delete(ws);
    }

    extractToken(req) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw new Error('No token provided');
        return authHeader.split(' ')[1];
    }

    async verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = WebSocketService; 