import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * useSyncExternalStore em vez de useState + useEffect: o padrão antigo chamava
 * setState dentro do efeito, o que dispara render em cascata (e é erro na regra
 * react-hooks/set-state-in-effect que o Next 16 passou a aplicar).
 *
 * No servidor assume desktop; o cliente corrige na hidratação.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  )
}
