import type { MicroApp, MicroAppProps } from "../../types";

export interface MfeStrategy {
  mount(app: MicroApp, container: HTMLElement, props: MicroAppProps): void;
  unmount(app: MicroApp, container: HTMLElement): void;
}

export class DefaultStrategy implements MfeStrategy {
  mount(app: MicroApp, container: HTMLElement, props: MicroAppProps): void {
    app.mount(container, props);
  }

  unmount(app: MicroApp, container: HTMLElement): void {
    app.unmount(container);
  }
}
