// Interface em HTML que fica por cima da câmera: barra do topo, mira, abas,
// painel de detalhes (bottom sheet), avisos (toast), telas de carregando/erro/ajuda.
import { svgIcone } from './icones.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function criarUI(config) {
  const $ = (id) => document.getElementById(id);

  // Textos vindos do config.js
  document.querySelectorAll('[data-cfg]').forEach((el) => {
    const v = config[el.dataset.cfg];
    if (v) el.textContent = v;
  });

  // Ícones
  $('btnAjuda').innerHTML = svgIcone('ajuda');
  $('btnCompartilhar').innerHTML = svgIcone('compartilhar');
  $('sheetFechar').innerHTML = svgIcone('fechar');
  $('verCartaoFechar').innerHTML = svgIcone('fechar');
  const ABAS = { servicos: ['grade', 'Serviços'], portfolio: ['maleta', 'Portfólio'], contato: ['conversa', 'Contato'] };
  document.querySelectorAll('#abas button').forEach((b) => {
    const [icone, rotulo] = ABAS[b.dataset.aba];
    b.innerHTML = `${svgIcone(icone)}<span>${rotulo}</span>`;
  });

  const mostrar = (id) => $(id).classList.remove('oculto');
  const esconder = (id) => $(id).classList.add('oculto');

  let timerToast;
  function toast(msg, ms = 2800) {
    if (!msg) return;
    const t = $('toast');
    t.textContent = msg;
    t.classList.toggle('no-topo', !$('sheet').classList.contains('oculto'));
    t.classList.add('visivel');
    clearTimeout(timerToast);
    timerToast = setTimeout(() => t.classList.remove('visivel'), ms);
  }

  function carregando(texto) {
    $('carregandoTexto').textContent = texto;
    mostrar('carregando');
  }

  function erro(titulo, html) {
    $('erroTitulo').textContent = titulo;
    $('erroTexto').innerHTML = html;
    esconder('carregando');
    esconder('splash');
    mostrar('erro');
  }

  function hud(ativo) {
    for (const id of ['topo', 'abas']) (ativo ? mostrar : esconder)(id);
    $('mira').classList.toggle('oculto', !ativo);
  }

  function status(detectado) {
    const s = $('status');
    s.classList.toggle('detectado', detectado);
    s.classList.toggle('procurando', !detectado);
    s.querySelector('span').textContent = detectado ? 'Cartão detectado' : 'Procurando cartão…';
    $('mira').classList.toggle('oculto', detectado);
  }

  function abaAtiva(nome) {
    document.querySelectorAll('#abas button').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === nome));
  }

  // ----- Painel de detalhes -----
  let aoFecharSheet = null;
  function abrirSheet({ icone, cor, titulo, subtitulo, corpo, acoes = [], aoFechar }) {
    if (aoFecharSheet) { const f = aoFecharSheet; aoFecharSheet = null; f(); }
    $('sheetIcone').innerHTML = svgIcone(icone || 'cartao');
    $('sheetIcone').style.background = cor ? `linear-gradient(135deg, ${cor}, #0B1E40)` : '';
    $('sheetTitulo').textContent = titulo || '';
    $('sheetSubtitulo').textContent = subtitulo || '';
    $('sheetCorpo').innerHTML = corpo || '';
    const caixa = $('sheetAcoes');
    caixa.innerHTML = '';
    for (const a of acoes) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = a.classe || 'btn-principal';
      b.innerHTML = `${a.icone ? svgIcone(a.icone) : ''}<span>${esc(a.rotulo)}</span>`;
      b.addEventListener('click', a.onClick);
      caixa.appendChild(b);
    }
    aoFecharSheet = aoFechar || null;
    mostrar('sheetFundo');
    mostrar('sheet');
    $('sheet').scrollTop = 0;
  }
  function fecharSheet() {
    esconder('sheet');
    esconder('sheetFundo');
    if (aoFecharSheet) { const f = aoFecharSheet; aoFecharSheet = null; f(); }
  }
  $('sheetFechar').addEventListener('click', fecharSheet);
  $('sheetFundo').addEventListener('click', fecharSheet);

  // ----- Ajuda e imagem do cartão -----
  $('btnAjuda').addEventListener('click', () => mostrar('ajuda'));
  $('ajudaFechar').addEventListener('click', () => esconder('ajuda'));
  $('btnVerCartao').addEventListener('click', () => mostrar('verCartao'));
  $('verCartaoFechar').addEventListener('click', () => esconder('verCartao'));

  return { $, mostrar, esconder, toast, carregando, erro, hud, status, abaAtiva, abrirSheet, fecharSheet };
}
