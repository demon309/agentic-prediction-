import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketMessage } from "@/types/tennis";

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { reconnectAttempts = 5, reconnectInterval = 3000 } = options;
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const subscriptions = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setConnectionStatus('connected');
      reconnectCount.current = 0;
      
      // Re-subscribe to previously subscribed channels
      subscriptions.current.forEach(channel => {
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          channel
        }));
      });
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect
      if (reconnectCount.current < reconnectAttempts) {
        setTimeout(() => {
          reconnectCount.current++;
          connect();
        }, reconnectInterval);
      }
    };

    ws.current.onerror = () => {
      setConnectionStatus('error');
    };
  }, [reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  const subscribe = useCallback((channel: string) => {
    subscriptions.current.add(channel);
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        channel
      }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    subscriptions.current.delete(channel);
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'unsubscribe',
        channel
      }));
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    lastMessage,
    subscribe,
    unsubscribe,
    sendMessage,
    connect,
    disconnect
  };
}
