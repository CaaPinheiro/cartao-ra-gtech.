// Desenha (em <canvas>) as imagens usadas nos objetos 3D: cartões de serviço,
// painel do portfólio, botões de contato, título, brilhos etc.
import * as THREE from 'three';
import { desenharIcone } from './icones.js';

const FONTE = 'Poppins, system-ui, sans-serif';
export const COR = {
  ciano: '#22D3EE',
  cianoClaro: '#A5F3FC',
  azul: '#2563EB',
  navy: '#0B1E40',
  fundo: '#071226',
  branco: '#F8FAFC',
  cinza: '#CBD5E1',
};

let anisotropia = 4;
export function configurarTexturas(renderer) {
  anisotropia = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function novoCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

export function paraTextura(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropia;
  return t;
}

function retArredondado(ctx, x, y, w, h, r) {
  const rr = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + rr[0], y);
  ctx.lineTo(x + w - rr[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr[1]);
  ctx.lineTo(x + w, y + h - rr[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr[2], y + h);
  ctx.lineTo(x + rr[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr[3]);
  ctx.lineTo(x, y + rr[0]);
  ctx.quadraticCurveTo(x, y, x + rr[0], y);
  ctx.closePath();
}

function quebrarLinhas(ctx, texto, larguraMax, maxLinhas = 3) {
  const palavras = String(texto || '').split(/\s+/).filter(Boolean);
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    const teste = atual ? atual + ' ' + p : p;
    if (ctx.measureText(teste).width <= larguraMax || !atual) atual = teste;
    else { linhas.push(atual); atual = p; }
  }
  if (atual) linhas.push(atual);
  if (linhas.length > maxLinhas) {
    linhas.length = maxLinhas;
    let ultima = linhas[maxLinhas - 1];
    while (ctx.measureText(ultima + '…').width > larguraMax && ultima.length) ultima = ultima.slice(0, -1);
    linhas[maxLinhas - 1] = ultima.trimEnd() + '…';
  }
  return linhas;
}

/** Reduz o tamanho da fonte até o texto caber na largura. */
function ajustarFonte(ctx, texto, peso, tamanho, larguraMax, minimo = 18) {
  let t = tamanho;
  ctx.font = `${peso} ${t}px ${FONTE}`;
  while (ctx.measureText(texto).width > larguraMax && t > minimo) {
    t -= 1;
    ctx.font = `${peso} ${t}px ${FONTE}`;
  }
  return t;
}

function painelVidro(ctx, x, y, w, h, r, corBorda = COR.ciano, alfa = 0.9) {
  ctx.save();
  retArredondado(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x + w * 0.3, y + h);
  g.addColorStop(0, `rgba(16, 40, 86, ${alfa})`);
  g.addColorStop(1, `rgba(5, 12, 28, ${alfa})`);
  ctx.fillStyle = g;
  ctx.shadowColor = corBorda;
  ctx.shadowBlur = 22;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = corBorda;
  ctx.stroke();
  ctx.restore();
}

function hexParaRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = (hex, a) => { const [r, g, b] = hexParaRgb(hex); return `rgba(${r},${g},${b},${a})`; };

// ---------------------------------------------------------------- Serviços
export function texturaServico(servico) {
  const W = 640, H = 384, M = 18;
  const [c, ctx] = novoCanvas(W, H);
  painelVidro(ctx, M, M, W - 2 * M, H - 2 * M, 38);

  // ícone em círculo
  const cx = M + 30 + 46, cy = M + 30 + 46;
  const g = ctx.createLinearGradient(cx - 46, cy - 46, cx + 46, cy + 46);
  g.addColorStop(0, '#5EEBFF');
  g.addColorStop(1, '#2F5BFF');
  ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.fillStyle = g;
  ctx.shadowColor = COR.ciano; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
  desenharIcone(ctx, servico.icone, cx, cy, 52, '#fff', 2.1);

  // selo "toque"
  ctx.font = `600 22px ${FONTE}`;
  const selo = 'TOQUE  ›';
  const sw = ctx.measureText(selo).width + 28;
  retArredondado(ctx, W - M - 26 - sw, M + 34, sw, 38, 19);
  ctx.fillStyle = 'rgba(34, 211, 238, .14)'; ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, .6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = COR.cianoClaro; ctx.textBaseline = 'middle';
  ctx.fillText(selo, W - M - 26 - sw + 14, M + 34 + 20);

  // textos
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COR.branco;
  ajustarFonte(ctx, servico.titulo, 700, 44, W - 2 * M - 60);
  ctx.fillText(servico.titulo, M + 30, 228);
  ctx.font = `500 27px ${FONTE}`;
  ctx.fillStyle = COR.cianoClaro;
  quebrarLinhas(ctx, servico.resumo, W - 2 * M - 60, 2).forEach((l, i) => ctx.fillText(l, M + 30, 274 + i * 36));
  return paraTextura(c);
}

// ---------------------------------------------------------------- Portfólio
export function iconeDoProjeto(item) {
  const t = (item.tipo + ' ' + item.titulo).toLowerCase();
  if (t.includes('loja') || t.includes('commerce')) return 'carrinho';
  if (t.includes('sistema') || t.includes('gestão') || t.includes('públic')) return 'predio';
  if (t.includes('servidor') || t.includes('devops')) return 'servidor';
  return 'globo';
}

export function texturaPortfolio(item, indice, total, imagem = null) {
  const W = 900, H = 640, M = 18;
  const cor = item.cor || COR.ciano;
  const [c, ctx] = novoCanvas(W, H);
  painelVidro(ctx, M, M, W - 2 * M, H - 2 * M, 40, cor, 0.92);

  // capa
  const cx = M + 16, cy = M + 16, cw = W - 2 * M - 32, ch = 236;
  ctx.save();
  retArredondado(ctx, cx, cy, cw, ch, 28);
  ctx.clip();
  if (imagem) {
    const esc = Math.max(cw / imagem.width, ch / imagem.height);
    const iw = imagem.width * esc, ih = imagem.height * esc;
    ctx.drawImage(imagem, cx + (cw - iw) / 2, cy + (ch - ih) / 2, iw, ih);
    const sombra = ctx.createLinearGradient(0, cy, 0, cy + ch);
    sombra.addColorStop(0.5, 'rgba(0,0,0,0)');
    sombra.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = sombra; ctx.fillRect(cx, cy, cw, ch);
  } else {
    const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
    g.addColorStop(0, rgba(cor, 0.95));
    g.addColorStop(1, '#0B1E40');
    ctx.fillStyle = g; ctx.fillRect(cx, cy, cw, ch);
    // decoração: grade + círculos
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5;
    for (let x = cx; x < cx + cw; x += 36) { ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + ch); ctx.stroke(); }
    for (let y = cy; y < cy + ch; y += 36) { ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + cw, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.beginPath(); ctx.arc(cx + cw - 110, cy + 40, 150, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + cw - 30, cy + ch + 10, 90, 0, Math.PI * 2); ctx.fill();
    // mini "janela de navegador"
    const jx = cx + cw - 330, jy = cy + 52, jw = 250, jh = 150;
    retArredondado(ctx, jx, jy, jw, jh, 14);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fill();
    ctx.fillStyle = rgba(cor, 0.9); ctx.fillRect(jx, jy + 26, jw, 6);
    ['#F87171', '#FBBF24', '#34D399'].forEach((k, i) => { ctx.fillStyle = k; ctx.beginPath(); ctx.arc(jx + 16 + i * 16, jy + 13, 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(jx + 16, jy + 48, 120, 12); ctx.fillRect(jx + 16, jy + 70, 180, 9); ctx.fillRect(jx + 16, jy + 88, 150, 9);
    ctx.fillStyle = rgba(cor, 0.85); retArredondado(ctx, jx + 16, jy + 110, 84, 24, 12); ctx.fill();
    // ícone grande
    ctx.beginPath(); ctx.arc(cx + 104, cy + ch / 2 + 6, 62, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(7,18,38,.55)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.stroke();
    desenharIcone(ctx, iconeDoProjeto(item), cx + 104, cy + ch / 2 + 6, 66, '#fff', 2);
  }
  ctx.restore();

  // contador
  const cont = `${indice + 1}/${total}`;
  ctx.font = `700 24px ${FONTE}`;
  const tw = ctx.measureText(cont).width + 26;
  retArredondado(ctx, cx + cw - tw - 14, cy + 14, tw, 38, 19);
  ctx.fillStyle = 'rgba(7,18,38,.75)'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
  ctx.fillText(cont, cx + cw - tw - 1, cy + 34);
  ctx.textBaseline = 'alphabetic';

  // textos
  const tx = M + 34, larg = W - 2 * M - 68;
  ctx.fillStyle = COR.branco;
  ajustarFonte(ctx, item.titulo, 700, 46, larg);
  ctx.fillText(item.titulo, tx, 330);
  ctx.fillStyle = cor;
  ajustarFonte(ctx, item.tipo, 600, 27, larg);
  ctx.fillText(item.tipo, tx, 370);
  ctx.font = `400 26px ${FONTE}`;
  ctx.fillStyle = COR.cinza;
  quebrarLinhas(ctx, item.descricao, larg, 3).forEach((l, i) => ctx.fillText(l, tx, 414 + i * 36));

  // tags
  ctx.font = `600 21px ${FONTE}`;
  let x = tx;
  const y = H - M - 70;
  for (const tag of item.tags || []) {
    const w = ctx.measureText(tag).width + 28;
    if (x + w > W - M - 220) break;
    retArredondado(ctx, x, y, w, 40, 20);
    ctx.fillStyle = rgba(cor, 0.16); ctx.fill();
    ctx.strokeStyle = rgba(cor, 0.7); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
    ctx.fillText(tag, x + 14, y + 21);
    ctx.textBaseline = 'alphabetic';
    x += w + 10;
  }
  ctx.font = `600 22px ${FONTE}`;
  ctx.fillStyle = COR.cianoClaro;
  ctx.textAlign = 'right';
  ctx.fillText('Toque para ver  ›', W - M - 34, y + 28);
  ctx.textAlign = 'left';
  return paraTextura(c);
}

// ---------------------------------------------------------------- Botões de contato
export function texturaBotao(rotulo, icone, cor) {
  const W = 300, H = 340;
  const [c, ctx] = novoCanvas(W, H);
  const x = 46, y = 18, s = 208;
  retArredondado(ctx, x, y, s, s, 56);
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, cor);
  const [r, gg, b] = hexParaRgb(cor);
  g.addColorStop(1, `rgb(${Math.round(r * 0.45)},${Math.round(gg * 0.45)},${Math.round(b * 0.55)})`);
  ctx.fillStyle = g;
  ctx.shadowColor = cor; ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
  desenharIcone(ctx, icone, x + s / 2, y + s / 2, 112, '#fff', 2.1);

  retArredondado(ctx, 16, 252, W - 32, 66, 33);
  ctx.fillStyle = 'rgba(7, 18, 38, .88)'; ctx.fill();
  ctx.strokeStyle = 'rgba(165, 243, 252, .35)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff';
  ajustarFonte(ctx, rotulo, 600, 31, W - 64, 18);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(rotulo, W / 2, 287);
  return paraTextura(c);
}

// ---------------------------------------------------------------- Setas e indicadores do portfólio
export function texturaSeta(direcao) {
  const S = 160;
  const [c, ctx] = novoCanvas(S, S);
  ctx.beginPath(); ctx.arc(S / 2, S / 2, 62, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7, 18, 38, .9)';
  ctx.shadowColor = COR.ciano; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 4; ctx.strokeStyle = COR.ciano; ctx.stroke();
  desenharIcone(ctx, direcao, S / 2, S / 2, 70, '#fff', 2.6);
  return paraTextura(c);
}

export function desenharPontos(canvas, total, ativo) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const h = canvas.height, r = h * 0.3, gap = h * 0.45;
  const largAtivo = r * 5;
  const totalW = (total - 1) * (2 * r + gap) + largAtivo;
  let x = (canvas.width - totalW) / 2;
  for (let i = 0; i < total; i++) {
    const w = i === ativo ? largAtivo : 2 * r;
    retArredondado(ctx, x, h / 2 - r, w, 2 * r, r);
    ctx.fillStyle = i === ativo ? COR.ciano : 'rgba(255,255,255,.55)';
    ctx.fill();
    x += w + gap;
  }
}

export function canvasPontos() {
  const [c] = novoCanvas(480, 48);
  return c;
}

// ---------------------------------------------------------------- Título acima do cartão
export function texturaTitulo(marca, slogan) {
  const W = 1024, H = 230;
  const [c, ctx] = novoCanvas(W, H);
  retArredondado(ctx, 12, 12, W - 24, H - 24, 50);
  ctx.fillStyle = 'rgba(7, 18, 38, .78)'; ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, .45)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = `800 96px ${FONTE}`;
  ctx.shadowColor = COR.ciano; ctx.shadowBlur = 24;
  ctx.fillText(marca, W / 2, 118);
  ctx.shadowBlur = 0;
  ctx.fillStyle = COR.cianoClaro;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ajustarFonte(ctx, slogan.toUpperCase(), 600, 34, W - 120, 20);
  ctx.fillText(slogan.toUpperCase(), W / 2, 178);
  return paraTextura(c);
}

// ---------------------------------------------------------------- Efeitos
export function texturaBrilho() {
  const S = 256;
  const [c, ctx] = novoCanvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(94, 235, 255, .85)');
  g.addColorStop(0.35, 'rgba(34, 211, 238, .30)');
  g.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return paraTextura(c);
}

export function texturaVarredura() {
  const [c, ctx] = novoCanvas(16, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(34, 211, 238, 0)');
  g.addColorStop(0.42, 'rgba(34, 211, 238, .35)');
  g.addColorStop(0.5, 'rgba(220, 252, 255, 1)');
  g.addColorStop(0.58, 'rgba(34, 211, 238, .35)');
  g.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  return paraTextura(c);
}

export function texturaParticula() {
  const S = 64;
  const [c, ctx] = novoCanvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(94,235,255,.8)');
  g.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return paraTextura(c);
}
