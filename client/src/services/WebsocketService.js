//Singleton Pattern to create a single instance of the Websocket
import { host } from '../redux/api';
import { updateAvbalance, updateExposure } from '../redux/reducer/authReducer';
import {
  getPendingBet,
  updateCashoutValues,
} from '../redux/reducer/betReducer';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.currentUserId = null;
  }

  connect(dispatch, userId = null) {
    if (this.socket) {
      console.log('WebSocket already connected');
      return;
    }

    // Store userId for filtering incoming messages
    this.currentUserId = userId || localStorage.getItem('userId');

    this.socket = new WebSocket(host);

    this.socket.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket connected, userId:', this.currentUserId);

      // Register userId so backend can send targeted updates (balance, exposure, open bets, cashout)
      if (this.currentUserId && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({ type: 'register', userId: this.currentUserId })
        );
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'balance_update') {
          // Only update if this is for the current user
          if (!data.userId || data.userId === this.currentUserId) {
            dispatch(updateAvbalance(data.newBalance));
          }
        }

        if (data.type === 'exposure_update') {
          // Only update if this is for the current user
          if (!data.userId || data.userId === this.currentUserId) {
            dispatch(updateExposure(data.newExposure));
          }
        }

        // if (data.type === 'open_bets_update') {
        //   if (data.userId === this.currentUserId) {
        //     console.log('Refreshing open bets for user:', this.currentUserId);
        //     dispatch(getPendingBet());
        //   }
        // }

        if (data.type === 'cashout_update') {
          if (data.userId === this.currentUserId) {
            dispatch(updateCashoutValues(data.bets));
          }
        }
      } catch (error) {
        console.error(' WebSocket Error:', error);
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      this.socket = null;
      this.tryReconnect(dispatch);
    };

    this.socket.onerror = (error) => {
      console.error(
        '%c WebSocket Error',
        'background: #f44336; color: white; padding: 2px;',
        error
      );
    };
  }

  // Subscribe to a game with userId
  subscribe(gameid, apitype = 'cricket', roundId = null) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'subscribe',
        gameid: gameid,
        apitype: apitype,
        roundId: roundId,
        userId: this.currentUserId,
      };
      this.socket.send(JSON.stringify(message));
      console.log('Subscribed to:', gameid, 'with userId:', this.currentUserId);
    } else {
      console.warn('WebSocket not ready, cannot subscribe');
    }
  }

  // Update current userId (useful when user logs in)
  setUserId(userId) {
    this.currentUserId = userId;
    // Re-register with backend if already connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN && userId) {
      this.socket.send(JSON.stringify({ type: 'register', userId }));
    }
  }

  tryReconnect(dispatch) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(` Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(dispatch, this.currentUserId), 3000);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Create a single instance
export const wsService = new WebSocketService();
