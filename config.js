/* =====================================================================
   CONFIGURAÇÃO DO CARTÃO DE VISITA EM RA — GTech
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para personalizar o app.
   Depois de salvar, recarregue a página (ou publique de novo no GitHub).
   Campos vazios ('') continuam aparecendo no app, mas mostram um aviso
   pedindo para você preenchê-los aqui.
   ===================================================================== */

export const CONFIG = {
  // ----- Identidade -----
  marca: 'GTech',
  empresa: 'Gomes Technology Solutions',
  slogan: 'Soluções digitais para o seu negócio',
  nome: 'Carlos Alberto Gomes Pinheiro',
  primeiroNome: 'Carlos Alberto',   // usado no contato salvo no celular (vCard)
  sobrenome: 'Gomes Pinheiro',
  cargo: 'Desenvolvedor Web & DevOps',
  cidade: 'Barcarena',
  estado: 'PA',

  // ----- Contatos (PREENCHA) -----
  whatsapp: '5591985789869',        // só números com DDI + DDD. Ex.: '5591987654321'
  email: 'gomestechsolutions@gmail.com',
  instagram: 'carlosalbgomes_',       // sem @. Ex.: 'gtech.solutions'
  site: '',            // endereço completo. Ex.: 'https://seusite.com.br'

  // Mensagem que já vem escrita quando a pessoa toca em "Pedir orçamento"
  mensagemWhatsApp: 'Olá, Carlos! Vi seu cartão em Realidade Aumentada e quero um orçamento',

  // ----- Serviços (aba "Serviços") -----
  // icone: monitor | carrinho | predio | servidor
  servicos: [
    {
      icone: 'monitor',
      titulo: 'Sites Profissionais',
      resumo: 'Rápidos, responsivos e prontos para o Google',
      descricao: 'Sites institucionais e landing pages que funcionam bem no celular, carregam rápido e ajudam seu cliente a encontrar você.',
      itens: ['Design responsivo (celular, tablet e PC)', 'Otimização para Google (SEO)', 'Botão de WhatsApp e formulários', 'Domínio, hospedagem e e-mail profissional'],
    },
    {
      icone: 'carrinho',
      titulo: 'Lojas Virtuais',
      resumo: 'WooCommerce com Pix, cartão e frete',
      descricao: 'Sua loja online completa, com catálogo, carrinho e pagamentos, pronta para vender 24 horas por dia.',
      itens: ['Catálogo com fotos e variações', 'Pagamento por Pix, cartão e boleto', 'Cálculo de frete e cupons', 'Treinamento para você gerenciar os pedidos'],
    },
    {
      icone: 'predio',
      titulo: 'Sistemas de Gestão',
      resumo: 'Para prefeituras, secretarias e empresas',
      descricao: 'Sistemas web sob medida que tiram processos do papel: cadastros, controle, relatórios e prestação de contas.',
      itens: ['Cadastros e controle de processos', 'Relatórios e comprovantes', 'Login seguro por perfil de acesso', 'Java / Spring Boot e bancos SQL'],
    },
    {
      icone: 'servidor',
      titulo: 'Servidores & DevOps',
      resumo: 'Linux, hospedagem, deploy e backups',
      descricao: 'Configuração e manutenção de servidores Linux para seus sites e sistemas ficarem no ar com segurança.',
      itens: ['Servidores Linux e VPS', 'Certificado HTTPS e segurança', 'Deploy automatizado', 'Backups e monitoramento'],
    },
  ],

  // ----- Portfólio (aba "Portfólio") — revise os textos e complete os links -----
  // imagem: opcional, coloque um print em assets/portfolio/ e escreva o caminho. Ex.: 'assets/portfolio/haru.jpg'
  // link: opcional. Se tiver, aparece o botão "Ver projeto".
  portfolio: [
    {
      titulo: 'Empório Haru Haru',
      tipo: 'Loja virtual · WooCommerce',
      descricao: 'Loja de produtos asiáticos importados com identidade visual inspirada nas flores de cerejeira.',
      tags: ['WooCommerce', 'WordPress', 'Identidade visual'],
      cor: '#F472B6', imagem: '', link: '',
    },
    {
      titulo: 'Trambioca Logísticas',
      tipo: 'Site institucional',
      descricao: 'Agência marítima que atua nos portos de Vila do Conde e Belém.',
      tags: ['Site institucional', 'Responsivo'],
      cor: '#0EA5E9', imagem: '', link: 'https://trambiocalogisticas.com',
    },
    {
      titulo: 'Amplitude Telecom',
      tipo: 'Site para provedor de internet',
      descricao: 'Site institucional para provedor de internet da região.',
      tags: ['Site institucional', 'Responsivo'],
      cor: '#8B5CF6', imagem: '', link: '',
    },
    {
      titulo: 'Excelência Higienização',
      tipo: 'Site institucional',
      descricao: 'Site institucional para empresa de serviços de higienização.',
      tags: ['Site institucional', 'Responsivo'],
      cor: '#10B981', imagem: '', link: '',
    },
    {
      titulo: 'Integra PMAA',
      tipo: 'Sistema web de gestão pública',
      descricao: 'Gestão do Programa Municipal de Aquisição de Alimentos de Barcarena: entregas, comprovantes, pagamentos mensais e equipe.',
      tags: ['Java 17', 'Spring Boot', 'JWT'],
      cor: '#F59E0B', imagem: '', link: '',
    },
    {
      titulo: 'Sistema MROSC',
      tipo: 'Parcerias públicas · Lei 13.019/2014',
      descricao: 'Chamamentos públicos, formalização de parcerias, execução financeira, monitoramento e prestação de contas.',
      tags: ['Java', 'Spring Boot', 'Thymeleaf'],
      cor: '#22D3EE', imagem: '', link: '',
    },
  ],

  // ----- Ajustes da Realidade Aumentada (normalmente não precisa mexer) -----
  ar: {
    alvo: './assets/targets.mind',   // arquivo gerado em ferramentas/compilar.html
    suavizacao: 110,                 // em ms. Maior = mais estável, porém com mais atraso. 0 = desliga
    tempoTroca: 5000,                // portfólio: tempo para passar para o próximo projeto (ms)
    telaCheia: true,                 // entra em tela cheia ao tocar em "Iniciar" (melhor para gravar)
    filterMinCF: 0.001,              // filtro interno do MindAR (padrão da biblioteca)
    filterBeta: 1000,
    warmupTolerance: 5,
    missTolerance: 5,
  },
};
