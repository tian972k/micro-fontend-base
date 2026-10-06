import { EventBus, type EventCallback } from "../events/event-bus";
import type { RuntimeEventMap } from "./runtime-events";

/**
 * A type-safe, namespaced view over the shared EventBus.
 *
 * Every event name is prefixed with `namespace` on the wire (for example
 * `runtime:v1:theme:set`), so:
 * - payloads are checked at compile time against the event map,
 * - unrelated MFEs can't collide on a bare name like "update",
 * - a breaking payload change ships as a new namespace (`runtime:v2`)
 *   while old MFEs keep listening on v1 during a rollout.
 */
export interface TypedEventBus<TMap extends Record<string, unknown>> {
  readonly namespace: string;
  emit<E extends keyof TMap & string>(event: E, payload: TMap[E]): void;
  on<E extends keyof TMap & string>(
    event: E,
    callback: EventCallback<TMap[E]>,
  ): () => void;
  once<E extends keyof TMap & string>(
    event: E,
    callback: EventCallback<TMap[E]>,
  ): () => void;
}

export function createTypedEventBus<TMap extends Record<string, unknown>>(
  namespace: string,
  bus: EventBus = EventBus.getInstance(),
): TypedEventBus<TMap> {
  const channel = (event: string) => `${namespace}:${event}`;

  return {
    namespace,
    emit(event, payload) {
      bus.emit(channel(event), payload);
    },
    on(event, callback) {
      return bus.on(channel(event), callback);
    },
    once(event, callback) {
      const off = bus.on<TMap[typeof event]>(channel(event), (payload) => {
        off();
        callback(payload);
      });
      return off;
    },
  };
}

/**
 * The platform-wide runtime events (navigation, auth, theme, locale,
 * notifications). Extend RuntimeEventMap to add events; bump the
 * namespace version for breaking payload changes.
 */
export const runtimeEvents = createTypedEventBus<RuntimeEventMap>("runtime:v1");
