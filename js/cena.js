// Monta o conteúdo 3D que aparece "preso" ao cartão.
// Unidades: a largura do cartão vale 1; a altura vale 55/85 (cartão de visita padrão).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as TX from './texturas.js';

export const ALTURA_CARTAO = 55 / 85;

export const CONTATOS = [
  { id: 'whatsapp', rotulo: 'WhatsApp', icone: 'conversa', cor: '#22C55E' },
  { id: 'ligar', rotulo: 'Ligar', icone: 'telefone', cor: '#0EA5E9' },
  { id: 'email', rotulo: 'E-mail', icone: 'email', cor: '#F59E0B' },
  { id: 'instagram', rotulo: 'Instagram', icone: 'camera', cor: '#EC4899' },
  { id: 'site', rotulo: 'Site', icone: 'globo', cor: '#6366F1' },
  { id: 'salvar', rotulo: 'Salvar contato', icone: 'contato', cor: '#14B8A6' },
];

// ---------- curvas de animação ----------
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// ---------- forma do "G" (mesma geometria da arte do cartão) ----------
function formaG() {
  const R = 1, r = 0.62, yb = 0.15, a0 = THREE.MathUtils.degToRad(40), xbar = 0.08;
  const s = new THREE.Shape();
  s.moveTo(R * Math.cos(a0), R * Math.sin(a0));
  s.absarc(0, 0, R, a0, 2 * Math.PI + Math.asin(yb / R), false);
  s.lineTo(xbar, yb);
  s.lineTo(xbar, -yb);
  const angInf = -Math.asin(yb / r);
  s.lineTo(r * Math.cos(angInf), -yb);
  s.absarc(0, 0, r, angInf, a0 - 2 * Math.PI, true);
  s.lineTo(R * Math.cos(a0), R * Math.sin(a0));
  return s;
}

export function criarCena({ renderer, scene, config, aoTocar }) {
  TX.configurarTexturas(renderer);

  // Iluminação: ambiente "de estúdio" para o logo metálico
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const luz = new THREE.DirectionalLight(0xffffff, 1.2);
  luz.position.set(0.4, 1, 1.2);
  scene.add(luz);

  const raiz = new THREE.Group();
  raiz.visible = false;
  scene.add(raiz);

  const interativos = [];
  let visivel = false;
  let paisagem = false;
  let abaAtual = 'servicos';
  let carrosselPausado = false;

  // ---------- mini motor de animações ----------
  const tweens = new Set();
  function animar({ duracao = 400, atraso = 0, ease = easeOutCubic, aCada, fim, dono }) {
    if (dono) for (const t of tweens) if (t.dono === dono) tweens.delete(t);
    const tw = { inicio: performance.now() + atraso, duracao, ease, aCada, fim, dono };
    tweens.add(tw);
    return tw;
  }
  function cancelar(dono) { for (const t of tweens) if (t.dono === dono) tweens.delete(t); }
  function rodarTweens(agora) {
    for (const tw of [...tweens]) {
      const p = (agora - tw.inicio) / tw.duracao;
      if (p < 0) continue;
      const k = Math.min(1, p);
      tw.aCada(tw.ease(k));
      if (k >= 1) { tweens.delete(tw); if (tw.fim) tw.fim(); }
    }
  }
  function opacidade(obj, a) {
    obj.traverse((m) => { if (m.material && !Array.isArray(m.material)) m.material.opacity = (m.userData.opBase ?? 1) * a; });
  }

  function planoUI(textura, largura, altura, { aditivo = false, opBase = 1 } = {}) {
    const mat = new THREE.MeshBasicMaterial({
      map: textura, transparent: true, opacity: opBase, depthWrite: false,
      blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), mat);
    m.userData.opBase = opBase;
    return m;
  }

  function interativo(mesh, funcao) {
    mesh.userData.aoTocar = funcao;
    interativos.push(mesh);
    return mesh;
  }

  // ================================================================ Moldura holográfica
  const moldura = new THREE.Group();
  moldura.position.z = 0.003;
  raiz.add(moldura);
  const matBorda = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const matCanto = new THREE.MeshBasicMaterial({ color: 0x5eebff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
  const mw = 1.035, mh = ALTURA_CARTAO + 0.035, esp = 0.007;
  const bordas = [];
  for (const [w, h, x, y, eixo] of [[mw, esp, 0, mh / 2, 'x'], [mw, esp, 0, -mh / 2, 'x'], [esp, mh, -mw / 2, 0, 'y'], [esp, mh, mw / 2, 0, 'y']]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matBorda);
    b.position.set(x, y, 0);
    b.userData.eixo = eixo;
    moldura.add(b);
    bordas.push(b);
  }
  const cantos = [];
  const lc = 0.11, ec = 0.017;
  for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
    const g = new THREE.Group();
    g.position.set(sx * mw / 2, sy * mh / 2, 0.001);
    const hBar = new THREE.Mesh(new THREE.PlaneGeometry(lc, ec), matCanto);
    hBar.position.set(-sx * (lc / 2 - ec / 2), 0, 0);
    const vBar = new THREE.Mesh(new THREE.PlaneGeometry(ec, lc), matCanto);
    vBar.position.set(0, -sy * (lc / 2 - ec / 2), 0);
    g.add(hBar, vBar);
    moldura.add(g);
    cantos.push(g);
  }
  const varredura = planoUI(TX.texturaVarredura(), 1.0, 0.22, { aditivo: true });
  varredura.position.z = 0.006;
  varredura.visible = false;
  raiz.add(varredura);

  // ================================================================ Logo 3D + título
  const topo = new THREE.Group();
  raiz.add(topo);
  const logoPivo = new THREE.Group();
  topo.add(logoPivo);

  const geoG = new THREE.ExtrudeGeometry(formaG(), {
    depth: 0.34, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 64,
  });
  geoG.center();
  const matFrente = new THREE.MeshStandardMaterial({ color: 0x45e0ff, metalness: 0.55, roughness: 0.2, emissive: 0x0a5f80, emissiveIntensity: 0.45 });
  const matLado = new THREE.MeshStandardMaterial({ color: 0x2f5bff, metalness: 0.75, roughness: 0.28, emissive: 0x0b1e70, emissiveIntensity: 0.3 });
  const logo = new THREE.Mesh(geoG, [matFrente, matLado]);
  logo.scale.setScalar(0.13);
  logoPivo.add(logo);

  const brilho = planoUI(TX.texturaBrilho(), 0.58, 0.58, { aditivo: true, opBase: 0.7 });
  brilho.position.z = -0.08;
  logoPivo.add(brilho);

  const matAnel = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const aneis = [0.185, 0.21].map((raio, i) => {
    const pivo = new THREE.Group();
    pivo.rotation.x = i === 0 ? 1.2 : 1.35;
    pivo.rotation.y = i === 0 ? 0.35 : -0.45;
    const anel = new THREE.Mesh(new THREE.TorusGeometry(raio, 0.0045, 8, 128), matAnel);
    pivo.add(anel);
    logoPivo.add(pivo);
    return anel;
  });

  const texPart = TX.texturaParticula();
  const matPart = new THREE.MeshBasicMaterial({ map: texPart, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const geoPart = new THREE.PlaneGeometry(0.028, 0.028);
  const particulas = [];
  for (let i = 0; i < 22; i++) {
    const p = new THREE.Mesh(geoPart, matPart);
    const ang = Math.random() * Math.PI * 2, rad = 0.12 + Math.random() * 0.18;
    p.position.set(Math.cos(ang) * rad, -0.25 + Math.random() * 0.5, Math.sin(ang) * 0.12);
    p.userData.vel = 0.05 + Math.random() * 0.08;
    p.userData.base = 0.5 + Math.random() * 0.8;
    logoPivo.add(p);
    particulas.push(p);
  }

  const titulo = planoUI(TX.texturaTitulo(config.marca, config.slogan || config.empresa), 0.72, 0.162);
  topo.add(titulo);

  // ================================================================ Aba: Serviços
  const grupos = {};
  const gServ = new THREE.Group();
  gServ.userData.itens = [];
  config.servicos.slice(0, 4).forEach((s, i) => {
    const m = planoUI(TX.texturaServico(s), 0.48, 0.288);
    m.position.set((i % 2 - 0.5) * 0.505, (0.5 - Math.floor(i / 2)) * 0.315, 0);
    interativo(m, () => aoTocar({ tipo: 'servico', indice: i }));
    gServ.add(m);
    gServ.userData.itens.push(m);
  });
  gServ.userData.tamanho = { w: 0.985, h: 0.603 };
  grupos.servicos = gServ;

  // ================================================================ Aba: Portfólio
  const gPort = new THREE.Group();
  const itensPort = config.portfolio;
  const texPort = itensPort.map((it, i) => TX.texturaPortfolio(it, i, itensPort.length));
  let atual = 0;
  let ultimaTroca = performance.now();
  const painel = planoUI(texPort[0], 0.86, 0.611);
  painel.position.set(0, 0.075, 0);
  interativo(painel, () => aoTocar({ tipo: 'portfolio', indice: atual }));
  const setaEsq = planoUI(TX.texturaSeta('esquerda'), 0.12, 0.12);
  const setaDir = planoUI(TX.texturaSeta('direita'), 0.12, 0.12);
  setaEsq.position.set(-0.3, -0.32, 0.01);
  setaDir.position.set(0.3, -0.32, 0.01);
  interativo(setaEsq, () => irPara(atual - 1));
  interativo(setaDir, () => irPara(atual + 1));
  const canvasPontos = TX.canvasPontos();
  const texPontos = TX.paraTextura(canvasPontos);
  const pontos = planoUI(texPontos, 0.36, 0.036);
  pontos.position.set(0, -0.32, 0);
  function atualizarPontos() { TX.desenharPontos(canvasPontos, itensPort.length, atual); texPontos.needsUpdate = true; }
  atualizarPontos();
  gPort.add(painel, setaEsq, setaDir, pontos);
  gPort.userData.itens = [painel, setaEsq, setaDir, pontos];
  gPort.userData.tamanho = { w: 0.86, h: 0.761 };
  grupos.portfolio = gPort;

  // carrega imagens opcionais do portfólio (assets/portfolio/...)
  itensPort.forEach((it, i) => {
    if (!it.imagem) return;
    const img = new Image();
    img.onload = () => {
      texPort[i] = TX.texturaPortfolio(it, i, itensPort.length, img);
      if (i === atual) painel.material.map = texPort[i];
    };
    img.src = it.imagem;
  });

  function irPara(i) {
    const total = itensPort.length;
    const prox = ((i % total) + total) % total;
    ultimaTroca = performance.now();
    if (prox === atual) return;
    animar({
      dono: 'flip', duracao: 130, ease: easeInCubic,
      aCada: (k) => { painel.scale.x = Math.max(0.02, 1 - k); },
      fim: () => {
        atual = prox;
        painel.material.map = texPort[atual];
        atualizarPontos();
        animar({ dono: 'flip', duracao: 260, ease: easeOutBack, aCada: (k) => { painel.scale.x = Math.max(0.02, k); } });
      },
    });
  }

  // ================================================================ Aba: Contato
  const gCont = new THREE.Group();
  gCont.userData.itens = [];
  CONTATOS.forEach((c, i) => {
    const m = planoUI(TX.texturaBotao(c.rotulo, c.icone, c.cor), 0.27, 0.306);
    m.position.set((i % 3 - 1) * 0.32, (0.5 - Math.floor(i / 3)) * 0.33, 0);
    interativo(m, () => aoTocar({ tipo: 'contato', id: c.id }));
    gCont.add(m);
    gCont.userData.itens.push(m);
  });
  gCont.userData.tamanho = { w: 0.91, h: 0.64 };
  grupos.contato = gCont;

  // cada aba fica dentro de um "suporte" que cuida da posição/escala do layout;
  // o grupo interno fica livre para as animações
  for (const [nome, g] of Object.entries(grupos)) {
    g.visible = nome === abaAtual;
    const suporte = new THREE.Group();
    suporte.add(g);
    g.userData.suporte = suporte;
    raiz.add(suporte);
  }

  // ================================================================ Layout (retrato x paisagem)
  function layout(ehPaisagem) {
    paisagem = ehPaisagem;
    const yTitulo = ALTURA_CARTAO / 2 + 0.045 + 0.081;
    titulo.position.set(0, yTitulo, 0.02);
    if (paisagem) logoPivo.position.set(-0.78, 0, 0.1);
    else logoPivo.position.set(0, yTitulo + 0.081 + 0.19, 0.1);
    for (const g of Object.values(grupos)) {
      const { w, h } = g.userData.tamanho;
      const suporte = g.userData.suporte;
      const esc = paisagem ? 0.82 : 1; // na horizontal o conteúdo vai para a direita, um pouco menor
      suporte.scale.setScalar(esc);
      if (paisagem) suporte.position.set(0.5 + 0.07 + (w * esc) / 2, 0, 0.012);
      else suporte.position.set(0, -ALTURA_CARTAO / 2 - 0.07 - h / 2, 0.012);
    }
  }
  layout(false);

  // ================================================================ Animações de entrada/saída
  function popItens(grupo, atrasoBase = 0) {
    grupo.userData.itens.forEach((item, i) => {
      item.scale.setScalar(0.001);
      opacidade(item, 0);
      animar({
        dono: item.uuid, atraso: atrasoBase + i * 70, duracao: 420, ease: easeOutBack,
        aCada: (k) => { item.scale.setScalar(Math.max(0.001, k)); opacidade(item, Math.min(1, k * 1.5)); },
      });
    });
  }

  let introTerminou = false;
  function entrar() {
    visivel = true;
    raiz.visible = true;
    introTerminou = false;
    // moldura se desenhando
    matBorda.opacity = 1;
    bordas.forEach((b) => b.scale.set(b.userData.eixo === 'x' ? 0.001 : 1, b.userData.eixo === 'y' ? 0.001 : 1, 1));
    animar({ dono: 'bordas', duracao: 420, aCada: (k) => bordas.forEach((b) => { if (b.userData.eixo === 'x') b.scale.x = Math.max(0.001, k); else b.scale.y = Math.max(0.001, k); }) });
    cantos.forEach((c, i) => {
      c.scale.setScalar(0.001);
      animar({ dono: c.uuid, atraso: i * 50, duracao: 420, ease: easeOutBack, aCada: (k) => c.scale.setScalar(Math.max(0.001, k)) });
    });
    animar({ dono: 'bordasFade', atraso: 1100, duracao: 700, aCada: (k) => { matBorda.opacity = 1 - 0.65 * k; }, fim: () => { introTerminou = true; } });
    // varredura
    varredura.visible = true;
    animar({
      dono: 'varredura', duracao: 900, ease: easeInOut,
      aCada: (k) => { varredura.position.y = mh / 2 - k * mh; opacidade(varredura, k < 0.8 ? 1 : (1 - k) / 0.2); },
      fim: () => { varredura.visible = false; },
    });
    // logo e título
    logoPivo.scale.setScalar(0.001);
    animar({ dono: 'logo', atraso: 150, duracao: 700, ease: easeOutBack, aCada: (k) => logoPivo.scale.setScalar(Math.max(0.001, k)) });
    titulo.scale.setScalar(0.6);
    opacidade(titulo, 0);
    animar({ dono: 'titulo', atraso: 250, duracao: 380, aCada: (k) => { titulo.scale.setScalar(0.6 + 0.4 * k); opacidade(titulo, k); } });
    // aba atual
    for (const [nome, g] of Object.entries(grupos)) g.visible = nome === abaAtual;
    popItens(grupos[abaAtual], 380);
    ultimaTroca = performance.now();
  }

  function sair() {
    visivel = false;
    raiz.visible = false;
  }

  function mostrarAba(nome) {
    if (!grupos[nome] || nome === abaAtual) return;
    const antiga = grupos[abaAtual];
    const nova = grupos[nome];
    abaAtual = nome;
    cancelar('saida-' + nome);
    nova.scale.setScalar(1);
    opacidade(nova, 1);
    nova.visible = true;
    if (antiga.visible) {
      const chave = 'saida-' + Object.keys(grupos).find((k) => grupos[k] === antiga);
      animar({
        dono: chave, duracao: 160,
        aCada: (k) => { opacidade(antiga, 1 - k); antiga.scale.setScalar(1 - 0.08 * k); },
        fim: () => { antiga.visible = false; antiga.scale.setScalar(1); opacidade(antiga, 1); },
      });
    }
    if (visivel) popItens(nova, 90);
    if (nome === 'portfolio') ultimaTroca = performance.now();
  }

  function pulsar(m) {
    const base = m === painel ? painel.scale.y : 1;
    animar({
      dono: m.uuid + ':pulso', duracao: 240, ease: (t) => t,
      aCada: (k) => { const s = base * (1 - 0.1 * Math.sin(Math.PI * k)); m.scale.y = s; if (m !== painel) m.scale.x = s; },
    });
  }

  // ================================================================ Toque (raycasting)
  const raycaster = new THREE.Raycaster();
  const estaVisivel = (o) => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
  function tocar(ndc, camera) {
    if (!visivel) return false;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(interativos.filter(estaVisivel), false);
    if (!hits.length) return false;
    const alvo = hits[0].object;
    pulsar(alvo);
    alvo.userData.aoTocar();
    return true;
  }

  // ================================================================ Loop
  function atualizar(agora, dt) {
    rodarTweens(agora);
    if (!visivel) return;
    const t = agora / 1000;
    logo.rotation.y = Math.sin(t * 0.9) * 0.55;
    logo.position.z = Math.sin(t * 1.7) * 0.015;
    aneis[0].rotation.z += dt * 0.0011;
    aneis[1].rotation.z -= dt * 0.0007;
    brilho.material.opacity = 0.55 + 0.15 * Math.sin(t * 2.2);
    for (const p of particulas) {
      p.position.y += p.userData.vel * dt / 1000;
      if (p.position.y > 0.3) p.position.y = -0.25;
      const vida = (p.position.y + 0.25) / 0.55;
      p.scale.setScalar(Math.max(0.001, Math.sin(Math.PI * vida) * p.userData.base));
    }
    if (introTerminou) matCanto.opacity = 0.7 + 0.3 * Math.sin(t * 3);
    if (abaAtual === 'portfolio' && !carrosselPausado && agora - ultimaTroca > (config.ar?.tempoTroca || 5000)) irPara(atual + 1);
  }

  return {
    raiz,
    entrar,
    sair,
    atualizar,
    mostrarAba,
    tocar,
    layout,
    pausarCarrossel: (v) => { carrosselPausado = v; ultimaTroca = performance.now(); },
    interativos,
    get visivel() { return visivel; },
    get abaAtual() { return abaAtual; },
    get portfolioAtual() { return atual; },
  };
}
