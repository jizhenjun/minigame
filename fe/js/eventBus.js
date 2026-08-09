// Lightweight pub/sub event bus for decoupled component communication
const listeners = {};

export const EventBus = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  },

  emit(event, data) {
    (listeners[event] || []).forEach(cb => cb(data));
  },

  off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }
};
