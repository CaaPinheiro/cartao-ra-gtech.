// Ações dos botões: WhatsApp, ligação, e-mail, Instagram, site, salvar contato e compartilhar.
// Cada função devolve { ok: true, msg } ou { ok: false, msg } para o app mostrar um aviso.

const soDigitos = (s) => String(s || '').replace(/\D/g, '');

function abrir(url) {
  // window.open dentro do toque do usuário não é bloqueado; se for, abre na mesma aba
  const w = window.open(url, '_blank');
  if (w) w.opener = null;
  else window.location.href = url;
}

function faltando(campo) {
  return { ok: false, msg: `Preencha "${campo}" no arquivo config.js` };
}

export function criarAcoes(config) {
  const tel = soDigitos(config.whatsapp);

  function whatsapp(texto = config.mensagemWhatsApp) {
    if (!tel) return faltando('whatsapp');
    abrir(`https://wa.me/${tel}?text=${encodeURIComponent(texto || '')}`);
    return { ok: true, msg: 'Abrindo o WhatsApp…' };
  }

  function ligar() {
    if (!tel) return faltando('whatsapp');
    window.location.href = `tel:+${tel}`;
    return { ok: true, msg: 'Abrindo o discador…' };
  }

  function email() {
    if (!config.email) return faltando('email');
    const assunto = encodeURIComponent(`Orçamento – ${config.marca}`);
    const corpo = encodeURIComponent(`${config.mensagemWhatsApp || 'Olá!'}.\n\n`);
    window.location.href = `mailto:${config.email}?subject=${assunto}&body=${corpo}`;
    return { ok: true, msg: 'Abrindo o e-mail…' };
  }

  function instagram() {
    const user = String(config.instagram || '').replace(/^@/, '').trim();
    if (!user) return faltando('instagram');
    abrir(`https://instagram.com/${encodeURIComponent(user)}`);
    return { ok: true, msg: 'Abrindo o Instagram…' };
  }

  function site(url = config.site) {
    if (!url) return faltando('site');
    abrir(url);
    return { ok: true, msg: 'Abrindo o site…' };
  }

  function vcard() {
    const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
    const linhas = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${esc(config.sobrenome)};${esc(config.primeiroNome)};;;`,
      `FN:${esc(config.nome)}`,
      `ORG:${esc(config.marca)} - ${esc(config.empresa)}`,
      `TITLE:${esc(config.cargo)}`,
    ];
    if (tel) linhas.push(`TEL;TYPE=CELL:+${tel}`);
    if (config.email) linhas.push(`EMAIL;TYPE=INTERNET:${config.email}`);
    if (config.site) linhas.push(`URL:${config.site}`);
    if (config.instagram) linhas.push(`X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${String(config.instagram).replace(/^@/, '')}`);
    linhas.push(`ADR;TYPE=WORK:;;;${esc(config.cidade)};${esc(config.estado)};;Brasil`);
    linhas.push(`NOTE:${esc(config.servicos.map((s) => s.titulo).join(', '))}`);
    linhas.push('END:VCARD');
    return linhas.join('\r\n');
  }

  function salvarContato() {
    const nomeArquivo = `${config.marca}-${String(config.primeiroNome || 'contato').split(' ')[0]}.vcf`;
    const blob = new Blob([vcard()], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { ok: true, msg: 'Contato baixado! Abra o arquivo para adicioná-lo aos contatos.' };
  }

  async function compartilhar() {
    const dados = { title: `${config.marca} · Cartão em RA`, text: `Conheça a ${config.marca}: ${config.slogan}`, url: window.location.href.split('#')[0] };
    try {
      if (navigator.share) { await navigator.share(dados); return { ok: true, msg: '' }; }
      await navigator.clipboard.writeText(dados.url);
      return { ok: true, msg: 'Link copiado!' };
    } catch (e) {
      if (e && e.name === 'AbortError') return { ok: true, msg: '' };
      return { ok: false, msg: 'Não foi possível compartilhar agora.' };
    }
  }

  function contato(id) {
    switch (id) {
      case 'whatsapp': return whatsapp();
      case 'ligar': return ligar();
      case 'email': return email();
      case 'instagram': return instagram();
      case 'site': return site();
      case 'salvar': return salvarContato();
      default: return { ok: false, msg: 'Ação desconhecida.' };
    }
  }

  return { whatsapp, ligar, email, instagram, site, salvarContato, compartilhar, contato, vcard };
}
