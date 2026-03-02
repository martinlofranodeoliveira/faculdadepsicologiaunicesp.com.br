export type LegalSection = {
  title: string
  paragraphs: string[]
}

export type LegalContent = {
  pageTitle: string
  intro: string
  lastUpdatedLabel: string
  effectiveDate: string
  sections: LegalSection[]
}

export const privacyContent: LegalContent = {
  pageTitle: 'Politica de Privacidade',
  intro:
    'Este documento explica como tratamos dados pessoais de visitantes, candidatos e alunos em nossos canais digitais, em conformidade com a LGPD (Lei no 13.709/2018).',
  lastUpdatedLabel: 'Ultima revisao',
  effectiveDate: '15/01/2025',
  sections: [
    {
      title: '1. Escopo desta politica',
      paragraphs: [
        'Esta politica se aplica ao site da Faculdade de Psicologia UNICESP, formularios de captacao, paginas de campanhas e canais de atendimento vinculados a nossa instituicao.',
        'Ao navegar em nossos canais ou enviar seus dados, voce declara que leu e compreendeu as regras de tratamento descritas neste documento.',
      ],
    },
    {
      title: '2. Dados coletados',
      paragraphs: [
        'Podemos coletar dados informados diretamente por voce, como nome, e-mail, telefone, curso de interesse, cidade e outras informacoes enviadas em formularios.',
        'Tambem coletamos dados de navegacao e dispositivo, como endereco IP, tipo de navegador, sistema operacional, paginas acessadas e dados de origem de campanha.',
      ],
    },
    {
      title: '3. Finalidades do tratamento',
      paragraphs: [
        'Utilizamos os dados para responder solicitacoes, apresentar ofertas de cursos, conduzir etapas de pre-matricula e matricula, e melhorar a experiencia no site.',
        'Tambem tratamos dados para comunicacoes institucionais, analytics, seguranca da informacao e cumprimento de obrigacoes legais e regulatorias.',
      ],
    },
    {
      title: '4. Bases legais',
      paragraphs: [
        'Tratamos dados pessoais com fundamento em consentimento, execucao de procedimentos preliminares para contrato, cumprimento de obrigacao legal e legitimo interesse, conforme o caso.',
        'Nos casos em que o consentimento for a base legal aplicavel, ele sera solicitado de forma clara e podera ser revogado a qualquer momento.',
      ],
    },
    {
      title: '5. Compartilhamento de dados',
      paragraphs: [
        'Podemos compartilhar dados com operadores e fornecedores essenciais a operacao, como plataformas de CRM, atendimento, analytics e infraestrutura de tecnologia.',
        'O compartilhamento ocorre apenas para finalidades legitimas e sob obrigacoes contratuais de confidencialidade e seguranca. Nao comercializamos dados pessoais.',
      ],
    },
    {
      title: '6. Retencao e armazenamento',
      paragraphs: [
        'Os dados sao armazenados pelo prazo necessario para cumprir as finalidades informadas, respeitando exigencias legais, regulatorias e de defesa em processos administrativos ou judiciais.',
        'Quando aplicavel, os dados sao eliminados ou anonimizados ao termino do periodo de retencao.',
      ],
    },
    {
      title: '7. Cookies e tecnologias similares',
      paragraphs: [
        'Utilizamos cookies para funcionamento do site, personalizacao de experiencia, mensuracao de audiencia e avaliacao de desempenho de campanhas.',
        'Voce pode ajustar as permissoes de cookies em seu navegador, ciente de que determinadas funcionalidades podem ficar indisponiveis.',
      ],
    },
    {
      title: '8. Direitos do titular',
      paragraphs: [
        'Nos termos da LGPD, voce pode solicitar confirmacao de tratamento, acesso, correcao, anonimizacao, portabilidade, informacao sobre compartilhamento, revogacao de consentimento e eliminacao quando cabivel.',
        'As solicitacoes sao analisadas dentro dos prazos legais, observadas as excecoes previstas em lei.',
      ],
    },
    {
      title: '9. Seguranca da informacao',
      paragraphs: [
        'Mantemos controles tecnicos e administrativos para reduzir riscos de acesso nao autorizado, perda, alteracao ou divulgacao indevida de dados pessoais.',
        'Nenhum ambiente e totalmente imune a incidentes, mas adotamos medidas continuas de monitoramento e melhoria de seguranca.',
      ],
    },
    {
      title: '10. Contato',
      paragraphs: [
        'Para exercer seus direitos ou esclarecer duvidas sobre privacidade e protecao de dados, entre em contato pelo e-mail contato@faculdadepsicologiaunicesp.com.br.',
      ],
    },
  ],
}

export const termsContent: LegalContent = {
  pageTitle: 'Termos de Uso',
  intro:
    'Estes Termos de Uso definem as regras para navegacao e utilizacao dos canais digitais da Faculdade de Psicologia UNICESP.',
  lastUpdatedLabel: 'Ultima revisao',
  effectiveDate: '15/01/2025',
  sections: [
    {
      title: '1. Aceitacao dos termos',
      paragraphs: [
        'Ao acessar e utilizar este site, voce concorda com estes Termos de Uso e com a Politica de Privacidade vigente.',
        'Se nao concordar com algum ponto, recomendamos interromper a navegacao e entrar em contato por nossos canais oficiais.',
      ],
    },
    {
      title: '2. Finalidade do site',
      paragraphs: [
        'O site tem finalidade institucional e informativa, incluindo divulgacao de cursos, canais de atendimento e formularios de interesse academico.',
        'As informacoes publicadas nao substituem contrato educacional, edital, regulamento academico ou documentos oficiais de matricula.',
      ],
    },
    {
      title: '3. Uso permitido e proibicoes',
      paragraphs: [
        'Voce se compromete a utilizar o site apenas para fins licitos e de boa-fe, sem praticas que prejudiquem a seguranca, disponibilidade ou integridade dos servicos.',
        'E proibido tentar invadir, alterar, copiar em massa, distribuir conteudo sem autorizacao ou executar qualquer acao que gere dano tecnico ou reputacional.',
      ],
    },
    {
      title: '4. Propriedade intelectual',
      paragraphs: [
        'Todo o conteudo do site, incluindo textos, marcas, logotipos, imagens, layout e componentes visuais, pertence a Faculdade de Psicologia UNICESP ou a terceiros licenciantes.',
        'Nao e permitido reproduzir, distribuir, adaptar ou explorar economicamente esses materiais sem autorizacao previa e expressa.',
      ],
    },
    {
      title: '5. Informacoes de cursos e ofertas',
      paragraphs: [
        'Valores, descontos, prazos, carga horaria, grade curricular e calendario academico podem ser alterados sem aviso previo para adequacao institucional ou regulatoria.',
        'Para fins de contratacao, sempre prevalecem as condicoes formais vigentes no momento da matricula.',
      ],
    },
    {
      title: '6. Cadastro e veracidade de dados',
      paragraphs: [
        'Quando houver envio de dados em formularios, voce declara que as informacoes prestadas sao verdadeiras, atuais e de sua titularidade ou uso autorizado.',
        'Reservamo-nos o direito de desconsiderar solicitacoes com dados inconsistentes, incompletos ou suspeitos de fraude.',
      ],
    },
    {
      title: '7. Links de terceiros',
      paragraphs: [
        'O site pode conter links para servicos externos. Esses ambientes possuem termos e politicas proprios, fora do nosso controle.',
        'Nao nos responsabilizamos por conteudos, praticas ou disponibilidade de sites e plataformas de terceiros.',
      ],
    },
    {
      title: '8. Disponibilidade e alteracoes',
      paragraphs: [
        'Buscamos manter o site acessivel e atualizado, mas podem ocorrer indisponibilidades temporarias, manutencoes ou falhas tecnicas.',
        'Podemos modificar layout, funcionalidades, conteudos e estes Termos de Uso a qualquer momento, com publicacao da nova versao nesta pagina.',
      ],
    },
    {
      title: '9. Limitacao de responsabilidade',
      paragraphs: [
        'Nao garantimos ausencia total de erros materiais, interrupcoes ou indisponibilidades, embora atuemos para mitigar esses riscos.',
        'A responsabilidade da instituicao sera limitada aos termos da legislacao aplicavel, respeitadas as normas de defesa do consumidor quando cabiveis.',
      ],
    },
    {
      title: '10. Legislacao aplicavel e contato',
      paragraphs: [
        'Estes Termos sao regidos pela legislacao brasileira. Para duvidas, fale com nossa equipe em contato@faculdadepsicologiaunicesp.com.br.',
      ],
    },
  ],
}
