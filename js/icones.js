// Ícones simples desenhados para este projeto (traço, grade 24x24).
// O mesmo desenho é usado no HTML (SVG) e nas texturas 3D (canvas / Path2D).

export const ICONES = {
  monitor: 'M3 4.5h18v11.5H3z M8.5 20h7 M12 16v4',
  carrinho: 'M2.5 4h2.6l2.3 10.4h10.4L20 7.2H6.1 M10.6 19.2a1.4 1.4 0 1 1-2.8 0a1.4 1.4 0 1 1 2.8 0 M18.1 19.2a1.4 1.4 0 1 1-2.8 0a1.4 1.4 0 1 1 2.8 0',
  predio: 'M3 20.5h18 M4.5 20.5V10 M19.5 20.5V10 M9.5 20.5v-7 M14.5 20.5v-7 M2.5 9.5 12 3.5l9.5 6z',
  servidor: 'M4 4h16v6.5H4z M4 13.5h16V20H4z M7.5 7.25h1 M7.5 16.75h1 M12 7.25h4.5 M12 16.75h4.5',
  conversa: 'M4 4.5h16v11H10l-5 4.5v-4.5H4z M8.5 10h.01 M12 10h.01 M15.5 10h.01',
  telefone: 'M6.5 3.5h3l1.6 4.4-2 1.4a11.5 11.5 0 0 0 5.6 5.6l1.4-2 4.4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z',
  email: 'M3 5.5h18v13H3z M3.5 6.5 12 13l8.5-6.5',
  camera: 'M3 8h4l1.8-2.8h6.4L17 8h4v11H3z M12 9.8a3.6 3.6 0 1 1 0 7.2a3.6 3.6 0 1 1 0-7.2',
  globo: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18 M3.5 9.5h17 M3.5 14.5h17 M12 3c-3.2 3.4-3.2 14.6 0 18 M12 3c3.2 3.4 3.2 14.6 0 18',
  contato: 'M9 11.5a4 4 0 1 1 0-8a4 4 0 1 1 0 8 M2.5 20.5c0-3.9 2.9-6.5 6.5-6.5s6.5 2.6 6.5 6.5 M19 8.5v6 M16 11.5h6',
  grade: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  maleta: 'M3 7.5h18v12H3z M8.5 7.5V4.5h7v3 M3 12.5h18 M11 12.5v2h2v-2',
  esquerda: 'M15 4.5 7.5 12l7.5 7.5',
  direita: 'M9 4.5l7.5 7.5L9 19.5',
  fechar: 'M6 6l12 12 M18 6 6 18',
  ok: 'M4.5 12.5l5 5 10-11',
  ajuda: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18 M9.3 9.4a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2 1-1.2 1.8v.7 M12 17.2h.01',
  compartilhar: 'M18 8.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5 M6 14.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5 M18 20.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5 M8.2 10.8l7.6-4.1 M8.2 13.2l7.6 4.1',
  link: 'M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6',
  cartao: 'M3 6h18v12H3z M6.5 10h5 M6.5 13.5h8',
  zap: 'M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z',
};

/** Retorna o SVG inline de um ícone (para usar no HTML). */
export function svgIcone(nome, classe = 'ico') {
  const d = ICONES[nome] || '';
  return `<svg class="${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}

const cachePath = new Map();

/** Desenha um ícone no canvas 2D, centralizado em (cx, cy), com o tamanho indicado. */
export function desenharIcone(ctx, nome, cx, cy, tamanho, cor = '#fff', espessura = 2) {
  if (!cachePath.has(nome)) cachePath.set(nome, new Path2D(ICONES[nome] || ''));
  const s = tamanho / 24;
  ctx.save();
  ctx.translate(cx - tamanho / 2, cy - tamanho / 2);
  ctx.scale(s, s);
  ctx.strokeStyle = cor;
  ctx.lineWidth = espessura;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(cachePath.get(nome));
  ctx.restore();
}
