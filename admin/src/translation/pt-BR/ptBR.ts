const dictionary = {
  

  projectName: 'Projeto',

  shared: {
    showArchived: 'Mostrar Arquivados?',
    archive: 'Arquivar',
    restore: 'Restaurar',
    archived: 'Arquivado',
    yes: 'Sim',
    no: 'Não',
    cancel: 'Cancelar',
    save: 'Salvar',
    clear: 'Limpar',
    decline: 'Recusar',
    accept: 'Aceitar',
    dashboard: 'Painel',
    new: 'Novo',
    searchNotFound: 'Nada encontrado.',
    searchPlaceholder: 'Pesquisar...',
    selectPlaceholder: 'Escolher uma opção',
    datePlaceholder: 'Escolha uma data',
    timePlaceholder: 'Escolha um horário',
    dateFormat: 'DD MMM, YYYY',
    timeFormat: 'hh:mmA',
    datetimeFormat: 'DD MMM, YYYY hh:mmA',
    tagsPlaceholder: 'Digite e aperte enter para adicionar',
    edit: 'Editar',
    delete: 'Excluir',
    openMenu: 'Abrir menu',
    submit: 'Enviar',
    search: 'Pesquisar',
    reset: 'Redefinir',
    min: 'Mín',
    max: 'Máx',
    view: 'Visualizar',
    copiedToClipboard: 'Copiado para a área de transferência',
    exportToCsv: 'Exportar para CSV',
    import: 'Importar',
    pause: 'Pausar',
    discard: 'Descartar',
    preferences: 'Preferências',
    session: 'Sessão',
    deleted: 'Excluído',
    remove: 'Remover',
    startDate: 'Data de Início',
    endDate: 'Data de Término',

    unsavedChanges: {
      message: 'Você tem alterações não salvas.',
      proceed: 'Descartar',
      dismiss: 'Cancelar',
      saveChanges: 'Salvar alterações',
    },

    importer: {
      importHashAlreadyExists: 'Dados já foram importados',
      title: 'Importar arquivo CSV',
      menu: 'Importar arquivo CSV',
      line: 'Linha',
      status: 'Status',
      pending: 'Pendente',
      success: 'Importado',
      error: 'Erro',
      total: `{0} importados, {1} pendentes e {2} com erro`,
      importedMessage: `Processado {0} de {1}.`,
      noValidRows: 'Não há linhas válidas.',
      noNavigateAwayMessage:
        'Não saia desta página ou a importação será interrompida.',
      completed: {
        success:
          'Importação concluída. Todas as linhas foram importadas com sucesso.',
        someErrors:
          'Processamento concluído, mas algumas linhas não puderam ser importadas.',
        allErrors: 'Falha na importação. Não há linhas válidas.',
      },
      form: {
        downloadTemplate: 'Baixar modelo',
      },
      list: {
        newConfirm: 'Tem certeza?',
        discardConfirm: 'Tem certeza? Dados não importados serão perdidos.',
      },
      errors: {
        invalidFileEmpty: 'O arquivo está vazio',
        invalidFileCsv: 'Somente arquivos CSV (.csv) são permitidos',
        invalidFileUpload:
          'Arquivo inválido. Certifique-se de usar a última versão do modelo.',
        importHashRequired: 'Hash de importação é obrigatório',
        importHashExistent: 'Dados já foram importados',
      },
    },

    dataTable: {
      filters: 'Filtros',
      noResults: 'Nenhum resultado encontrado.',
      viewOptions: 'Visualizar',
      toggleColumns: 'Alternar colunas',
      actions: 'Ações',

      sortAscending: 'Asc',
      sortDescending: 'Desc',
      hide: 'Ocultar',

      selectAll: 'Selecionar tudo',
      selectRow: 'Selecionar linha',
      paginationTotal: 'Total: {0} linha(s)',
      paginationSelected: '{0} linha(s) selecionada(s)',
      paginationRowsPerPage: 'Linhas por página',
      paginationCurrent: `Página {0} de {1}`,
      paginationGoToFirst: 'Ir para a primeira página',
      paginationGoToPrevious: 'Ir para a página anterior',
      paginationGoToNext: 'Ir para a próxima página',
      paginationGoToLast: 'Ir para a última página',
    },

    locales: {
      en: 'Inglês',
      es: 'Espanhol',
      de: 'Alemão',
      'pt-BR': 'Português (Brasil)',
    },

    localeSwitcher: {
      searchPlaceholder: 'Procurar idioma...',
      title: 'Idioma',
      placeholder: 'Selecionar um idioma',
      searchEmpty: 'Nenhum idioma encontrado.',
    },

    theme: {
      toggle: 'Tema',
      light: 'Claro',
      dark: 'Escuro',
      system: 'Sistema',
    },

    errors: {
      cannotDeleteReferenced: `Não é possível excluir {0} porque está referenciado por um ou mais {1}.`,
      timezone: 'Fuso horário inválido',
      required: `{0} é um campo obrigatório`,
      invalid: `{0} é inválido`,
      dateFuture: `{0} deve estar no futuro`,
      unknown: 'Ocorreu um erro',
      unique: 'O {0} deve ser único',
    },
  },

  apiKey: {
    docs: {
      menu: 'Documentação da API',
    },
    form: {
      addAll: 'Adicionar Tudo',
    },
    edit: {
      menu: 'Editar Chave da API',
      title: 'Editar Chave da API',
      success: 'Chave da API atualizada com sucesso',
    },
    new: {
      menu: 'Nova Chave da API',
      title: 'Nova Chave da API',
      success: 'Chave da API criada com sucesso',
      text: `Salve sua chave da API! Por razões de segurança, você só poderá vê-la uma vez.`,
      subtext: `Você deve adicioná-la ao cabeçalho Authorization das suas chamadas de API.`,
      backToApiKeys: 'Voltar para Chaves da API',
    },
    list: {
      menu: 'Chaves da API',
      title: 'Chaves da API',
      viewActivity: 'Ver Atividade',
      noResults: 'Nenhuma chave da API encontrada.',
    },
    destroy: {
      confirmTitle: 'Excluir Chave da API?',
      success: 'Chave da API excluída com sucesso',
    },
    enumerators: {
      status: {
        active: 'Ativo',
        disabled: 'Desativado',
        expired: 'Expirado',
      },
    },
    fields: {
      apiKey: 'Chave da API',
      membership: 'Usuário',
      name: 'Nome',
      keyPrefix: 'Prefixo da Chave',
      key: 'Chave',
      scopes: 'Escopos',
      expiresAt: 'Expira Em',
      status: 'Status',
      createdAt: 'Criado Em',
      disabled: 'Desativado',
    },
    disabledTooltip: `Desativado em {0}.`,
    errors: {
      invalidScopes: 'escopos devem corresponder ao papel do usuário',
    },
  },

  file: {
    button: 'Enviar',
    delete: 'Excluir',
    errors: {
      formats: `Formato inválido. Deve ser um dos seguintes: {0}.`,
      notImage: `O arquivo deve ser uma imagem`,
      tooBig: `O arquivo é muito grande. O tamanho atual é {0} bytes, o tamanho máximo é {1} bytes`,
    },
  },

  auth: {
    signIn: {
      oauthError: 'Não é possível entrar com esse provedor. Use outro.',
      title: 'Entrar',
      button: 'Entrar com Email',
      success: 'Entrou com sucesso',
      email: 'Email',
      password: 'Senha',
      socialHeader: 'Ou continue com',
      facebook: 'Facebook',
      github: 'GitHub',
      google: 'Google',
      passwordResetRequestLink: 'Esqueceu a senha?',
      signUpLink: 'Não tem uma conta? Crie uma',
    },
    signUp: {
      title: 'Cadastrar',
      signInLink: 'Já tem uma conta? Entre',
      button: 'Cadastrar',
      success: 'Cadastro realizado com sucesso',
      email: 'Email',
      password: 'Senha',
    },
    verifyEmailRequest: {
      title: 'Reenviar verificação de email',
      button: 'Reenviar verificação de email',
      message:
        'Por favor, confirme seu email em <strong>{0}</strong> para continuar.',
      success: 'Verificação de email enviada com sucesso!',
    },
    verifyEmailConfirm: {
      title: 'Verifique seu email',
      success: 'Email verificado com sucesso.',
      loadingMessage: 'Só um momento, seu email está sendo verificado...',
    },
    passwordResetRequest: {
      title: 'Esqueceu a Senha',
      signInLink: 'Cancelar',
      button: 'Enviar email para redefinir senha',
      email: 'Email',
      success: 'Email para redefinição de senha enviado com sucesso',
    },
    passwordResetConfirm: {
      title: 'Redefinir Senha',
      signInLink: 'Cancelar',
      button: 'Redefinir Senha',
      password: 'Senha',
      success: 'Senha alterada com sucesso',
    },
    noPermissions: {
      title: 'Aguardando Permissões',
      message:
        'Você ainda não tem permissões. Aguarde o administrador concedê-las.',
    },
    invitation: {
      title: 'Convites',
      success: 'Convite aceito com sucesso',
      acceptWrongEmail: 'Aceitar Convite Com Este Email',
      loadingMessage: 'Só um momento, estamos aceitando o convite...',
      invalidToken: 'Token de convite expirado ou inválido.',
    },
    tenant: {
      title: 'Espaços de Trabalho',
      create: {
        name: 'Nome do Espaço de Trabalho',
        success: 'Espaço de Trabalho criado com sucesso',
        button: 'Criar Espaço de Trabalho',
      },
      select: {
        tenant: 'Selecionar um Espaço de Trabalho',
        joinSuccess: 'Entrou com sucesso no espaço de trabalho',
        select: 'Selecionar Espaço de Trabalho',
        acceptInvitation: 'Aceitar Convite',
      },
    },
    passwordChange: {
      title: 'Alterar Senha',
      subtitle: 'Forneça sua senha antiga e nova.',
      menu: 'Alterar Senha',
      oldPassword: 'Senha Antiga',
      newPassword: 'Nova Senha',
      newPasswordConfirmation: 'Confirmação da Nova Senha',
      button: 'Salvar Senha',
      success: 'Senha alterada com sucesso',
      mustMatch: 'As senhas devem coincidir',
      cancel: 'Cancelar',
    },
    profile: {
      title: 'Perfil',
      subtitle:
        'Seu perfil será compartilhado com outros usuários no seu espaço de trabalho.',
      menu: 'Perfil',
      firstName: 'Primeiro Nome',
      lastName: 'Sobrenome',
      avatars: 'Avatar',
      button: 'Salvar Perfil',
      success: 'Perfil salvo com sucesso',
      cancel: 'Cancelar',
    },
    profileOnboard: {
      title: 'Perfil',
      firstName: 'Primeiro Nome',
      lastName: 'Sobrenome',
      avatars: 'Avatar',
      button: 'Salvar Perfil',
      success: 'Perfil salvo com sucesso',
    },
    signOut: {
      menu: 'Sair',
      button: 'Sair',
      title: 'Sair',
      loading: 'Você está sendo desconectado...',
    },
    errors: {
      invalidApiKey: 'Chave de API inválida ou expirada',
      emailNotFound: 'Email não encontrado',
      userNotFound: 'Desculpe, não reconhecemos suas credenciais',
      wrongPassword: 'Desculpe, não reconhecemos suas credenciais',
      weakPassword: 'Esta senha é muito fraca',
      emailAlreadyInUse: 'Email já está em uso',
      invalidPasswordResetToken:
        'Link para redefinir senha é inválido ou expirou',
      invalidVerifyEmailToken:
        'Link para verificar email é inválido ou expirou',
      wrongOldPassword: 'A senha antiga está errada',
    },
  },

  tenant: {
    switcher: {
      title: 'Espaços de Trabalho',
      placeholder: 'Selecione um Espaço de Trabalho',
      searchPlaceholder: 'Pesquisar espaço de trabalho...',
      searchEmpty: 'Nenhum espaço de trabalho encontrado.',
      create: 'Criar Espaço de Trabalho',
    },

    invite: {
      title: `Aceitar Convite para {0}`,
      message: `Você foi convidado para {0}. Você pode escolher aceitar ou recusar.`,
    },

    form: {
      name: 'Nome',

      new: {
        title: 'Criar Espaço de Trabalho',
        success: 'Espaço de Trabalho criado com sucesso',
      },

      edit: {
        title: 'Configurações do Espaço de Trabalho',
        success: 'Espaço de Trabalho atualizado com sucesso',
      },
    },

    destroy: {
      success: 'Espaço de Trabalho excluído com sucesso',
      confirmTitle: 'Deletar Espaço de Trabalho?',
      confirmDescription:
        'Tem certeza de que deseja excluir o espaço de trabalho {0}? Esta ação é irreversível!',
    },
  },

  membership: {
    dashboardCard: {
      title: 'Usuários',
    },

    showActivity: 'Atividade',

    view: {
      title: 'Ver Usuário',
    },

    list: {
      menu: 'Usuários',
      title: 'Usuários',
      noResults: 'Nenhum usuário encontrado.',
    },

    export: {
      success: 'Usuários exportados com sucesso',
    },

    edit: {
      menu: 'Editar Usuário',
      title: 'Editar Usuário',
      success: 'Usuário atualizado com sucesso',
    },

    new: {
      menu: 'Novo Usuário',
      title: 'Novo Usuário',
      success: 'Usuário criado com sucesso',
    },

    destroyMany: {
      success: 'Usuário(s) deletado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um usuário para deletar.',
      confirmTitle: 'Deletar Usuário(s)?',
      confirmDescription:
        'Tem certeza de que deseja deletar os {0} usuários selecionados?',
    },

    destroy: {
      success: 'Usuário deletado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um usuário para deletar.',
      confirmTitle: 'Deletar Usuário?',
    },

    resendInvitationEmail: {
      button: 'Reenviar Email de Convite',
      success: 'Email de convite reenviado com sucesso',
    },

    fields: {
      avatars: 'Avatar',
      fullName: 'Nome Completo',
      firstName: 'Primeiro Nome',
      lastName: 'Sobrenome',
      email: 'Email',
      roles: 'Funções',
      status: 'Status',
    },

    enumerators: {
      roles: {
        admin: 'Admin',
        custom: 'Custom',
      },

      status: {
        invited: 'Convidado',
        active: 'Ativo',
        disabled: 'Desativado',
      },
    },

    errors: {
      cannotRemoveSelfAdminRole:
        'Você não pode remover seu próprio papel de admin',
      cannotDeleteSelf: 'Você não pode remover sua própria associação',
      notInvited: 'Você não está convidado',
      invalidStatus: `Status inválido: {0}`,
      alreadyMember: `{0} já é um membro`,
      notSameEmail: `Este convite foi enviado para {0}, mas você está logado como {1}. Deseja continuar?`,
    },
  },

  subscription: {
    menu: 'Assinatura',
    title: 'Planos e Preços',
    current: 'Plano Atual',

    subscribe: 'Assinar',
    manage: 'Gerenciar',
    notPlanUser: 'Você não é o gerente desta assinatura.',
    cancelAtPeriodEnd: 'Este plano será cancelado no final do período.',

    plans: {
      free: {
        title: 'Grátis',
        price: 'R$0',
        pricingPeriod: '/mês',
        features: {
          first: 'Primeira descrição do recurso',
          second: 'Segunda descrição do recurso',
          third: 'Terceira descrição do recurso',
        },
      },
      basic: {
        title: 'Básico',
        price: 'R$10',
        pricingPeriod: '/mês',
        features: {
          first: 'Primeira descrição do recurso',
          second: 'Segunda descrição do recurso',
          third: 'Terceira descrição do recurso',
        },
      },
      enterprise: {
        title: 'Empresarial',
        price: 'R$50',
        pricingPeriod: '/mês',
        features: {
          first: 'Primeira descrição do recurso',
          second: 'Segunda descrição do recurso',
          third: 'Terceira descrição do recurso',
        },
      },
    },

    errors: {
      disabled: 'As assinaturas estão desativadas nesta plataforma',
      alreadyExistsActive: 'Já existe uma assinatura ativa',
      stripeNotConfigured: 'As variáveis de ambiente do Stripe estão faltando',
    },
  },

  post: {
    label: 'Post',

    dashboardCard: {
      title: 'Posts',
    },

    list: {
      menu: 'Posts',
      title: 'Posts',
      noResults: 'Nenhum posts encontrado.',
    },

    export: {
      success: 'Posts exportados com sucesso',
    },

    new: {
      menu: 'Novo Post',
      title: 'Novo Post',
      success: 'Post criado com sucesso',
    },

    view: {
      title: 'Ver Post',
    },

    edit: {
      menu: 'Editar Post',
      title: 'Editar Post',
      success: 'Post atualizado com sucesso',
    },

    restore: {
      success: 'Post restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um post para restaurar.',
      confirmTitle: 'Restaurar Post?',
    },

    restoreMany: {
      success: 'Post(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um post para restaurar.',
      confirmTitle: 'Restaurar Post(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} post(es) selecionados?',
    },

    archiveMany: {
      success: 'Post(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um post para arquivar.',
      confirmTitle: 'Arquivar Post(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} post(es) selecionados?',
    },

    archive: {
      success: 'Post arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um post para arquivar.',
      confirmTitle: 'Arquivar Post?',
    },

    destroyMany: {
      success: 'Post(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Post para excluir.',
      confirmTitle: 'Excluir Post(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Post(es) selecionados?',
    },

    destroy: {
      success: 'Post excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Post para excluir.',
      confirmTitle: 'Excluir Post?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      meta: 'Meta',
      files: 'Files',
      images: 'Images',
      type: 'Type',
      user: 'User',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      title: '',
      body: '',
      meta: '',
      files: '',
      images: '',
      type: '',
      user: '',
    },

    enumerators: {

    },
  },

  comment: {
    label: 'Comment',

    dashboardCard: {
      title: 'Comments',
    },

    list: {
      menu: 'Comments',
      title: 'Comments',
      noResults: 'Nenhum comments encontrado.',
    },

    export: {
      success: 'Comments exportados com sucesso',
    },

    new: {
      menu: 'Novo Comment',
      title: 'Novo Comment',
      success: 'Comment criado com sucesso',
    },

    view: {
      title: 'Ver Comment',
    },

    edit: {
      menu: 'Editar Comment',
      title: 'Editar Comment',
      success: 'Comment atualizado com sucesso',
    },

    restore: {
      success: 'Comment restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um comment para restaurar.',
      confirmTitle: 'Restaurar Comment?',
    },

    restoreMany: {
      success: 'Comment(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um comment para restaurar.',
      confirmTitle: 'Restaurar Comment(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} comment(es) selecionados?',
    },

    archiveMany: {
      success: 'Comment(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um comment para arquivar.',
      confirmTitle: 'Arquivar Comment(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} comment(es) selecionados?',
    },

    archive: {
      success: 'Comment arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um comment para arquivar.',
      confirmTitle: 'Arquivar Comment?',
    },

    destroyMany: {
      success: 'Comment(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Comment para excluir.',
      confirmTitle: 'Excluir Comment(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Comment(es) selecionados?',
    },

    destroy: {
      success: 'Comment excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Comment para excluir.',
      confirmTitle: 'Excluir Comment?',
    },

    fields: {
      body: 'Body',
      meta: 'Meta',
      type: 'Type',
      images: 'Images',
      user: 'User',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      body: '',
      meta: '',
      type: '',
      images: '',
      user: '',
    },

    enumerators: {

    },
  },

  order: {
    label: 'Order',

    dashboardCard: {
      title: 'Orders',
    },

    list: {
      menu: 'Orders',
      title: 'Orders',
      noResults: 'Nenhum orders encontrado.',
    },

    export: {
      success: 'Orders exportados com sucesso',
    },

    new: {
      menu: 'Novo Order',
      title: 'Novo Order',
      success: 'Order criado com sucesso',
    },

    view: {
      title: 'Ver Order',
    },

    edit: {
      menu: 'Editar Order',
      title: 'Editar Order',
      success: 'Order atualizado com sucesso',
    },

    restore: {
      success: 'Order restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um order para restaurar.',
      confirmTitle: 'Restaurar Order?',
    },

    restoreMany: {
      success: 'Order(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um order para restaurar.',
      confirmTitle: 'Restaurar Order(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} order(es) selecionados?',
    },

    archiveMany: {
      success: 'Order(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um order para arquivar.',
      confirmTitle: 'Arquivar Order(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} order(es) selecionados?',
    },

    archive: {
      success: 'Order arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um order para arquivar.',
      confirmTitle: 'Arquivar Order?',
    },

    destroyMany: {
      success: 'Order(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Order para excluir.',
      confirmTitle: 'Excluir Order(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Order(es) selecionados?',
    },

    destroy: {
      success: 'Order excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Order para excluir.',
      confirmTitle: 'Excluir Order?',
    },

    fields: {
      meta: 'Meta',
      side: 'Side',
      type: 'Type',
      price: 'Price',
      quantity: 'Quantity',
      status: 'Status',
      timeInFore: 'TimeInFore',
      quantityFilled: 'QuantityFilled',
      user: 'User',
      account: 'Account',
      instrument: 'Instrument',
      buys: 'Buys',
      sells: 'Sells',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      meta: '',
      side: '',
      type: '',
      price: '',
      quantity: '',
      status: '',
      timeInFore: '',
      quantityFilled: '',
      user: '',
      account: '',
      instrument: '',
      buys: '',
      sells: '',
    },

    enumerators: {
      side: {
        buy: 'Buy',
        sell: 'Sell',
      },

      type: {
        limit: 'Limit',
        market: 'Market',
        stop_market: 'Stop_market',
        stop_limit: 'Stop_limit',
        trailing_stop_market: 'Trailing_stop_market',
        trailing_stop_limit: 'Trailing_stop_limit',
      },

      status: {
        open: 'Open',
        partially_filled: 'Partially_filled',
        filled: 'Filled',
        cancelled: 'Cancelled',
      },

      timeInFore: {
        gtc: 'Gtc',
        ioc: 'Ioc',
        fok: 'Fok',
        day: 'Day',
      },
    },
  },

  article: {
    label: 'Article',

    dashboardCard: {
      title: 'Articles',
    },

    list: {
      menu: 'Articles',
      title: 'Articles',
      noResults: 'Nenhum articles encontrado.',
    },

    export: {
      success: 'Articles exportados com sucesso',
    },

    new: {
      menu: 'Novo Article',
      title: 'Novo Article',
      success: 'Article criado com sucesso',
    },

    view: {
      title: 'Ver Article',
    },

    edit: {
      menu: 'Editar Article',
      title: 'Editar Article',
      success: 'Article atualizado com sucesso',
    },

    restore: {
      success: 'Article restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um article para restaurar.',
      confirmTitle: 'Restaurar Article?',
    },

    restoreMany: {
      success: 'Article(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um article para restaurar.',
      confirmTitle: 'Restaurar Article(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} article(es) selecionados?',
    },

    archiveMany: {
      success: 'Article(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um article para arquivar.',
      confirmTitle: 'Arquivar Article(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} article(es) selecionados?',
    },

    archive: {
      success: 'Article arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um article para arquivar.',
      confirmTitle: 'Arquivar Article?',
    },

    destroyMany: {
      success: 'Article(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Article para excluir.',
      confirmTitle: 'Excluir Article(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Article(es) selecionados?',
    },

    destroy: {
      success: 'Article excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Article para excluir.',
      confirmTitle: 'Excluir Article?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      meta: 'Meta',
      type: 'Type',
      images: 'Images',
      files: 'Files',
      user: 'User',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      title: '',
      body: '',
      meta: '',
      type: '',
      images: '',
      files: '',
      user: '',
    },

    enumerators: {

    },
  },

  item: {
    label: 'Item',

    dashboardCard: {
      title: 'Items',
    },

    list: {
      menu: 'Items',
      title: 'Items',
      noResults: 'Nenhum items encontrado.',
    },

    export: {
      success: 'Items exportados com sucesso',
    },

    new: {
      menu: 'Novo Item',
      title: 'Novo Item',
      success: 'Item criado com sucesso',
    },

    view: {
      title: 'Ver Item',
    },

    edit: {
      menu: 'Editar Item',
      title: 'Editar Item',
      success: 'Item atualizado com sucesso',
    },

    restore: {
      success: 'Item restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um item para restaurar.',
      confirmTitle: 'Restaurar Item?',
    },

    restoreMany: {
      success: 'Item(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um item para restaurar.',
      confirmTitle: 'Restaurar Item(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} item(es) selecionados?',
    },

    archiveMany: {
      success: 'Item(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um item para arquivar.',
      confirmTitle: 'Arquivar Item(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} item(es) selecionados?',
    },

    archive: {
      success: 'Item arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um item para arquivar.',
      confirmTitle: 'Arquivar Item?',
    },

    destroyMany: {
      success: 'Item(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Item para excluir.',
      confirmTitle: 'Excluir Item(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Item(es) selecionados?',
    },

    destroy: {
      success: 'Item excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Item para excluir.',
      confirmTitle: 'Excluir Item?',
    },

    fields: {
      name: 'Name',
      caption: 'Caption',
      description: 'Description',
      price: 'Price',
      photos: 'Photos',
      category: 'Category',
      meta: 'Meta',
      files: 'Files',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      name: '',
      caption: '',
      description: '',
      price: '',
      photos: '',
      category: '',
      meta: '',
      files: '',

    },

    enumerators: {

    },
  },

  chat: {
    label: 'Chat',

    dashboardCard: {
      title: 'Chats',
    },

    list: {
      menu: 'Chats',
      title: 'Chats',
      noResults: 'Nenhum chats encontrado.',
    },

    export: {
      success: 'Chats exportados com sucesso',
    },

    new: {
      menu: 'Novo Chat',
      title: 'Novo Chat',
      success: 'Chat criado com sucesso',
    },

    view: {
      title: 'Ver Chat',
    },

    edit: {
      menu: 'Editar Chat',
      title: 'Editar Chat',
      success: 'Chat atualizado com sucesso',
    },

    restore: {
      success: 'Chat restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chat para restaurar.',
      confirmTitle: 'Restaurar Chat?',
    },

    restoreMany: {
      success: 'Chat(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chat para restaurar.',
      confirmTitle: 'Restaurar Chat(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} chat(es) selecionados?',
    },

    archiveMany: {
      success: 'Chat(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chat para arquivar.',
      confirmTitle: 'Arquivar Chat(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} chat(es) selecionados?',
    },

    archive: {
      success: 'Chat arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chat para arquivar.',
      confirmTitle: 'Arquivar Chat?',
    },

    destroyMany: {
      success: 'Chat(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Chat para excluir.',
      confirmTitle: 'Excluir Chat(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Chat(es) selecionados?',
    },

    destroy: {
      success: 'Chat excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Chat para excluir.',
      confirmTitle: 'Excluir Chat?',
    },

    fields: {
      name: 'Name',
      media: 'Media',
      meta: 'Meta',
      active: 'Active',
      messages: 'Messages',
      chatees: 'Chatees',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      name: '',
      media: '',
      meta: '',
      active: '',
      messages: '',
      chatees: '',
    },

    enumerators: {

    },
  },

  chatee: {
    label: 'Chatee',

    dashboardCard: {
      title: 'Chatees',
    },

    list: {
      menu: 'Chatees',
      title: 'Chatees',
      noResults: 'Nenhum chatees encontrado.',
    },

    export: {
      success: 'Chatees exportados com sucesso',
    },

    new: {
      menu: 'Novo Chatee',
      title: 'Novo Chatee',
      success: 'Chatee criado com sucesso',
    },

    view: {
      title: 'Ver Chatee',
    },

    edit: {
      menu: 'Editar Chatee',
      title: 'Editar Chatee',
      success: 'Chatee atualizado com sucesso',
    },

    restore: {
      success: 'Chatee restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chatee para restaurar.',
      confirmTitle: 'Restaurar Chatee?',
    },

    restoreMany: {
      success: 'Chatee(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chatee para restaurar.',
      confirmTitle: 'Restaurar Chatee(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} chatee(es) selecionados?',
    },

    archiveMany: {
      success: 'Chatee(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chatee para arquivar.',
      confirmTitle: 'Arquivar Chatee(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} chatee(es) selecionados?',
    },

    archive: {
      success: 'Chatee arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chatee para arquivar.',
      confirmTitle: 'Arquivar Chatee?',
    },

    destroyMany: {
      success: 'Chatee(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Chatee para excluir.',
      confirmTitle: 'Excluir Chatee(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Chatee(es) selecionados?',
    },

    destroy: {
      success: 'Chatee excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Chatee para excluir.',
      confirmTitle: 'Excluir Chatee?',
    },

    fields: {
      nickname: 'Nickname',
      status: 'Status',
      role: 'Role',
      user: 'User',
      chat: 'Chat',
      messages: 'Messages',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      nickname: '',
      status: 'Status of the user in the chat.',
      role: '',
      user: '',
      chat: '',
      messages: '',
    },

    enumerators: {
      status: {
        pending: 'Pending',
        current: 'Current',
        block: 'Block',
        refuse: 'Refuse',
      },
    },
  },

  message: {
    label: 'Message',

    dashboardCard: {
      title: 'Messages',
    },

    list: {
      menu: 'Messages',
      title: 'Messages',
      noResults: 'Nenhum messages encontrado.',
    },

    export: {
      success: 'Messages exportados com sucesso',
    },

    new: {
      menu: 'Novo Message',
      title: 'Novo Message',
      success: 'Message criado com sucesso',
    },

    view: {
      title: 'Ver Message',
    },

    edit: {
      menu: 'Editar Message',
      title: 'Editar Message',
      success: 'Message atualizado com sucesso',
    },

    restore: {
      success: 'Message restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um message para restaurar.',
      confirmTitle: 'Restaurar Message?',
    },

    restoreMany: {
      success: 'Message(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um message para restaurar.',
      confirmTitle: 'Restaurar Message(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} message(es) selecionados?',
    },

    archiveMany: {
      success: 'Message(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um message para arquivar.',
      confirmTitle: 'Arquivar Message(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} message(es) selecionados?',
    },

    archive: {
      success: 'Message arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um message para arquivar.',
      confirmTitle: 'Arquivar Message?',
    },

    destroyMany: {
      success: 'Message(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Message para excluir.',
      confirmTitle: 'Excluir Message(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Message(es) selecionados?',
    },

    destroy: {
      success: 'Message excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Message para excluir.',
      confirmTitle: 'Excluir Message?',
    },

    fields: {
      body: 'Body',
      attachment: 'Attachment',
      images: 'Images',
      type: 'Type',
      meta: 'Meta',
      chat: 'Chat',
      chatee: 'Chatee',
      sender: 'Sender',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      body: '',
      attachment: '',
      images: '',
      type: '',
      meta: '',
      chat: '',
      chatee: '',
      sender: '',
    },

    enumerators: {

    },
  },

  asset: {
    label: 'Asset',

    dashboardCard: {
      title: 'Assets',
    },

    list: {
      menu: 'Assets',
      title: 'Assets',
      noResults: 'Nenhum assets encontrado.',
    },

    export: {
      success: 'Assets exportados com sucesso',
    },

    new: {
      menu: 'Novo Asset',
      title: 'Novo Asset',
      success: 'Asset criado com sucesso',
    },

    view: {
      title: 'Ver Asset',
    },

    edit: {
      menu: 'Editar Asset',
      title: 'Editar Asset',
      success: 'Asset atualizado com sucesso',
    },

    restore: {
      success: 'Asset restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um asset para restaurar.',
      confirmTitle: 'Restaurar Asset?',
    },

    restoreMany: {
      success: 'Asset(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um asset para restaurar.',
      confirmTitle: 'Restaurar Asset(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} asset(es) selecionados?',
    },

    archiveMany: {
      success: 'Asset(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um asset para arquivar.',
      confirmTitle: 'Arquivar Asset(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} asset(es) selecionados?',
    },

    archive: {
      success: 'Asset arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um asset para arquivar.',
      confirmTitle: 'Arquivar Asset?',
    },

    destroyMany: {
      success: 'Asset(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Asset para excluir.',
      confirmTitle: 'Excluir Asset(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Asset(es) selecionados?',
    },

    destroy: {
      success: 'Asset excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Asset para excluir.',
      confirmTitle: 'Excluir Asset?',
    },

    fields: {
      symbol: 'Symbol',
      type: 'Type',
      precision: 'Precision',
      isFractional: 'IsFractional',
      meta: 'Meta',
      baseInstruments: 'BaseInstruments',
      quoteInstruments: 'QuoteInstruments',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      symbol: '',
      type: '',
      precision: '',
      isFractional: '',
      meta: '',
      baseInstruments: '',
      quoteInstruments: '',
    },

    enumerators: {
      type: {
        crypto: 'Crypto',
        fiat: 'Fiat',
        equity: 'Equity',
        option: 'Option',
        future: 'Future',
      },
    },
  },

  account: {
    label: 'Account',

    dashboardCard: {
      title: 'Accounts',
    },

    list: {
      menu: 'Accounts',
      title: 'Accounts',
      noResults: 'Nenhum accounts encontrado.',
    },

    export: {
      success: 'Accounts exportados com sucesso',
    },

    new: {
      menu: 'Novo Account',
      title: 'Novo Account',
      success: 'Account criado com sucesso',
    },

    view: {
      title: 'Ver Account',
    },

    edit: {
      menu: 'Editar Account',
      title: 'Editar Account',
      success: 'Account atualizado com sucesso',
    },

    restore: {
      success: 'Account restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um account para restaurar.',
      confirmTitle: 'Restaurar Account?',
    },

    restoreMany: {
      success: 'Account(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um account para restaurar.',
      confirmTitle: 'Restaurar Account(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} account(es) selecionados?',
    },

    archiveMany: {
      success: 'Account(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um account para arquivar.',
      confirmTitle: 'Arquivar Account(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} account(es) selecionados?',
    },

    archive: {
      success: 'Account arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um account para arquivar.',
      confirmTitle: 'Arquivar Account?',
    },

    destroyMany: {
      success: 'Account(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Account para excluir.',
      confirmTitle: 'Excluir Account(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Account(es) selecionados?',
    },

    destroy: {
      success: 'Account excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Account para excluir.',
      confirmTitle: 'Excluir Account?',
    },

    fields: {
      type: 'Type',
      status: 'Status',
      meta: 'Meta',
      orders: 'Orders',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      type: '',
      status: '',
      meta: '',
      orders: '',
    },

    enumerators: {
      type: {
        cash: 'Cash',
        custody: 'Custody',
        margin: 'Margin',
        clearing: 'Clearing',
        fees: 'Fees',
      },

      status: {
        active: 'Active',
        frozen: 'Frozen',
        closed: 'Closed',
      },
    },
  },

  instrument: {
    label: 'Instrument',

    dashboardCard: {
      title: 'Instruments',
    },

    list: {
      menu: 'Instruments',
      title: 'Instruments',
      noResults: 'Nenhum instruments encontrado.',
    },

    export: {
      success: 'Instruments exportados com sucesso',
    },

    new: {
      menu: 'Novo Instrument',
      title: 'Novo Instrument',
      success: 'Instrument criado com sucesso',
    },

    view: {
      title: 'Ver Instrument',
    },

    edit: {
      menu: 'Editar Instrument',
      title: 'Editar Instrument',
      success: 'Instrument atualizado com sucesso',
    },

    restore: {
      success: 'Instrument restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um instrument para restaurar.',
      confirmTitle: 'Restaurar Instrument?',
    },

    restoreMany: {
      success: 'Instrument(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um instrument para restaurar.',
      confirmTitle: 'Restaurar Instrument(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} instrument(es) selecionados?',
    },

    archiveMany: {
      success: 'Instrument(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um instrument para arquivar.',
      confirmTitle: 'Arquivar Instrument(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} instrument(es) selecionados?',
    },

    archive: {
      success: 'Instrument arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um instrument para arquivar.',
      confirmTitle: 'Arquivar Instrument?',
    },

    destroyMany: {
      success: 'Instrument(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Instrument para excluir.',
      confirmTitle: 'Excluir Instrument(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Instrument(es) selecionados?',
    },

    destroy: {
      success: 'Instrument excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Instrument para excluir.',
      confirmTitle: 'Excluir Instrument?',
    },

    fields: {
      type: 'Type',
      meta: 'Meta',
      status: 'Status',
      underlyingAsset: 'UnderlyingAsset',
      quoteAsset: 'QuoteAsset',
      orders: 'Orders',
      trades: 'Trades',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      type: '',
      meta: '',
      status: '',
      underlyingAsset: '',
      quoteAsset: '',
      orders: '',
      trades: '',
    },

    enumerators: {
      type: {
        spot: 'Spot',
        option: 'Option',
        future: 'Future',
        perp: 'Perp',
      },

      status: {
        active: 'Active',
        halted: 'Halted',
        delisted: 'Delisted',
      },
    },
  },

  ledgerEvent: {
    label: 'LedgerEvent',

    dashboardCard: {
      title: 'LedgerEvents',
    },

    list: {
      menu: 'LedgerEvents',
      title: 'LedgerEvents',
      noResults: 'Nenhum ledgerevents encontrado.',
    },

    export: {
      success: 'LedgerEvents exportados com sucesso',
    },

    new: {
      menu: 'Novo LedgerEvent',
      title: 'Novo LedgerEvent',
      success: 'LedgerEvent criado com sucesso',
    },

    view: {
      title: 'Ver LedgerEvent',
    },

    edit: {
      menu: 'Editar LedgerEvent',
      title: 'Editar LedgerEvent',
      success: 'LedgerEvent atualizado com sucesso',
    },

    restore: {
      success: 'LedgerEvent restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerevent para restaurar.',
      confirmTitle: 'Restaurar LedgerEvent?',
    },

    restoreMany: {
      success: 'LedgerEvent(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerevent para restaurar.',
      confirmTitle: 'Restaurar LedgerEvent(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} ledgerevent(es) selecionados?',
    },

    archiveMany: {
      success: 'LedgerEvent(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerevent para arquivar.',
      confirmTitle: 'Arquivar LedgerEvent(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} ledgerevent(es) selecionados?',
    },

    archive: {
      success: 'LedgerEvent arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerevent para arquivar.',
      confirmTitle: 'Arquivar LedgerEvent?',
    },

    destroyMany: {
      success: 'LedgerEvent(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um LedgerEvent para excluir.',
      confirmTitle: 'Excluir LedgerEvent(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} LedgerEvent(es) selecionados?',
    },

    destroy: {
      success: 'LedgerEvent excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um LedgerEvent para excluir.',
      confirmTitle: 'Excluir LedgerEvent?',
    },

    fields: {
      type: 'Type',
      referenceType: 'ReferenceType',
      entries: 'Entries',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      type: '',
      referenceType: '',
      entries: '',
    },

    enumerators: {
      type: {
        trade: 'Trade',
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        fee: 'Fee',
        settlement: 'Settlement',
        adjustment: 'Adjustment',
      },

      referenceType: {
        order: 'Order',
        trade: 'Trade',
        blockchain_tx: 'Blockchain_tx',
        admin_action: 'Admin_action',
      },
    },
  },

  ledgerEntry: {
    label: 'LedgerEntry',

    dashboardCard: {
      title: 'LedgerEntries',
    },

    list: {
      menu: 'LedgerEntries',
      title: 'LedgerEntries',
      noResults: 'Nenhum ledgerentries encontrado.',
    },

    export: {
      success: 'LedgerEntries exportados com sucesso',
    },

    new: {
      menu: 'Novo LedgerEntry',
      title: 'Novo LedgerEntry',
      success: 'LedgerEntry criado com sucesso',
    },

    view: {
      title: 'Ver LedgerEntry',
    },

    edit: {
      menu: 'Editar LedgerEntry',
      title: 'Editar LedgerEntry',
      success: 'LedgerEntry atualizado com sucesso',
    },

    restore: {
      success: 'LedgerEntry restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerentry para restaurar.',
      confirmTitle: 'Restaurar LedgerEntry?',
    },

    restoreMany: {
      success: 'LedgerEntry(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerentry para restaurar.',
      confirmTitle: 'Restaurar LedgerEntry(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} ledgerentry(es) selecionados?',
    },

    archiveMany: {
      success: 'LedgerEntry(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerentry para arquivar.',
      confirmTitle: 'Arquivar LedgerEntry(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} ledgerentry(es) selecionados?',
    },

    archive: {
      success: 'LedgerEntry arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um ledgerentry para arquivar.',
      confirmTitle: 'Arquivar LedgerEntry?',
    },

    destroyMany: {
      success: 'LedgerEntry(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um LedgerEntry para excluir.',
      confirmTitle: 'Excluir LedgerEntry(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} LedgerEntry(es) selecionados?',
    },

    destroy: {
      success: 'LedgerEntry excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um LedgerEntry para excluir.',
      confirmTitle: 'Excluir LedgerEntry?',
    },

    fields: {
      amount: 'Amount',
      event: 'Event',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      amount: '',
      event: '',
    },

    enumerators: {

    },
  },

  trade: {
    label: 'Trade',

    dashboardCard: {
      title: 'Trades',
    },

    list: {
      menu: 'Trades',
      title: 'Trades',
      noResults: 'Nenhum trades encontrado.',
    },

    export: {
      success: 'Trades exportados com sucesso',
    },

    new: {
      menu: 'Novo Trade',
      title: 'Novo Trade',
      success: 'Trade criado com sucesso',
    },

    view: {
      title: 'Ver Trade',
    },

    edit: {
      menu: 'Editar Trade',
      title: 'Editar Trade',
      success: 'Trade atualizado com sucesso',
    },

    restore: {
      success: 'Trade restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um trade para restaurar.',
      confirmTitle: 'Restaurar Trade?',
    },

    restoreMany: {
      success: 'Trade(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um trade para restaurar.',
      confirmTitle: 'Restaurar Trade(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} trade(es) selecionados?',
    },

    archiveMany: {
      success: 'Trade(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um trade para arquivar.',
      confirmTitle: 'Arquivar Trade(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} trade(es) selecionados?',
    },

    archive: {
      success: 'Trade arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um trade para arquivar.',
      confirmTitle: 'Arquivar Trade?',
    },

    destroyMany: {
      success: 'Trade(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Trade para excluir.',
      confirmTitle: 'Excluir Trade(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Trade(es) selecionados?',
    },

    destroy: {
      success: 'Trade excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Trade para excluir.',
      confirmTitle: 'Excluir Trade?',
    },

    fields: {
      price: 'Price',
      quantity: 'Quantity',
      buyOrderId: 'BuyOrderId',
      sellOrderId: 'SellOrderId',
      instrument: 'Instrument',
      tradeFills: 'TradeFills',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      price: '',
      quantity: '',
      buyOrderId: '',
      sellOrderId: '',
      instrument: '',
      tradeFills: '',
    },

    enumerators: {

    },
  },

  tradeFill: {
    label: 'TradeFill',

    dashboardCard: {
      title: 'TradeFills',
    },

    list: {
      menu: 'TradeFills',
      title: 'TradeFills',
      noResults: 'Nenhum tradefills encontrado.',
    },

    export: {
      success: 'TradeFills exportados com sucesso',
    },

    new: {
      menu: 'Novo TradeFill',
      title: 'Novo TradeFill',
      success: 'TradeFill criado com sucesso',
    },

    view: {
      title: 'Ver TradeFill',
    },

    edit: {
      menu: 'Editar TradeFill',
      title: 'Editar TradeFill',
      success: 'TradeFill atualizado com sucesso',
    },

    restore: {
      success: 'TradeFill restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um tradefill para restaurar.',
      confirmTitle: 'Restaurar TradeFill?',
    },

    restoreMany: {
      success: 'TradeFill(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um tradefill para restaurar.',
      confirmTitle: 'Restaurar TradeFill(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} tradefill(es) selecionados?',
    },

    archiveMany: {
      success: 'TradeFill(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um tradefill para arquivar.',
      confirmTitle: 'Arquivar TradeFill(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} tradefill(es) selecionados?',
    },

    archive: {
      success: 'TradeFill arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um tradefill para arquivar.',
      confirmTitle: 'Arquivar TradeFill?',
    },

    destroyMany: {
      success: 'TradeFill(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um TradeFill para excluir.',
      confirmTitle: 'Excluir TradeFill(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} TradeFill(es) selecionados?',
    },

    destroy: {
      success: 'TradeFill excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um TradeFill para excluir.',
      confirmTitle: 'Excluir TradeFill?',
    },

    fields: {
      side: 'Side',
      price: 'Price',
      quantity: 'Quantity',
      fee: 'Fee',
      trade: 'Trade',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      side: '',
      price: '',
      quantity: '',
      fee: '',
      trade: '',
    },

    enumerators: {
      side: {
        buy: 'Buy',
        sell: 'Sell',
      },
    },
  },

  auditLog: {
    list: {
      menu: 'Logs de Auditoria',
      title: 'Logs de Auditoria',
      noResults: 'Nenhum log de auditoria encontrado.',
    },

    changesDialog: {
      title: 'Log de Auditoria',
      changes: 'Mudanças',
      noChanges: 'Não há mudanças neste log.',
    },

    export: {
      success: 'Logs de Auditoria exportados com sucesso',
    },

    fields: {
      timestamp: 'Data',
      entityName: 'Entidade',
      entityNames: 'Entidades',
      entityId: 'ID da Entidade',
      operation: 'Operação',
      operations: 'Operações',
      membership: 'Usuário',
      apiKey: 'Chave da API',
      apiEndpoint: 'Endpoint da API',
      apiHttpResponseCode: 'Status da API',
      transactionId: 'ID da Transação',
    },

    enumerators: {
      operation: {
        SI: 'Entrou',
        SO: 'Saiu',
        SU: 'Cadastrou-se',
        PRR: 'Solicitou Redefinição de Senha',
        PRC: 'Confirmou Redefinição de Senha',
        PC: 'Alterou Senha',
        VER: 'Solicitou Verificação de Email',
        VEC: 'Confirmou Verificação de Email',
        C: 'Criou',
        U: 'Atualizou',
        D: 'Excluiu',
        AG: 'API Get',
        APO: 'API Post',
        APU: 'API Put',
        AD: 'API Delete',
      },
    },

    dashboardCard: {
      activityChart: 'Atividade',
      activityList: 'Atividade Recente',
    },

    readableOperations: {
      SI: '{0} entrou',
      SU: '{0} se registrou',
      PRR: '{0} solicitou redefinição de senha',
      PRC: '{0} confirmou redefinição de senha',
      PC: '{0} alterou a senha',
      VER: '{0} solicitou verificação de email',
      VEC: '{0} verificou o email',
      C: '{0} criou {1} {2}',
      U: '{0} atualizou {1} {2}',
      D: '{0} excluiu {1} {2}',
    },
  },

  recaptcha: {
    errors: {
      disabled:
        'O reCAPTCHA está desativado nesta plataforma. Verificação ignorada.',
      invalid: 'reCAPTCHA inválido',
    },
  },

  emails: {
    passwordResetEmail: {
      subject: `Redefina sua senha para {0}`,
      content: `<p>Olá,</p> <p>Siga este link para redefinir a senha da sua conta {0}.</p> <p><a href="{1}">{1}</a></p> <p>Se você não solicitou a redefinição de senha, pode ignorar este e-mail.</p> <p>Obrigado,</p> <p>Equipe {0}</p>`,
    },
    verifyEmailEmail: {
      subject: `Verifique seu e-mail para {0}`,
      content: `<p>Olá,</p><p>Siga este link para verificar seu endereço de e-mail.</p><p><a href="{1}">{1}</a></p><p>Se você não solicitou essa verificação, pode ignorar este e-mail.</p> <p>Obrigado,</p> <p>Equipe {0}</p>`,
    },
    invitationEmail: {
      singleTenant: {
        subject: `Você foi convidado para {0}`,
        content: `<p>Olá,</p> <p>Você foi convidado para {0}.</p> <p>Siga este link para se registrar.</p> <p><a href="{1}">{1}</a></p> <p>Obrigado,</p> <p>Equipe {0}</p>`,
      },
      multiTenant: {
        subject: `Você foi convidado para {1} em {0}`,
        content: `<p>Olá,</p> <p>Você foi convidado para {2}.</p> <p>Siga este link para se registrar.</p> <p><a href="{1}">{1}</a></p> <p>Obrigado,</p> <p>Equipe {0}</p>`,
      },
    },
    errors: {
      emailNotConfigured: 'Variáveis de ambiente de e-mail estão faltando',
    },
  },
};

export default dictionary;
