import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = React.useState(null);
    const [connected, setConnected] = React.useState(false);
    const [subscriptions] = React.useState(new Set());
    const messageHandlers = React.useRef(new Map());

    const connect = useCallback(() => {
        if (!user?.token) return;

        const ws = new WebSocket(process.env.REACT_APP_WS_URL);
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'AUTH',
                token: user.token
            }));
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const handlers = messageHandlers.current.get(message.type) || [];
                handlers.forEach(handler => handler(message.data));
            } catch (error) {
                console.error('WebSocket message handling error:', error);
            }
        };

        ws.onclose = () => {
            setConnected(false);
            // Attempt to reconnect after 5 seconds
            setTimeout(connect, 5000);
        };

        setSocket(ws);
    }, [user?.token]);

    useEffect(() => {
        connect();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [connect]);

    const subscribe = useCallback((eventId) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'SUBSCRIBE_EVENT',
                eventId
            }));
            subscriptions.add(eventId);
        }
    }, [socket, subscriptions]);

    const unsubscribe = useCallback((eventId) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'UNSUBSCRIBE_EVENT',
                eventId
            }));
            subscriptions.delete(eventId);
        }
    }, [socket, subscriptions]);

    const addMessageHandler = useCallback((type, handler) => {
        const handlers = messageHandlers.current.get(type) || [];
        messageHandlers.current.set(type, [...handlers, handler]);

        return () => {
            const updatedHandlers = messageHandlers.current.get(type)?.filter(h => h !== handler) || [];
            messageHandlers.current.set(type, updatedHandlers);
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{
            connected,
            subscribe,
            unsubscribe,
            addMessageHandler
        }}>
            {children}
        </WebSocketContext.Provider>
    );
}; 