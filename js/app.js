// =====================================================================
// Cartão de Visita em Realidade Aumentada — GTech
// Fluxo: tela inicial → câmera → MindAR procura o cartão → conteúdo 3D
// aparece preso ao cartão → toques nos objetos 3D abrem detalhes/ações.
// =====================================================================
import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { CONFIG } from '../config.js';
import { criarCena } from './cena.js';
import { Suavizador } from './suavizador.js';
import { criarUI, esc } from './ui.js';
import { criarAcoes } from './acoes.js';
import { svgIcone } from './icones.js';
import { iconeDoProjeto } from './texturas.js';

const ui = criarUI(CONFIG);
const acoes = criarAcoes(CONFIG);

let mindar = null;
let cena = null;
let ancora = null;
let suavizador = null;
let rastreando = false;
let timerPerda = null;
let iniciando = false;
let ultimoQuadro = performance.now();

const ERROS = {
  https: ['A câmera precisa de HTTPS', 'Abra o app por um endereço que comece com <b>https://</b> (por exemplo, o link do GitHub Pages). Os navegadores bloqueiam a câmera em páginas sem HTTPS.'],
  suporte: ['Navegador sem suporte à câmera', 'Abra este link no <b>Google Chrome</b> atualizado (Android) ou no <b>Safari</b> (iPhone).'],
  permissao: ['Permissão da câmera negada', 'Toque no ícone ao lado do endereço do site → <b>Permissões</b> → <b>Câmera</b> → <b>Permitir</b>. Depois toque em “Tentar de novo”.'],
  semCamera: ['Câmera não encontrada', 'Não encontramos uma câmera neste aparelho. Abra o link no celular.'],
  camera: ['Não foi possível abrir a câmera', 'Feche outros apps que estejam usando a câmera e tente de novo.'],
  ar: ['Erro ao iniciar a Realidade Aumentada', 'Confira se o arquivo <code>assets/targets.mind</code> está no projeto publicado e recarregue a página.'],
};

function falha(tipo, detalhe) {
  if (detalhe) console.error(detalhe);
  const [titulo, texto] = ERROS[tipo] || ERROS.ar;
  ui.erro(titulo, texto);
  iniciando = false;
}

async function carregarFontes() {
  try {
    await Promise.all(['400', '500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 32px Poppins`)));
  } catch { /* usa a fonte do sistema */ }
}

// ---------------------------------------------------------------- Início
async function iniciar() {
  if (iniciando) return;
  iniciando = true;
  // Tela cheia deixa a gravação do vídeo mais limpa (precisa ser pedida logo no toque)
  if (CONFIG.ar.telaCheia !== false && document.documentElement.requestFullscreen && !document.fullscreenElement) {
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }
  ui.esconder('splash');
  ui.carregando('Abrindo a câmera…');

  if (!window.isSecureContext) return falha('https');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return falha('suporte');

  // Pede a câmera antes para mostrar uma mensagem clara se algo der errado
  try {
    const teste = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    teste.getTracks().forEach((t) => t.stop());
  } catch (e) {
    const nome = e && e.name;
    if (nome === 'NotAllowedError' || nome === 'SecurityError') return falha('permissao', e);
    if (nome === 'NotFoundError' || nome === 'OverconstrainedError') return falha('semCamera', e);
    return falha('camera', e);
  }

  ui.carregando('Preparando a Realidade Aumentada…');
  try {
    await carregarFontes();
    mindar = new MindARThree({
      container: ui.$('ar'),
      imageTargetSrc: CONFIG.ar.alvo,
      maxTrack: 1,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
      filterMinCF: CONFIG.ar.filterMinCF,
      filterBeta: CONFIG.ar.filterBeta,
      warmupTolerance: CONFIG.ar.warmupTolerance,
      missTolerance: CONFIG.ar.missTolerance,
    });
    const { renderer, scene } = mindar;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    cena = criarCena({ renderer, scene, config: CONFIG, aoTocar: tratarToque });
    suavizador = new Suavizador(cena.raiz, CONFIG.ar.suavizacao);
    ancora = mindar.addAnchor(0);
    ancora.onTargetFound = aoEncontrar;
    ancora.onTargetLost = aoPerder;
    await mindar.start();
  } catch (e) {
    return falha('ar', e);
  }

  ui.esconder('carregando');
  ui.hud(true);
  ui.status(false);
  ajustarLayout();
  window.addEventListener('resize', ajustarLayout);
  ui.$('ar').addEventListener('click', aoClicar);
  document.addEventListener('visibilitychange', aoMudarVisibilidade);
  manterTelaLigada();
  mindar.renderer.setAnimationLoop(loop);
}

// Evita que a tela apague durante a demonstração/gravação
let wakeLock = null;
async function manterTelaLigada() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') wakeLock = await navigator.wakeLock.request('screen');
  } catch { /* não suportado: tudo bem */ }
}

// ---------------------------------------------------------------- Rastreamento
function aoEncontrar() {
  rastreando = true;
  clearTimeout(timerPerda);
  if (!cena.visivel) {
    suavizador.reiniciar();
    cena.entrar();
    if (navigator.vibrate) navigator.vibrate(25);
  }
  ui.status(true);
}

function aoPerder() {
  rastreando = false;
  clearTimeout(timerPerda);
  // pequena tolerância para o conteúdo não piscar em perdas rápidas
  timerPerda = setTimeout(() => {
    if (!rastreando) {
      cena.sair();
      ui.status(false);
    }
  }, 700);
}

function loop() {
  const agora = performance.now();
  const dt = Math.min(100, agora - ultimoQuadro);
  ultimoQuadro = agora;
  if (rastreando) suavizador.atualizar(ancora.group.matrix, dt);
  cena.atualizar(agora, dt);
  mindar.renderer.render(mindar.scene, mindar.camera);
}

function ajustarLayout() {
  const el = ui.$('ar');
  cena.layout(el.clientWidth > el.clientHeight * 1.05);
}

// Quando o usuário volta do WhatsApp/Instagram, reabre a câmera se ela tiver sido encerrada
async function aoMudarVisibilidade() {
  if (document.visibilityState !== 'visible' || !mindar) return;
  manterTelaLigada();
  const trilha = mindar.video && mindar.video.srcObject && mindar.video.srcObject.getVideoTracks()[0];
  if (trilha && trilha.readyState === 'live') {
    mindar.video.play().catch(() => {});
    return;
  }
  try {
    ui.carregando('Reabrindo a câmera…');
    // zera o estado do rastreamento: o cartão será procurado de novo
    clearTimeout(timerPerda);
    rastreando = false;
    ancora.visible = false;
    ancora.group.visible = false;
    cena.sair();
    ui.status(false);
    mindar.stop();
    await mindar.start();
    ajustarLayout();
  } catch (e) {
    console.error(e);
  } finally {
    ui.esconder('carregando');
  }
}

// ---------------------------------------------------------------- Toques
const ndc = new THREE.Vector2();
function aoClicar(e) {
  if (!cena) return;
  const r = mindar.renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  cena.tocar(ndc, mindar.camera);
}

function tratarToque(evento) {
  if (evento.tipo === 'servico') abrirServico(CONFIG.servicos[evento.indice]);
  else if (evento.tipo === 'portfolio') abrirProjeto(CONFIG.portfolio[evento.indice]);
  else if (evento.tipo === 'contato') ui.toast(acoes.contato(evento.id).msg);
}

function abrirServico(s) {
  ui.abrirSheet({
    icone: s.icone,
    titulo: s.titulo,
    subtitulo: s.resumo,
    corpo: `<p>${esc(s.descricao)}</p><ul>${(s.itens || []).map((i) => `<li>${svgIcone('ok')}<span>${esc(i)}</span></li>`).join('')}</ul>`,
    acoes: [
      { rotulo: 'Pedir orçamento no WhatsApp', icone: 'conversa', classe: 'btn-principal btn-whats', onClick: () => ui.toast(acoes.whatsapp(`${CONFIG.mensagemWhatsApp} de: ${s.titulo}.`).msg) },
      { rotulo: 'Voltar', classe: 'btn-sec', onClick: ui.fecharSheet },
    ],
  });
}

function abrirProjeto(p) {
  const botoes = [];
  if (p.link) botoes.push({ rotulo: 'Ver projeto', icone: 'link', classe: 'btn-principal', onClick: () => ui.toast(acoes.site(p.link).msg) });
  botoes.push({ rotulo: 'Quero um projeto assim', icone: 'conversa', classe: 'btn-principal btn-whats', onClick: () => ui.toast(acoes.whatsapp(`${CONFIG.mensagemWhatsApp} de um projeto parecido com "${p.titulo}".`).msg) });
  botoes.push({ rotulo: 'Voltar', classe: 'btn-sec', onClick: ui.fecharSheet });
  ui.abrirSheet({
    icone: iconeDoProjeto(p),
    cor: p.cor,
    titulo: p.titulo,
    subtitulo: p.tipo,
    corpo: `<p>${esc(p.descricao)}</p><div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>`,
    acoes: botoes,
    aoFechar: () => cena.pausarCarrossel(false),
  });
  cena.pausarCarrossel(true);
}

function trocarAba(nome) {
  ui.abaAtiva(nome);
  if (cena) cena.mostrarAba(nome);
  if (!rastreando) ui.toast('Aponte para o cartão para ver esta seção em 3D', 2000);
}

// ---------------------------------------------------------------- Eventos da interface
ui.$('btnIniciar').addEventListener('click', iniciar);
ui.$('erroTentar').addEventListener('click', () => window.location.reload());
ui.$('btnCompartilhar').addEventListener('click', async () => ui.toast((await acoes.compartilhar()).msg));
document.querySelectorAll('#abas button').forEach((b) => b.addEventListener('click', () => trocarAba(b.dataset.aba)));

// Acesso para testes no console (ex.: window.__cartaoRA.cena)
window.__cartaoRA = {
  get mindar() { return mindar; },
  get cena() { return cena; },
  get rastreando() { return rastreando; },
};
