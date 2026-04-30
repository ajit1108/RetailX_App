type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

const getListeners = (eventName: string) => {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }

  return listeners.get(eventName)!;
};

export const emitAppEvent = (eventName: string) => {
  getListeners(eventName).forEach((listener) => {
    listener();
  });
};

export const subscribeToAppEvent = (eventName: string, listener: Listener) => {
  const eventListeners = getListeners(eventName);
  eventListeners.add(listener);

  return () => {
    eventListeners.delete(listener);
  };
};

export const BILL_CREATED_EVENT = "bill-created";
