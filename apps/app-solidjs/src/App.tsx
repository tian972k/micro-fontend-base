import type { Component } from "solid-js";
import type { MicroAppProps } from "@repo/core/solid";
import { UserProfileFeature } from "./features/UserProfileFeature";

// Typed with the props the shell passes on mount (see entry-mfe.tsx) so the
// entry can forward them type-safely, even though nothing reads them yet.
const App: Component<MicroAppProps> = () => <UserProfileFeature />;

export default App;
