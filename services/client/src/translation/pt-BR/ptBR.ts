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
      user: 'User',
      orders: 'Orders',
      wallets: 'Wallets',
      deposits: 'Deposits',
      withdrawals: 'Withdrawals',
      snapshots: 'Snapshots',
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
      user: '',
      orders: '',
      wallets: '',
      deposits: '',
      withdrawals: '',
      snapshots: '',
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

  deposit: {
    label: 'Deposit',

    dashboardCard: {
      title: 'Deposits',
    },

    list: {
      menu: 'Deposits',
      title: 'Deposits',
      noResults: 'Nenhum deposits encontrado.',
    },

    export: {
      success: 'Deposits exportados com sucesso',
    },

    new: {
      menu: 'Novo Deposit',
      title: 'Novo Deposit',
      success: 'Deposit criado com sucesso',
    },

    view: {
      title: 'Ver Deposit',
    },

    edit: {
      menu: 'Editar Deposit',
      title: 'Editar Deposit',
      success: 'Deposit atualizado com sucesso',
    },

    restore: {
      success: 'Deposit restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um deposit para restaurar.',
      confirmTitle: 'Restaurar Deposit?',
    },

    restoreMany: {
      success: 'Deposit(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um deposit para restaurar.',
      confirmTitle: 'Restaurar Deposit(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} deposit(es) selecionados?',
    },

    archiveMany: {
      success: 'Deposit(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um deposit para arquivar.',
      confirmTitle: 'Arquivar Deposit(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} deposit(es) selecionados?',
    },

    archive: {
      success: 'Deposit arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um deposit para arquivar.',
      confirmTitle: 'Arquivar Deposit?',
    },

    destroyMany: {
      success: 'Deposit(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Deposit para excluir.',
      confirmTitle: 'Excluir Deposit(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Deposit(es) selecionados?',
    },

    destroy: {
      success: 'Deposit excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Deposit para excluir.',
      confirmTitle: 'Excluir Deposit?',
    },

    fields: {
      amount: 'Amount',
      status: 'Status',
      chain: 'Chain',
      txHash: 'TxHash',
      fromAddress: 'FromAddress',
      confirmations: 'Confirmations',
      requiredConfirmations: 'RequiredConfirmations',
      detectedAt: 'DetectedAt',
      confirmedAt: 'ConfirmedAt',
      creditedAt: 'CreditedAt',
      meta: 'Meta',
      account: 'Account',
      asset: 'Asset',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      amount: '',
      status: '',
      chain: '',
      txHash: '',
      fromAddress: '',
      confirmations: '',
      requiredConfirmations: '',
      detectedAt: '',
      confirmedAt: '',
      creditedAt: '',
      meta: '',
      account: '',
      asset: '',
    },

    enumerators: {
      status: {
        detected: 'Detected',
        confirming: 'Confirming',
        confirmed: 'Confirmed',
        credited: 'Credited',
        rejected: 'Rejected',
      },
    },
  },

  withdrawal: {
    label: 'Withdrawal',

    dashboardCard: {
      title: 'Withdrawals',
    },

    list: {
      menu: 'Withdrawals',
      title: 'Withdrawals',
      noResults: 'Nenhum withdrawals encontrado.',
    },

    export: {
      success: 'Withdrawals exportados com sucesso',
    },

    new: {
      menu: 'Novo Withdrawal',
      title: 'Novo Withdrawal',
      success: 'Withdrawal criado com sucesso',
    },

    view: {
      title: 'Ver Withdrawal',
    },

    edit: {
      menu: 'Editar Withdrawal',
      title: 'Editar Withdrawal',
      success: 'Withdrawal atualizado com sucesso',
    },

    restore: {
      success: 'Withdrawal restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um withdrawal para restaurar.',
      confirmTitle: 'Restaurar Withdrawal?',
    },

    restoreMany: {
      success: 'Withdrawal(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um withdrawal para restaurar.',
      confirmTitle: 'Restaurar Withdrawal(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} withdrawal(es) selecionados?',
    },

    archiveMany: {
      success: 'Withdrawal(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um withdrawal para arquivar.',
      confirmTitle: 'Arquivar Withdrawal(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} withdrawal(es) selecionados?',
    },

    archive: {
      success: 'Withdrawal arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um withdrawal para arquivar.',
      confirmTitle: 'Arquivar Withdrawal?',
    },

    destroyMany: {
      success: 'Withdrawal(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Withdrawal para excluir.',
      confirmTitle: 'Excluir Withdrawal(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Withdrawal(es) selecionados?',
    },

    destroy: {
      success: 'Withdrawal excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Withdrawal para excluir.',
      confirmTitle: 'Excluir Withdrawal?',
    },

    fields: {
      amount: 'Amount',
      fee: 'Fee',
      status: 'Status',
      destinationAddress: 'DestinationAddress',
      destinationTag: 'DestinationTag',
      chain: 'Chain',
      txHash: 'TxHash',
      failureReason: 'FailureReason',
      requestedBy: 'RequestedBy',
      approvedBy: 'ApprovedBy',
      approvedAt: 'ApprovedAt',
      requestedAt: 'RequestedAt',
      broadcastAt: 'BroadcastAt',
      confirmedAt: 'ConfirmedAt',
      confirmations: 'Confirmations',
      meta: 'Meta',
      account: 'Account',
      asset: 'Asset',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      amount: '',
      fee: '',
      status: '',
      destinationAddress: '',
      destinationTag: '',
      chain: '',
      txHash: '',
      failureReason: '',
      requestedBy: '',
      approvedBy: '',
      approvedAt: '',
      requestedAt: '',
      broadcastAt: '',
      confirmedAt: '',
      confirmations: '',
      meta: '',
      account: '',
      asset: '',
    },

    enumerators: {
      status: {
        requested: 'Requested',
        approved: 'Approved',
        rejected: 'Rejected',
        queued: 'Queued',
        broadcast: 'Broadcast',
        confirmed: 'Confirmed',
        failed: 'Failed',
        cancelled: 'Cancelled',
      },
    },
  },

  wallet: {
    label: 'Wallet',

    dashboardCard: {
      title: 'Wallets',
    },

    list: {
      menu: 'Wallets',
      title: 'Wallets',
      noResults: 'Nenhum wallets encontrado.',
    },

    export: {
      success: 'Wallets exportados com sucesso',
    },

    new: {
      menu: 'Novo Wallet',
      title: 'Novo Wallet',
      success: 'Wallet criado com sucesso',
    },

    view: {
      title: 'Ver Wallet',
    },

    edit: {
      menu: 'Editar Wallet',
      title: 'Editar Wallet',
      success: 'Wallet atualizado com sucesso',
    },

    restore: {
      success: 'Wallet restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um wallet para restaurar.',
      confirmTitle: 'Restaurar Wallet?',
    },

    restoreMany: {
      success: 'Wallet(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um wallet para restaurar.',
      confirmTitle: 'Restaurar Wallet(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} wallet(es) selecionados?',
    },

    archiveMany: {
      success: 'Wallet(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um wallet para arquivar.',
      confirmTitle: 'Arquivar Wallet(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} wallet(es) selecionados?',
    },

    archive: {
      success: 'Wallet arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um wallet para arquivar.',
      confirmTitle: 'Arquivar Wallet?',
    },

    destroyMany: {
      success: 'Wallet(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Wallet para excluir.',
      confirmTitle: 'Excluir Wallet(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Wallet(es) selecionados?',
    },

    destroy: {
      success: 'Wallet excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Wallet para excluir.',
      confirmTitle: 'Excluir Wallet?',
    },

    fields: {
      available: 'Available',
      locked: 'Locked',
      total: 'Total',
      version: 'Version',
      meta: 'Meta',
      user: 'User',
      asset: 'Asset',
      account: 'Account',
      snapshots: 'Snapshots',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      available: '',
      locked: '',
      total: '',
      version: '',
      meta: '',
      user: '',
      asset: '',
      account: '',
      snapshots: '',
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
      side: 'Side',
      type: 'Type',
      price: 'Price',
      quantity: 'Quantity',
      quantityFilled: 'QuantityFilled',
      status: 'Status',
      timeInFore: 'TimeInFore',
      meta: 'Meta',
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
      side: '',
      type: '',
      price: '',
      quantity: '',
      quantityFilled: '',
      status: '',
      timeInFore: 'good_til_cancelled, immediate_or_cancel, fill_or_kill, day_order',
      meta: '',
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

  fill: {
    label: 'Fill',

    dashboardCard: {
      title: 'Fills',
    },

    list: {
      menu: 'Fills',
      title: 'Fills',
      noResults: 'Nenhum fills encontrado.',
    },

    export: {
      success: 'Fills exportados com sucesso',
    },

    new: {
      menu: 'Novo Fill',
      title: 'Novo Fill',
      success: 'Fill criado com sucesso',
    },

    view: {
      title: 'Ver Fill',
    },

    edit: {
      menu: 'Editar Fill',
      title: 'Editar Fill',
      success: 'Fill atualizado com sucesso',
    },

    restore: {
      success: 'Fill restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um fill para restaurar.',
      confirmTitle: 'Restaurar Fill?',
    },

    restoreMany: {
      success: 'Fill(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um fill para restaurar.',
      confirmTitle: 'Restaurar Fill(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} fill(es) selecionados?',
    },

    archiveMany: {
      success: 'Fill(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um fill para arquivar.',
      confirmTitle: 'Arquivar Fill(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} fill(es) selecionados?',
    },

    archive: {
      success: 'Fill arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um fill para arquivar.',
      confirmTitle: 'Arquivar Fill?',
    },

    destroyMany: {
      success: 'Fill(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Fill para excluir.',
      confirmTitle: 'Excluir Fill(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Fill(es) selecionados?',
    },

    destroy: {
      success: 'Fill excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Fill para excluir.',
      confirmTitle: 'Excluir Fill?',
    },

    fields: {
      side: 'Side',
      price: 'Price',
      quantity: 'Quantity',
      fee: 'Fee',
      meta: 'Meta',
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
      meta: '',
      trade: '',
    },

    enumerators: {
      side: {
        buy: 'Buy',
        sell: 'Sell',
      },
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
      meta: 'Meta',
      buyOrderId: 'BuyOrderId',
      sellOrderId: 'SellOrderId',
      instrument: 'Instrument',
      fills: 'Fills',
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
      meta: '',
      buyOrderId: '',
      sellOrderId: '',
      instrument: '',
      fills: '',
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
      klass: 'Klass',
      precision: 'Precision',
      isFractional: 'IsFractional',
      decimals: 'Decimals',
      meta: 'Meta',
      baseInstruments: 'BaseInstruments',
      quoteInstruments: 'QuoteInstruments',
      wallets: 'Wallets',
      deposits: 'Deposits',
      withdrawals: 'Withdrawals',
      snapshots: 'Snapshots',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      symbol: '',
      klass: '',
      precision: '',
      isFractional: '',
      decimals: '',
      meta: '',
      baseInstruments: '',
      quoteInstruments: '',
      wallets: '',
      deposits: '',
      withdrawals: '',
      snapshots: '',
    },

    enumerators: {
      klass: {
        equity: 'Equity',
        debt: 'Debt',
        commodity: 'Commodity',
        currency: 'Currency',
        crypto: 'Crypto',
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
      symbol: 'Symbol',
      type: 'Type',
      status: 'Status',
      meta: 'Meta',
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
      symbol: '',
      type: '',
      status: '',
      meta: '',
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

  feeSchedule: {
    label: 'FeeSchedule',

    dashboardCard: {
      title: 'FeeSchedules',
    },

    list: {
      menu: 'FeeSchedules',
      title: 'FeeSchedules',
      noResults: 'Nenhum feeschedules encontrado.',
    },

    export: {
      success: 'FeeSchedules exportados com sucesso',
    },

    new: {
      menu: 'Novo FeeSchedule',
      title: 'Novo FeeSchedule',
      success: 'FeeSchedule criado com sucesso',
    },

    view: {
      title: 'Ver FeeSchedule',
    },

    edit: {
      menu: 'Editar FeeSchedule',
      title: 'Editar FeeSchedule',
      success: 'FeeSchedule atualizado com sucesso',
    },

    restore: {
      success: 'FeeSchedule restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feeschedule para restaurar.',
      confirmTitle: 'Restaurar FeeSchedule?',
    },

    restoreMany: {
      success: 'FeeSchedule(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feeschedule para restaurar.',
      confirmTitle: 'Restaurar FeeSchedule(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} feeschedule(es) selecionados?',
    },

    archiveMany: {
      success: 'FeeSchedule(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feeschedule para arquivar.',
      confirmTitle: 'Arquivar FeeSchedule(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} feeschedule(es) selecionados?',
    },

    archive: {
      success: 'FeeSchedule arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feeschedule para arquivar.',
      confirmTitle: 'Arquivar FeeSchedule?',
    },

    destroyMany: {
      success: 'FeeSchedule(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um FeeSchedule para excluir.',
      confirmTitle: 'Excluir FeeSchedule(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} FeeSchedule(es) selecionados?',
    },

    destroy: {
      success: 'FeeSchedule excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um FeeSchedule para excluir.',
      confirmTitle: 'Excluir FeeSchedule?',
    },

    fields: {
      scope: 'Scope',
      makerFeeBps: 'MakerFeeBps',
      takerFeeBps: 'TakerFeeBps',
      minFeeAmount: 'MinFeeAmount',
      effectiveFrom: 'EffectiveFrom',
      effectiveTo: 'EffectiveTo',
      tier: 'Tier',
      accountId: 'AccountId',
      instrumentId: 'InstrumentId',
      meta: 'Meta',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      scope: '',
      makerFeeBps: '',
      takerFeeBps: '',
      minFeeAmount: '',
      effectiveFrom: '',
      effectiveTo: '',
      tier: '',
      accountId: '',
      instrumentId: '',
      meta: '',

    },

    enumerators: {
      scope: {
        global: 'Global',
        tier: 'Tier',
        account: 'Account',
        instrument: 'Instrument',
        account_instrument: 'Account_instrument',
      },
    },
  },

  balanceSnapshot: {
    label: 'BalanceSnapshot',

    dashboardCard: {
      title: 'BalanceSnapshots',
    },

    list: {
      menu: 'BalanceSnapshots',
      title: 'BalanceSnapshots',
      noResults: 'Nenhum balancesnapshots encontrado.',
    },

    export: {
      success: 'BalanceSnapshots exportados com sucesso',
    },

    new: {
      menu: 'Novo BalanceSnapshot',
      title: 'Novo BalanceSnapshot',
      success: 'BalanceSnapshot criado com sucesso',
    },

    view: {
      title: 'Ver BalanceSnapshot',
    },

    edit: {
      menu: 'Editar BalanceSnapshot',
      title: 'Editar BalanceSnapshot',
      success: 'BalanceSnapshot atualizado com sucesso',
    },

    restore: {
      success: 'BalanceSnapshot restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um balancesnapshot para restaurar.',
      confirmTitle: 'Restaurar BalanceSnapshot?',
    },

    restoreMany: {
      success: 'BalanceSnapshot(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um balancesnapshot para restaurar.',
      confirmTitle: 'Restaurar BalanceSnapshot(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} balancesnapshot(es) selecionados?',
    },

    archiveMany: {
      success: 'BalanceSnapshot(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um balancesnapshot para arquivar.',
      confirmTitle: 'Arquivar BalanceSnapshot(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} balancesnapshot(es) selecionados?',
    },

    archive: {
      success: 'BalanceSnapshot arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um balancesnapshot para arquivar.',
      confirmTitle: 'Arquivar BalanceSnapshot?',
    },

    destroyMany: {
      success: 'BalanceSnapshot(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um BalanceSnapshot para excluir.',
      confirmTitle: 'Excluir BalanceSnapshot(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} BalanceSnapshot(es) selecionados?',
    },

    destroy: {
      success: 'BalanceSnapshot excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um BalanceSnapshot para excluir.',
      confirmTitle: 'Excluir BalanceSnapshot?',
    },

    fields: {
      available: 'Available',
      locked: 'Locked',
      total: 'Total',
      snapshotAt: 'SnapshotAt',
      meta: 'Meta',
      account: 'Account',
      wallet: 'Wallet',
      asset: 'Asset',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      available: '',
      locked: '',
      total: '',
      snapshotAt: '',
      meta: '',
      account: '',
      wallet: '',
      asset: '',
    },

    enumerators: {

    },
  },

  systemAccount: {
    label: 'SystemAccount',

    dashboardCard: {
      title: 'SystemAccounts',
    },

    list: {
      menu: 'SystemAccounts',
      title: 'SystemAccounts',
      noResults: 'Nenhum systemaccounts encontrado.',
    },

    export: {
      success: 'SystemAccounts exportados com sucesso',
    },

    new: {
      menu: 'Novo SystemAccount',
      title: 'Novo SystemAccount',
      success: 'SystemAccount criado com sucesso',
    },

    view: {
      title: 'Ver SystemAccount',
    },

    edit: {
      menu: 'Editar SystemAccount',
      title: 'Editar SystemAccount',
      success: 'SystemAccount atualizado com sucesso',
    },

    restore: {
      success: 'SystemAccount restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um systemaccount para restaurar.',
      confirmTitle: 'Restaurar SystemAccount?',
    },

    restoreMany: {
      success: 'SystemAccount(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um systemaccount para restaurar.',
      confirmTitle: 'Restaurar SystemAccount(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} systemaccount(es) selecionados?',
    },

    archiveMany: {
      success: 'SystemAccount(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um systemaccount para arquivar.',
      confirmTitle: 'Arquivar SystemAccount(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} systemaccount(es) selecionados?',
    },

    archive: {
      success: 'SystemAccount arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um systemaccount para arquivar.',
      confirmTitle: 'Arquivar SystemAccount?',
    },

    destroyMany: {
      success: 'SystemAccount(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um SystemAccount para excluir.',
      confirmTitle: 'Excluir SystemAccount(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} SystemAccount(es) selecionados?',
    },

    destroy: {
      success: 'SystemAccount excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um SystemAccount para excluir.',
      confirmTitle: 'Excluir SystemAccount?',
    },

    fields: {
      type: 'Type',
      name: 'Name',
      description: 'Description',
      isActive: 'IsActive',
      meta: 'Meta',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      type: '',
      name: '',
      description: '',
      isActive: '',
      meta: '',

    },

    enumerators: {
      type: {
        fee: 'Fee',
        treasury: 'Treasury',
        insurance: 'Insurance',
        liquidity: 'Liquidity',
      },
    },
  },

  referral: {
    label: 'Referral',

    dashboardCard: {
      title: 'Referrals',
    },

    list: {
      menu: 'Referrals',
      title: 'Referrals',
      noResults: 'Nenhum referrals encontrado.',
    },

    export: {
      success: 'Referrals exportados com sucesso',
    },

    new: {
      menu: 'Novo Referral',
      title: 'Novo Referral',
      success: 'Referral criado com sucesso',
    },

    view: {
      title: 'Ver Referral',
    },

    edit: {
      menu: 'Editar Referral',
      title: 'Editar Referral',
      success: 'Referral atualizado com sucesso',
    },

    restore: {
      success: 'Referral restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um referral para restaurar.',
      confirmTitle: 'Restaurar Referral?',
    },

    restoreMany: {
      success: 'Referral(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um referral para restaurar.',
      confirmTitle: 'Restaurar Referral(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} referral(es) selecionados?',
    },

    archiveMany: {
      success: 'Referral(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um referral para arquivar.',
      confirmTitle: 'Arquivar Referral(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} referral(es) selecionados?',
    },

    archive: {
      success: 'Referral arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um referral para arquivar.',
      confirmTitle: 'Arquivar Referral?',
    },

    destroyMany: {
      success: 'Referral(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Referral para excluir.',
      confirmTitle: 'Excluir Referral(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Referral(es) selecionados?',
    },

    destroy: {
      success: 'Referral excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Referral para excluir.',
      confirmTitle: 'Excluir Referral?',
    },

    fields: {
      referrerUserId: 'ReferrerUserId',
      referredUserId: 'ReferredUserId',
      referralCode: 'ReferralCode',
      source: 'Source',
      status: 'Status',
      rewardType: 'RewardType',
      rewardAmount: 'RewardAmount',
      rewardCurrency: 'RewardCurrency',
      rewardedAt: 'RewardedAt',
      meta: 'Meta',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      referrerUserId: '',
      referredUserId: '',
      referralCode: '',
      source: '',
      status: '',
      rewardType: '',
      rewardAmount: '',
      rewardCurrency: '',
      rewardedAt: '',
      meta: '',

    },

    enumerators: {
      source: {
        link: 'Link',
        email: 'Email',
        promo: 'Promo',
        manual: 'Manual',
      },

      status: {
        pending: 'Pending',
        activated: 'Activated',
        rewarded: 'Rewarded',
        expired: 'Expired',
      },

      rewardType: {
        fee_rebate: 'Fee_rebate',
        credit: 'Credit',
        token: 'Token',
      },
    },
  },

  listing: {
    label: 'Listing',

    dashboardCard: {
      title: 'Listings',
    },

    list: {
      menu: 'Listings',
      title: 'Listings',
      noResults: 'Nenhum listings encontrado.',
    },

    export: {
      success: 'Listings exportados com sucesso',
    },

    new: {
      menu: 'Novo Listing',
      title: 'Novo Listing',
      success: 'Listing criado com sucesso',
    },

    view: {
      title: 'Ver Listing',
    },

    edit: {
      menu: 'Editar Listing',
      title: 'Editar Listing',
      success: 'Listing atualizado com sucesso',
    },

    restore: {
      success: 'Listing restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um listing para restaurar.',
      confirmTitle: 'Restaurar Listing?',
    },

    restoreMany: {
      success: 'Listing(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um listing para restaurar.',
      confirmTitle: 'Restaurar Listing(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} listing(es) selecionados?',
    },

    archiveMany: {
      success: 'Listing(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um listing para arquivar.',
      confirmTitle: 'Arquivar Listing(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} listing(es) selecionados?',
    },

    archive: {
      success: 'Listing arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um listing para arquivar.',
      confirmTitle: 'Arquivar Listing?',
    },

    destroyMany: {
      success: 'Listing(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Listing para excluir.',
      confirmTitle: 'Excluir Listing(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Listing(es) selecionados?',
    },

    destroy: {
      success: 'Listing excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Listing para excluir.',
      confirmTitle: 'Excluir Listing?',
    },

    fields: {
      companyName: 'CompanyName',
      legalName: 'LegalName',
      jurisdiction: 'Jurisdiction',
      incorporationDate: 'IncorporationDate',
      website: 'Website',
      assetSymbol: 'AssetSymbol',
      assetClass: 'AssetClass',
      status: 'Status',
      submittedAt: 'SubmittedAt',
      decisionAt: 'DecisionAt',
      kycCompleted: 'KycCompleted',
      docsSubmitted: 'DocsSubmitted',
      riskDisclosureUrl: 'RiskDisclosureUrl',
      primaryContactName: 'PrimaryContactName',
      primaryContactEmail: 'PrimaryContactEmail',
      reviewedBy: 'ReviewedBy',
      notes: 'Notes',
      meta: 'Meta',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      companyName: '',
      legalName: '',
      jurisdiction: '',
      incorporationDate: '',
      website: '',
      assetSymbol: '',
      assetClass: '',
      status: '',
      submittedAt: '',
      decisionAt: '',
      kycCompleted: '',
      docsSubmitted: '',
      riskDisclosureUrl: '',
      primaryContactName: '',
      primaryContactEmail: '',
      reviewedBy: '',
      notes: '',
      meta: '',

    },

    enumerators: {
      assetClass: {
        equity: 'Equity',
        crypto: 'Crypto',
      },

      status: {
        applied: 'Applied',
        under_review: 'Under_review',
        approved: 'Approved',
        rejected: 'Rejected',
        listed: 'Listed',
      },
    },
  },

  feedback: {
    label: 'Feedback',

    dashboardCard: {
      title: 'Feedbacks',
    },

    list: {
      menu: 'Feedbacks',
      title: 'Feedbacks',
      noResults: 'Nenhum feedbacks encontrado.',
    },

    export: {
      success: 'Feedbacks exportados com sucesso',
    },

    new: {
      menu: 'Novo Feedback',
      title: 'Novo Feedback',
      success: 'Feedback criado com sucesso',
    },

    view: {
      title: 'Ver Feedback',
    },

    edit: {
      menu: 'Editar Feedback',
      title: 'Editar Feedback',
      success: 'Feedback atualizado com sucesso',
    },

    restore: {
      success: 'Feedback restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feedback para restaurar.',
      confirmTitle: 'Restaurar Feedback?',
    },

    restoreMany: {
      success: 'Feedback(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feedback para restaurar.',
      confirmTitle: 'Restaurar Feedback(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} feedback(es) selecionados?',
    },

    archiveMany: {
      success: 'Feedback(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feedback para arquivar.',
      confirmTitle: 'Arquivar Feedback(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} feedback(es) selecionados?',
    },

    archive: {
      success: 'Feedback arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um feedback para arquivar.',
      confirmTitle: 'Arquivar Feedback?',
    },

    destroyMany: {
      success: 'Feedback(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Feedback para excluir.',
      confirmTitle: 'Excluir Feedback(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Feedback(es) selecionados?',
    },

    destroy: {
      success: 'Feedback excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Feedback para excluir.',
      confirmTitle: 'Excluir Feedback?',
    },

    fields: {
      title: 'Title',
      description: 'Description',
      attachments: 'Attachments',
      type: 'Type',
      status: 'Status',
      json: 'Json',
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
      description: '',
      attachments: '',
      type: '',
      status: '',
      json: '',
      user: '',
    },

    enumerators: {
      type: {
        feature_request: 'Feature_request',
        bug_report: 'Bug_report',
      },

      status: {
        submitted: 'Submitted',
        reviewed: 'Reviewed',
        completed: 'Completed',
        rejected: 'Rejected',
        pending: 'Pending',
      },
    },
  },

  marketMaker: {
    label: 'MarketMaker',

    dashboardCard: {
      title: 'MarketMakers',
    },

    list: {
      menu: 'MarketMakers',
      title: 'MarketMakers',
      noResults: 'Nenhum marketmakers encontrado.',
    },

    export: {
      success: 'MarketMakers exportados com sucesso',
    },

    new: {
      menu: 'Novo MarketMaker',
      title: 'Novo MarketMaker',
      success: 'MarketMaker criado com sucesso',
    },

    view: {
      title: 'Ver MarketMaker',
    },

    edit: {
      menu: 'Editar MarketMaker',
      title: 'Editar MarketMaker',
      success: 'MarketMaker atualizado com sucesso',
    },

    restore: {
      success: 'MarketMaker restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um marketmaker para restaurar.',
      confirmTitle: 'Restaurar MarketMaker?',
    },

    restoreMany: {
      success: 'MarketMaker(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um marketmaker para restaurar.',
      confirmTitle: 'Restaurar MarketMaker(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} marketmaker(es) selecionados?',
    },

    archiveMany: {
      success: 'MarketMaker(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um marketmaker para arquivar.',
      confirmTitle: 'Arquivar MarketMaker(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} marketmaker(es) selecionados?',
    },

    archive: {
      success: 'MarketMaker arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um marketmaker para arquivar.',
      confirmTitle: 'Arquivar MarketMaker?',
    },

    destroyMany: {
      success: 'MarketMaker(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um MarketMaker para excluir.',
      confirmTitle: 'Excluir MarketMaker(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} MarketMaker(es) selecionados?',
    },

    destroy: {
      success: 'MarketMaker excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um MarketMaker para excluir.',
      confirmTitle: 'Excluir MarketMaker?',
    },

    fields: {
      organizationName: 'OrganizationName',
      contactEmail: 'ContactEmail',
      contactPhone: 'ContactPhone',
      status: 'Status',
      tier: 'Tier',
      marketsSupported: 'MarketsSupported',
      minQuoteSize: 'MinQuoteSize',
      maxQuoteSize: 'MaxQuoteSize',
      spreadLimit: 'SpreadLimit',
      quoteObligation: 'QuoteObligation',
      dailyVolumeTarget: 'DailyVolumeTarget',
      makerFee: 'MakerFee',
      takerFee: 'TakerFee',
      rebateRate: 'RebateRate',
      rebateBalance: 'RebateBalance',
      apiAccess: 'ApiAccess',
      maxOrdersPerSecond: 'MaxOrdersPerSecond',
      directMarketAccess: 'DirectMarketAccess',
      contractSignedAt: 'ContractSignedAt',
      obligationViolationCount: 'ObligationViolationCount',
      auditLog: 'AuditLog',
      notesInternal: 'NotesInternal',
      specialOrderTypes: 'SpecialOrderTypes',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      organizationName: '',
      contactEmail: '',
      contactPhone: '',
      status: '',
      tier: '',
      marketsSupported: '',
      minQuoteSize: '',
      maxQuoteSize: '',
      spreadLimit: '',
      quoteObligation: '',
      dailyVolumeTarget: '',
      makerFee: '',
      takerFee: '',
      rebateRate: '',
      rebateBalance: '',
      apiAccess: '',
      maxOrdersPerSecond: '',
      directMarketAccess: '',
      contractSignedAt: '',
      obligationViolationCount: '',
      auditLog: '',
      notesInternal: '',
      specialOrderTypes: '',

    },

    enumerators: {
      status: {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
      },

      tier: {
        standard: 'Standard',
        premium: 'Premium',
        institutional: 'Institutional',
      },

      specialOrderTypes: {
        LIMIT: 'LIMIT',
        MARKET: 'MARKET',
        IOC: 'IOC',
        FOK: 'FOK',
        GTC: 'GTC',
        GTD: 'GTD',
        DAY: 'DAY',
        STOP: 'STOP',
        STOP_LIMIT: 'STOP_LIMIT',
        TRAILING_STOP: 'TRAILING_STOP',
        TRAILING_STOP_LIMIT: 'TRAILING_STOP_LIMIT',
        ICEBERG: 'ICEBERG',
        TWAP: 'TWAP',
        VWAP: 'VWAP',
        POV: 'POV',
        BLOCK: 'BLOCK',
        QUOTE: 'QUOTE',
        LIQUIDITY_PROVISION: 'LIQUIDITY_PROVISION',
        PEGGED: 'PEGGED',
        MATCHING_ENGINE_DIRECT: 'MATCHING_ENGINE_DIRECT',
        RFQ_RESPONSE: 'RFQ_RESPONSE',
        CONDITIONAL_CANCEL: 'CONDITIONAL_CANCEL',
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
      referenceId: 'ReferenceId',
      referenceType: 'ReferenceType',
      status: 'Status',
      description: 'Description',
      meta: 'Meta',
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
      referenceId: '',
      referenceType: '',
      status: '',
      description: '',
      meta: '',
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
        transfer: 'Transfer',
        reversal: 'Reversal',
      },

      referenceType: {
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        order: 'Order',
        trade: 'Trade',
        manual_adjustment: 'Manual_adjustment',
      },

      status: {
        pending: 'Pending',
        posted: 'Posted',
        reversed: 'Reversed',
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
      accountId: 'AccountId',
      meta: 'Meta',
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
      accountId: '',
      meta: '',
      event: '',
    },

    enumerators: {

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
      type: 'Type',
      images: 'Images',
      files: 'Files',
      meta: 'Meta',
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
      type: '',
      images: '',
      files: '',
      meta: '',
      user: '',
    },

    enumerators: {

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
      files: 'Files',
      images: 'Images',
      type: 'Type',
      meta: 'Meta',
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
      files: '',
      images: '',
      type: '',
      meta: '',
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
      type: 'Type',
      images: 'Images',
      meta: 'Meta',
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
      type: '',
      images: '',
      meta: '',
      user: '',
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
      chaters: 'Chaters',
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
      chaters: '',
    },

    enumerators: {

    },
  },

  chater: {
    label: 'Chater',

    dashboardCard: {
      title: 'Chaters',
    },

    list: {
      menu: 'Chaters',
      title: 'Chaters',
      noResults: 'Nenhum chaters encontrado.',
    },

    export: {
      success: 'Chaters exportados com sucesso',
    },

    new: {
      menu: 'Novo Chater',
      title: 'Novo Chater',
      success: 'Chater criado com sucesso',
    },

    view: {
      title: 'Ver Chater',
    },

    edit: {
      menu: 'Editar Chater',
      title: 'Editar Chater',
      success: 'Chater atualizado com sucesso',
    },

    restore: {
      success: 'Chater restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chater para restaurar.',
      confirmTitle: 'Restaurar Chater?',
    },

    restoreMany: {
      success: 'Chater(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chater para restaurar.',
      confirmTitle: 'Restaurar Chater(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} chater(es) selecionados?',
    },

    archiveMany: {
      success: 'Chater(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chater para arquivar.',
      confirmTitle: 'Arquivar Chater(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} chater(es) selecionados?',
    },

    archive: {
      success: 'Chater arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um chater para arquivar.',
      confirmTitle: 'Arquivar Chater?',
    },

    destroyMany: {
      success: 'Chater(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Chater para excluir.',
      confirmTitle: 'Excluir Chater(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Chater(es) selecionados?',
    },

    destroy: {
      success: 'Chater excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Chater para excluir.',
      confirmTitle: 'Excluir Chater?',
    },

    fields: {
      nickname: 'Nickname',
      status: 'Status',
      role: 'Role',
      meta: 'Meta',
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
      meta: '',
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
      chater: 'Chater',
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
      chater: '',
      sender: '',
    },

    enumerators: {

    },
  },

  notification: {
    label: 'Notification',

    dashboardCard: {
      title: 'Notifications',
    },

    list: {
      menu: 'Notifications',
      title: 'Notifications',
      noResults: 'Nenhum notifications encontrado.',
    },

    export: {
      success: 'Notifications exportados com sucesso',
    },

    new: {
      menu: 'Novo Notification',
      title: 'Novo Notification',
      success: 'Notification criado com sucesso',
    },

    view: {
      title: 'Ver Notification',
    },

    edit: {
      menu: 'Editar Notification',
      title: 'Editar Notification',
      success: 'Notification atualizado com sucesso',
    },

    restore: {
      success: 'Notification restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um notification para restaurar.',
      confirmTitle: 'Restaurar Notification?',
    },

    restoreMany: {
      success: 'Notification(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um notification para restaurar.',
      confirmTitle: 'Restaurar Notification(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} notification(es) selecionados?',
    },

    archiveMany: {
      success: 'Notification(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um notification para arquivar.',
      confirmTitle: 'Arquivar Notification(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} notification(es) selecionados?',
    },

    archive: {
      success: 'Notification arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um notification para arquivar.',
      confirmTitle: 'Arquivar Notification?',
    },

    destroyMany: {
      success: 'Notification(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Notification para excluir.',
      confirmTitle: 'Excluir Notification(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Notification(es) selecionados?',
    },

    destroy: {
      success: 'Notification excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Notification para excluir.',
      confirmTitle: 'Excluir Notification?',
    },

    fields: {
      type: 'Type',
      severity: 'Severity',
      title: 'Title',
      body: 'Body',
      actionUrl: 'ActionUrl',
      scope: 'Scope',
      targetUserId: 'TargetUserId',
      targetSegment: 'TargetSegment',
      persistent: 'Persistent',
      dismissible: 'Dismissible',
      requiresAck: 'RequiresAck',
      meta: 'Meta',
      userNotifications: 'UserNotifications',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      type: '',
      severity: '',
      title: '',
      body: '',
      actionUrl: '',
      scope: '',
      targetUserId: '',
      targetSegment: '',
      persistent: '',
      dismissible: '',
      requiresAck: '',
      meta: '',
      userNotifications: '',
    },

    enumerators: {
      type: {
        system: 'System',
        security: 'Security',
        marketing: 'Marketing',
        trading: 'Trading',
        compliance: 'Compliance',
      },

      severity: {
        info: 'Info',
        warning: 'Warning',
        critical: 'Critical',
      },

      scope: {
        global: 'Global',
        user: 'User',
        segment: 'Segment',
      },
    },
  },

  userNotification: {
    label: 'UserNotification',

    dashboardCard: {
      title: 'UserNotifications',
    },

    list: {
      menu: 'UserNotifications',
      title: 'UserNotifications',
      noResults: 'Nenhum usernotifications encontrado.',
    },

    export: {
      success: 'UserNotifications exportados com sucesso',
    },

    new: {
      menu: 'Novo UserNotification',
      title: 'Novo UserNotification',
      success: 'UserNotification criado com sucesso',
    },

    view: {
      title: 'Ver UserNotification',
    },

    edit: {
      menu: 'Editar UserNotification',
      title: 'Editar UserNotification',
      success: 'UserNotification atualizado com sucesso',
    },

    restore: {
      success: 'UserNotification restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um usernotification para restaurar.',
      confirmTitle: 'Restaurar UserNotification?',
    },

    restoreMany: {
      success: 'UserNotification(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um usernotification para restaurar.',
      confirmTitle: 'Restaurar UserNotification(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} usernotification(es) selecionados?',
    },

    archiveMany: {
      success: 'UserNotification(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um usernotification para arquivar.',
      confirmTitle: 'Arquivar UserNotification(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} usernotification(es) selecionados?',
    },

    archive: {
      success: 'UserNotification arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um usernotification para arquivar.',
      confirmTitle: 'Arquivar UserNotification?',
    },

    destroyMany: {
      success: 'UserNotification(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um UserNotification para excluir.',
      confirmTitle: 'Excluir UserNotification(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} UserNotification(es) selecionados?',
    },

    destroy: {
      success: 'UserNotification excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um UserNotification para excluir.',
      confirmTitle: 'Excluir UserNotification?',
    },

    fields: {
      readAt: 'ReadAt',
      dismissedAt: 'DismissedAt',
      acknowledgedAt: 'AcknowledgedAt',
      deliveryChannel: 'DeliveryChannel',
      deliveredAt: 'DeliveredAt',
      meta: 'Meta',
      notification: 'Notification',
      user: 'User',
      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      readAt: '',
      dismissedAt: '',
      acknowledgedAt: '',
      deliveryChannel: '',
      deliveredAt: '',
      meta: '',
      notification: '',
      user: '',
    },

    enumerators: {
      deliveryChannel: {
        in_app: 'In_app',
        email: 'Email',
        push: 'Push',
      },
    },
  },

  job: {
    label: 'Job',

    dashboardCard: {
      title: 'Jobs',
    },

    list: {
      menu: 'Jobs',
      title: 'Jobs',
      noResults: 'Nenhum jobs encontrado.',
    },

    export: {
      success: 'Jobs exportados com sucesso',
    },

    new: {
      menu: 'Novo Job',
      title: 'Novo Job',
      success: 'Job criado com sucesso',
    },

    view: {
      title: 'Ver Job',
    },

    edit: {
      menu: 'Editar Job',
      title: 'Editar Job',
      success: 'Job atualizado com sucesso',
    },

    restore: {
      success: 'Job restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um job para restaurar.',
      confirmTitle: 'Restaurar Job?',
    },

    restoreMany: {
      success: 'Job(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um job para restaurar.',
      confirmTitle: 'Restaurar Job(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} job(es) selecionados?',
    },

    archiveMany: {
      success: 'Job(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um job para arquivar.',
      confirmTitle: 'Arquivar Job(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} job(es) selecionados?',
    },

    archive: {
      success: 'Job arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um job para arquivar.',
      confirmTitle: 'Arquivar Job?',
    },

    destroyMany: {
      success: 'Job(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Job para excluir.',
      confirmTitle: 'Excluir Job(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Job(es) selecionados?',
    },

    destroy: {
      success: 'Job excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Job para excluir.',
      confirmTitle: 'Excluir Job?',
    },

    fields: {
      title: 'Title',
      team: 'Team',
      location: 'Location',
      type: 'Type',
      remote: 'Remote',
      description: 'Description',
      requirements: 'Requirements',
      responsibilities: 'Responsibilities',
      quantity: 'Quantity',
      salaryLow: 'SalaryLow',
      salaryHigh: 'SalaryHigh',
      status: 'Status',
      seniority: 'Seniority',
      currency: 'Currency',
      meta: 'Meta',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      title: '',
      team: '',
      location: '',
      type: '',
      remote: '',
      description: '',
      requirements: '',
      responsibilities: '',
      quantity: '',
      salaryLow: '',
      salaryHigh: '',
      status: '',
      seniority: '',
      currency: '',
      meta: '',

    },

    enumerators: {
      type: {
        full_time: 'Full_time',
        part_time: 'Part_time',
        contract: 'Contract',
        internship: 'Internship',
      },

      status: {
        draft: 'Draft',
        published: 'Published',
        paused: 'Paused',
        closed: 'Closed',
      },

      seniority: {
        intern: 'Intern',
        junior: 'Junior',
        mid: 'Mid',
        senior: 'Senior',
        staff: 'Staff',
        founding: 'Founding',
      },
    },
  },

  candidate: {
    label: 'Candidate',

    dashboardCard: {
      title: 'Candidates',
    },

    list: {
      menu: 'Candidates',
      title: 'Candidates',
      noResults: 'Nenhum candidates encontrado.',
    },

    export: {
      success: 'Candidates exportados com sucesso',
    },

    new: {
      menu: 'Novo Candidate',
      title: 'Novo Candidate',
      success: 'Candidate criado com sucesso',
    },

    view: {
      title: 'Ver Candidate',
    },

    edit: {
      menu: 'Editar Candidate',
      title: 'Editar Candidate',
      success: 'Candidate atualizado com sucesso',
    },

    restore: {
      success: 'Candidate restaurado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um candidate para restaurar.',
      confirmTitle: 'Restaurar Candidate?',
    },

    restoreMany: {
      success: 'Candidate(es) restaurado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um candidate para restaurar.',
      confirmTitle: 'Restaurar Candidate(es)?',
      confirmDescription:
        'Tem certeza de que deseja restaurar os {0} candidate(es) selecionados?',
    },

    archiveMany: {
      success: 'Candidate(es) arquivado(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um candidate para arquivar.',
      confirmTitle: 'Arquivar Candidate(es)?',
      confirmDescription:
        'Tem certeza de que deseja arquivar os {0} candidate(es) selecionados?',
    },

    archive: {
      success: 'Candidate arquivado com sucesso',
      noSelection: 'Você deve selecionar pelo menos um candidate para arquivar.',
      confirmTitle: 'Arquivar Candidate?',
    },

    destroyMany: {
      success: 'Candidate(es) excluído(s) com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Candidate para excluir.',
      confirmTitle: 'Excluir Candidate(es)?',
      confirmDescription:
        'Tem certeza de que deseja excluir os {0} Candidate(es) selecionados?',
    },

    destroy: {
      success: 'Candidate excluído com sucesso',
      noSelection: 'Você deve selecionar pelo menos um Candidate para excluir.',
      confirmTitle: 'Excluir Candidate?',
    },

    fields: {
      firstName: 'FirstName',
      lastName: 'LastName',
      preferredName: 'PreferredName',
      email: 'Email',
      phone: 'Phone',
      country: 'Country',
      timezone: 'Timezone',
      linkedinUrl: 'LinkedinUrl',
      githubUrl: 'GithubUrl',
      portfolioUrl: 'PortfolioUrl',
      resumeUrl: 'ResumeUrl',
      resume: 'Resume',
      meta: 'Meta',

      createdByMembership: 'Criado Por',
      updatedByMembership: 'Atualizado Por',
      archivedByMembership: 'Arquivado Por',
      createdAt: 'Criado em',
      updatedAt: 'Atualizado em',
      archivedAt: 'Arquivado em',
    },

    hints: {
      firstName: '',
      lastName: '',
      preferredName: '',
      email: '',
      phone: '',
      country: '',
      timezone: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      resumeUrl: '',
      resume: '',
      meta: '',

    },

    enumerators: {

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
