import { API_BASE_URL } from "../config/api";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.callbacks = {};
    this.reconnectInterval = 1000; // milliseconds
    this.maxReconnectInterval = 30000; // milliseconds
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected.");
      return;
    }

    const wsUrl = `${API_BASE_URL.replace("http", "ws")}/ws/${userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      if (this.callbacks.onOpen) {
        this.callbacks.onOpen();
      }
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);
      if (this.callbacks.onMessage) {
        this.callbacks.onMessage(message);
      }
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      if (this.callbacks.onClose) {
        this.callbacks.onClose(event);
      }
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      this.ws.close(); // Close to trigger onclose and reconnect logic
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(
        this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
        this.maxReconnectInterval
      );
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts})`);
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, delay);
    } else {
      console.warn("Max reconnect attempts reached. Giving up.");
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Message not sent.", message);
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.reconnectAttempts = 0;
      console.log("WebSocket closed manually.");
    }
  }

  onOpen(callback) {
    this.callbacks.onOpen = callback;
  }

  onMessage(callback) {
    this.callbacks.onMessage = callback;
  }

  onClose(callback) {
    this.callbacks.onClose = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }
}

export default new WebSocketService();


