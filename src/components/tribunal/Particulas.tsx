import { useMemo } from "react";

/**
 * Partículas flutuantes de fundo — poeira de dados e fragmentos de
 * conhecimento recuperado. Puramente decorativo e determinístico.
 */
export function Particulas({ quantidade = 26 }: { quantidade?: number }) {
  const particulas = useMemo(
    () =>
      Array.from({ length: quantidade }, (_, i) => {
        const semente = (i * 9301 + 49297) % 233280;
        const aleatorio = semente / 233280;
        const segunda = ((i * 4517 + 7919) % 104729) / 104729;
        const cor =
          i % 7 === 0
            ? "var(--color-persona)"
            : i % 5 === 0
              ? "var(--color-sistema)"
              : "var(--color-neon)";
        return {
          id: i,
          esquerda: `${(aleatorio * 100).toFixed(2)}%`,
          tamanho: `${(segunda * 2.6 + 1.2).toFixed(2)}px`,
          duracao: `${(segunda * 16 + 12).toFixed(1)}s`,
          atraso: `${(aleatorio * 18).toFixed(1)}s`,
          deriva: `${((segunda - 0.5) * 160).toFixed(0)}px`,
          cor,
          opacidade: `${(segunda * 0.45 + 0.16).toFixed(2)}`,
        };
      }),
    [quantidade],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particulas.map((p) => (
        <span
          key={p.id}
          className="particula"
          style={
            {
              left: p.esquerda,
              top: "100%",
              width: p.tamanho,
              height: p.tamanho,
              background: p.cor,
              boxShadow: `0 0 8px ${p.cor}`,
              "--particula-duracao": p.duracao,
              "--particula-atraso": p.atraso,
              "--particula-deriva": p.deriva,
              "--particula-opacidade": p.opacidade,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
