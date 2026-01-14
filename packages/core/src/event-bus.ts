export type EventCallback<T = any> = (data: T) => void;

/**
 * Singleton EventBus for cross-application communication.
 * Ensures only one instance exists in a browser environment.
 */
export class EventBus {
    private static instance: EventBus;
    private listeners: Record<string, EventCallback[]> = {};

    private constructor() { }

    public static getInstance(): EventBus {
        if (typeof window !== "undefined") {
            if (!window.__MFE_EVENT_BUS__) {
                window.__MFE_EVENT_BUS__ = new EventBus();
            }
            return window.__MFE_EVENT_BUS__;
        }

        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Subscribe to an event.
     */
    public on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from an event.
     */
    public off<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }

    /**
     * Emit an event to all subscribers.
     */
    public emit<T = any>(event: string, data: T): void {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in callback for event "${event}":`, error);
            }
        });
    }
}

/**
 * Pre-instantiated global EventBus.
 */
export const globalEventBus = EventBus.getInstance();
