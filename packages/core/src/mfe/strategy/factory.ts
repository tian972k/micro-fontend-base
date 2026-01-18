import type { MfeStrategy } from "./base";
import { DefaultStrategy } from "./base";
import {
  VueStrategy,
  ReactStrategy,
  SvelteStrategy,
  SolidStrategy,
} from "./implementations";
import { MicroAppType } from "../../types";

export class MfeStrategyFactory {
  private static strategies: Map<MicroAppType, MfeStrategy> = new Map();

  static register(type: MicroAppType, strategy: MfeStrategy) {
    this.strategies.set(type, strategy);
  }

  static get(type: MicroAppType): MfeStrategy {
    // Lazy registration or simple switch for default sets
    if (!this.strategies.has(type)) {
      switch (type) {
        case MicroAppType.VUE:
          return new VueStrategy();
        case MicroAppType.REACT:
          return new ReactStrategy();
        case MicroAppType.SVELTE:
          return new SvelteStrategy();
        case MicroAppType.SOLID:
          return new SolidStrategy();
        default:
          return new DefaultStrategy();
      }
    }
    return this.strategies.get(type) || new DefaultStrategy();
  }
}
