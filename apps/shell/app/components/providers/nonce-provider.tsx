import { createContext, useContext } from "react";

/**
 * Carries the per-request CSP nonce from entry.server to the <script>
 * tags rendered by root.tsx. On the client it is "" (browsers hide the
 * nonce attribute after load, and the scripts have already run).
 */
const NonceContext = createContext<string>("");

export const NonceProvider = NonceContext.Provider;
export const useNonce = () => useContext(NonceContext);
