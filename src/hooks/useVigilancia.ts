import { useEffect, useRef } from "react";

type Motivo = "aba" | "foco" | "colagem";

/**
 * O CARCEREIRO DE ABAS — vigilância intransigente.
 * Qualquer fuga do foco ou tentativa de colar conteúdo externo dispara a sentença.
 */
export function useVigilancia(ativo: boolean, onFuga: (motivo: Motivo) => void) {
  const disparado = useRef(false);

  useEffect(() => {
    if (!ativo) {
      disparado.current = false;
      return;
    }

    const disparar = (motivo: Motivo) => {
      if (disparado.current) return;
      disparado.current = true;
      onFuga(motivo);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") disparar("aba");
    };
    const onBlur = () => disparar("foco");
    const onPaste = (e: Event) => {
      e.preventDefault();
      disparar("colagem");
    };
    const onContext = (e: Event) => e.preventDefault();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
    };
  }, [ativo, onFuga]);
}
