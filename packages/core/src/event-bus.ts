export type EventCallback<T = any> = (data: T) => void;

export class EventBus {
    private static instance: EventBus;
    private listeners: Record<string, EventCallback[]> = {};

    private constructor() { }

    public static getInstance(): EventBus {
        if (typeof window !== "undefined") {
            // @ts-ignore
            if (!window.__MFE_EVENT_BUS__) {
                // @ts-ignore
                window.__MFE_EVENT_BUS__ = new EventBus();
            }
            // @ts-ignore
            return window.__MFE_EVENT_BUS__;
        }

        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public on<T>(event: string, callback: EventCallback<T>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    public off<T>(event: string, callback: EventCallback<T>): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }

    public emit<T>(event: string, data: T): void {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => callback(data));
    }
}

export const globalEventBus = EventBus.getInstance();
