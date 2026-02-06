const dictionary = {
  

  projectName: 'Proyecto',

  shared: {
    showArchived: 'Mostrar Archivados?',
    archive: 'Archivar',
    restore: 'Restaurar',
    archived: 'Archivado',
    yes: 'Sí',
    no: 'No',
    cancel: 'Cancelar',
    save: 'Guardar',
    clear: 'Limpiar',
    decline: 'Rechazar',
    accept: 'Aceptar',
    dashboard: 'Tablero',
    new: 'Nuevo',
    searchNotFound: 'Nada encontrado.',
    searchPlaceholder: 'Buscar...',
    selectPlaceholder: 'Seleccionar una opción',
    datePlaceholder: 'Elegir una fecha',
    timePlaceholder: 'Elegir una hora',
    dateFormat: 'DD MMM, YYYY',
    timeFormat: 'HH:mm',
    datetimeFormat: 'DD MMM, YYYY HH:mm',
    tagsPlaceholder: 'Escriba y presione enter para agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    openMenu: 'Abrir menú',
    submit: 'Enviar',
    search: 'Buscar',
    reset: 'Restablecer',
    min: 'Mín',
    max: 'Máx',
    view: 'Ver',
    copiedToClipboard: 'Copiado al portapapeles',
    exportToCsv: 'Exportar a CSV',
    import: 'Importar',
    pause: 'Pausar',
    discard: 'Descartar',
    preferences: 'Preferencias',
    session: 'Sesión',
    deleted: 'Eliminado',
    remove: 'Remover',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de finalización',

    unsavedChanges: {
      message: 'Tienes cambios sin guardar.',
      proceed: 'Descartar',
      dismiss: 'Cancelar',
      saveChanges: 'Guardar cambios',
    },

    importer: {
      importHashAlreadyExists: 'Los datos ya han sido importados',
      title: 'Importar archivo CSV',
      menu: 'Importar archivo CSV',
      line: 'Línea',
      status: 'Estado',
      pending: 'Pendiente',
      success: 'Importado',
      error: 'Error',
      total: `{0} importados, {1} pendientes y {2} con error`,
      importedMessage: `Procesado {0} de {1}.`,
      noValidRows: 'No hay filas válidas.',
      noNavigateAwayMessage:
        'No se aleje de esta página o la importación se detendrá.',
      completed: {
        success:
          'Importación completa. Todas las filas se importaron con éxito.',
        someErrors:
          'Procesamiento completado, pero algunas filas no pudieron ser importadas.',
        allErrors: 'La importación falló. No hay filas válidas.',
      },
      form: {
        downloadTemplate: 'Descargar la plantilla',
      },
      list: {
        newConfirm: '¿Estás seguro?',
        discardConfirm: '¿Estás seguro? Los datos no importados se perderán.',
      },
      errors: {
        invalidFileEmpty: 'El archivo está vacío',
        invalidFileCsv: 'Solo se permiten archivos CSV (.csv)',
        invalidFileUpload:
          'Archivo inválido. Asegúrese de estar utilizando la última versión de la plantilla.',
        importHashRequired: 'Se requiere el hash de importación',
        importHashExistent: 'Los datos ya han sido importados',
      },
    },

    dataTable: {
      filters: 'Filtros',
      noResults: 'No se encontraron resultados.',
      viewOptions: 'Ver',
      toggleColumns: 'Alternar columnas',
      actions: 'Acciones',

      sortAscending: 'Asc',
      sortDescending: 'Desc',
      hide: 'Ocultar',

      selectAll: 'Seleccionar todo',
      selectRow: 'Seleccionar fila',
      paginationTotal: 'Total: {0} fila(s)',
      paginationSelected: '{0} fila(s) seleccionada(s).',
      paginationRowsPerPage: 'Filas por página',
      paginationCurrent: `Página {0} de {1}`,
      paginationGoToFirst: 'Ir a la primera página',
      paginationGoToPrevious: 'Ir a la página anterior',
      paginationGoToNext: 'Ir a la siguiente página',
      paginationGoToLast: 'Ir a la última página',
    },

    locales: {
      en: 'Inglés',
      es: 'Español',
      de: 'Alemán',
      'pt-BR': 'Portugués (Brasil)',
    },

    localeSwitcher: {
      searchPlaceholder: 'Buscar idioma...',
      title: 'Idioma',
      placeholder: 'Seleccionar un idioma',
      searchEmpty: 'No se encontró el idioma.',
    },

    theme: {
      toggle: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },

    errors: {
      cannotDeleteReferenced: `No se puede eliminar {0} porque está referenciado por uno o más {1}.`,
      timezone: 'Zona horaria inválida',
      required: `{0} es un campo obligatorio`,
      invalid: `{0} es inválido`,
      dateFuture: `{0} debe estar en el futuro`,
      unknown: 'Ocurrió un error',
      unique: 'El {0} ya existe',
    },
  },

  apiKey: {
    docs: {
      menu: 'Documentación de API',
    },
    form: {
      addAll: 'Añadir Todo',
    },
    edit: {
      menu: 'Editar Clave de API',
      title: 'Editar Clave de API',
      success: 'Clave de API actualizada exitosamente',
    },
    new: {
      menu: 'Nueva Clave de API',
      title: 'Nueva Clave de API',
      success: 'Clave de API creada exitosamente',
      text: `¡Guarda tu clave de API! Por razones de seguridad, solo podrás ver la clave de API una vez.`,
      subtext: `Debes añadirla al encabezado de autorización de tus llamadas a la API.`,
      backToApiKeys: 'Volver a Claves de API',
    },
    list: {
      menu: 'Claves de API',
      title: 'Claves de API',
      viewActivity: 'Ver Actividad',
      noResults: 'No se encontraron claves de API.',
    },
    destroy: {
      confirmTitle: '¿Eliminar Clave de API?',
      success: 'Clave de API eliminada exitosamente',
    },
    enumerators: {
      status: {
        active: 'Activo',
        disabled: 'Deshabilitado',
        expired: 'Expirado',
      },
    },
    fields: {
      apiKey: 'Clave de API',
      membership: 'Usuario',
      name: 'Nombre',
      keyPrefix: 'Prefijo de Clave',
      key: 'Clave',
      scopes: 'Alcances',
      expiresAt: 'Expira En',
      status: 'Estado',
      createdAt: 'Creado En',
      disabled: 'Deshabilitado',
    },
    disabledTooltip: `Deshabilitado en {0}.`,
    errors: {
      invalidScopes: 'los alcances deben coincidir con el rol del usuario',
    },
  },

  file: {
    button: 'Subir',
    delete: 'Eliminar',
    errors: {
      formats: `Formato no válido. Debe ser uno de: {0}.`,
      notImage: `El archivo debe ser una imagen`,
      tooBig: `El archivo es demasiado grande. El tamaño actual es {0} bytes, el tamaño máximo es {1} bytes`,
    },
  },

  auth: {
    signIn: {
      oauthError:
        'No es posible iniciar sesión con este proveedor. Utiliza otro.',
      title: 'Iniciar Sesión',
      button: 'Iniciar Sesión con Correo',
      success: 'Inicio de sesión exitoso',
      email: 'Correo',
      password: 'Contraseña',
      socialHeader: 'O continuar con',
      facebook: 'Facebook',
      github: 'GitHub',
      google: 'Google',
      passwordResetRequestLink: '¿Olvidaste tu contraseña?',
      signUpLink: '¿No tienes una cuenta? Crea una',
    },
    signUp: {
      title: 'Registrarse',
      signInLink: '¿Ya tienes una cuenta? Inicia sesión',
      button: 'Registrarse',
      success: 'Registro exitoso',
      email: 'Correo',
      password: 'Contraseña',
    },
    verifyEmailRequest: {
      title: 'Reenviar verificación de correo',
      button: 'Reenviar verificación de correo',
      message:
        'Por favor confirma tu correo en <strong>{0}</strong> para continuar.',
      success: 'Verificación de correo enviada exitosamente',
    },
    verifyEmailConfirm: {
      title: 'Verifica tu correo',
      success: 'Correo verificado exitosamente',
      loadingMessage: 'Un momento, tu correo está siendo verificado...',
    },
    passwordResetRequest: {
      title: 'Olvidé mi Contraseña',
      signInLink: 'Cancelar',
      button: 'Enviar correo para restablecer contraseña',
      email: 'Correo',
      success: 'Correo para restablecer contraseña enviado exitosamente',
    },
    passwordResetConfirm: {
      title: 'Restablecer Contraseña',
      signInLink: 'Cancelar',
      button: 'Restablecer Contraseña',
      password: 'Contraseña',
      success: 'Contraseña cambiada exitosamente',
    },
    noPermissions: {
      title: 'Esperando Permisos',
      message:
        'Todavía no tienes permisos. Por favor espera a que el administrador te conceda privilegios.',
    },
    invitation: {
      title: 'Invitaciones',
      success: 'Invitación aceptada exitosamente',
      acceptWrongEmail: 'Aceptar Invitación con Este Correo',
      loadingMessage: 'Un momento, estamos aceptando la invitación...',
      invalidToken: 'Token de invitación expirado o inválido.',
    },
    tenant: {
      title: 'Espacios de Trabajo',
      create: {
        name: 'Nombre del Espacio de Trabajo',
        success: 'Espacio de trabajo creado exitosamente',
        button: 'Crear Espacio de Trabajo',
      },
      select: {
        tenant: 'Selecciona un Espacio de Trabajo',
        joinSuccess: 'Te has unido al espacio de trabajo exitosamente',
        select: 'Seleccionar Espacio de Trabajo',
        acceptInvitation: 'Aceptar Invitación',
      },
    },
    passwordChange: {
      title: 'Cambiar Contraseña',
      subtitle: 'Por favor proporciona tu contraseña anterior y la nueva.',
      menu: 'Cambiar Contraseña',
      oldPassword: 'Contraseña Anterior',
      newPassword: 'Nueva Contraseña',
      newPasswordConfirmation: 'Confirmación de Nueva Contraseña',
      button: 'Guardar Contraseña',
      success: 'Contraseña cambiada y guardada exitosamente',
      mustMatch: 'Las contraseñas deben coincidir',
      cancel: 'Cancelar',
    },
    profile: {
      title: 'Perfil',
      subtitle:
        'Tu perfil será compartido entre otros usuarios en tu espacio de trabajo.',
      menu: 'Perfil',
      firstName: 'Nombre',
      lastName: 'Apellido',
      avatars: 'Avatar',
      button: 'Guardar Perfil',
      success: 'Perfil guardado exitosamente',
      cancel: 'Cancelar',
    },
    profileOnboard: {
      title: 'Perfil',
      firstName: 'Nombre',
      lastName: 'Apellido',
      avatars: 'Avatar',
      button: 'Guardar Perfil',
      success: 'Perfil guardado exitosamente',
    },
    signOut: {
      menu: 'Cerrar Sesión',
      button: 'Cerrar Sesión',
      title: 'Cerrar Sesión',
      loading: 'Se le está desconectand...',
    },
    errors: {
      invalidApiKey: 'Clave API inválida o expirada',
      emailNotFound: 'Correo no encontrado',
      userNotFound: 'Lo siento, no reconocemos tus credenciales',
      wrongPassword: 'Lo siento, no reconocemos tus credenciales',
      weakPassword: 'Esta contraseña es demasiado débil',
      emailAlreadyInUse: 'Correo ya en uso',
      invalidPasswordResetToken:
        'Enlace para restablecer contraseña inválido o expirado',
      invalidVerifyEmailToken:
        'Enlace para verificar correo inválido o expirado',
      wrongOldPassword: 'La contraseña anterior es incorrecta',
    },
  },

  tenant: {
    switcher: {
      title: 'Espacios de trabajo',
      placeholder: 'Selecciona un espacio de trabajo',
      searchPlaceholder: 'Buscar espacio de trabajo...',
      searchEmpty: 'Ningún espacio de trabajo encontrado.',
      create: 'Crear espacio de trabajo',
    },

    invite: {
      title: `Aceptar invitación a {0}`,
      message: `Has sido invitado a {0}. Puedes elegir aceptar o rechazar.`,
    },

    form: {
      name: 'Nombre',

      new: {
        title: 'Crear espacio de trabajo',
        success: 'Espacio de trabajo creado con éxito',
      },

      edit: {
        title: 'Configuración del espacio de trabajo',
        success: 'Espacio de trabajo actualizado con éxito',
      },
    },

    destroy: {
      success: 'Espacio de trabajo eliminado exitosamente',
      confirmTitle: '¿Eliminar Espacio de Trabajo?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar el espacio de trabajo {0}? ¡Esta acción es irreversible!',
    },
  },

  membership: {
    dashboardCard: {
      title: 'Usuarios',
    },

    view: {
      title: 'Ver Usuario',
    },

    showActivity: 'Actividad',

    list: {
      menu: 'Usuarios',
      title: 'Usuarios',
      noResults: 'No se encontraron usuarios.',
    },

    export: {
      success: 'Usuarios exportados exitosamente',
    },

    edit: {
      menu: 'Editar Usuario',
      title: 'Editar Usuario',
      success: 'Usuario actualizado exitosamente',
    },

    new: {
      menu: 'Nuevo Usuario',
      title: 'Nuevo Usuario',
      success: 'Usuario creado exitosamente',
    },

    destroyMany: {
      success: 'Usuario(s) eliminado(s) exitosamente',
      noSelection: 'Debes seleccionar al menos un usuario para eliminar.',
      confirmTitle: '¿Eliminar Usuario(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} usuario(s) seleccionado(s)?',
    },

    destroy: {
      success: 'Usuario eliminado exitosamente',
      noSelection: 'Debes seleccionar al menos un usuario para eliminar.',
      confirmTitle: '¿Eliminar Usuario?',
    },

    resendInvitationEmail: {
      button: 'Reenviar Correo de Invitación',
      success: 'Correo de invitación enviado exitosamente',
    },

    fields: {
      avatars: 'Avatar',
      fullName: 'Nombre Completo',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo Electrónico',
      roles: 'Roles',
      status: 'Estado',
    },

    enumerators: {
      roles: {
        admin: 'Admin',
        custom: 'Custom',
      },

      status: {
        invited: 'Invitado',
        active: 'Activo',
        disabled: 'Deshabilitado',
      },
    },

    errors: {
      cannotRemoveSelfAdminRole: 'No puedes eliminar tu propio rol de admin',
      cannotDeleteSelf: 'No puedes eliminar tu propia membresía',
      notInvited: 'No estás invitado',
      invalidStatus: `Estado inválido: {0}`,
      alreadyMember: `{0} ya es un miembro`,
      notSameEmail: `Esta invitación fue enviada a {0} pero estás ingresado como {1}. ¿Quieres continuar?`,
    },
  },

  subscription: {
    menu: 'Suscripción',
    title: 'Planes y Precios',
    current: 'Plan Actual',

    subscribe: 'Suscribirse',
    manage: 'Administrar',
    notPlanUser: 'No eres el administrador de esta suscripción.',
    cancelAtPeriodEnd: 'Este plan se cancelará al final del período.',

    plans: {
      free: {
        title: 'Gratis',
        price: '$0',
        pricingPeriod: '/mes',
        features: {
          first: 'Descripción de la primera función',
          second: 'Descripción de la segunda función',
          third: 'Descripción de la tercera función',
        },
      },
      basic: {
        title: 'Básico',
        price: '$10',
        pricingPeriod: '/mes',
        features: {
          first: 'Descripción de la primera función',
          second: 'Descripción de la segunda función',
          third: 'Descripción de la tercera función',
        },
      },
      enterprise: {
        title: 'Empresarial',
        price: '$50',
        pricingPeriod: '/mes',
        features: {
          first: 'Descripción de la primera función',
          second: 'Descripción de la segunda función',
          third: 'Descripción de la tercera función',
        },
      },
    },

    errors: {
      disabled: 'Las suscripciones están deshabilitadas en esta plataforma',
      alreadyExistsActive: 'Ya existe una suscripción activa',
      stripeNotConfigured: 'Faltan las variables de entorno de Stripe',
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
      noResults: 'No se encontraron accounts.',
    },

    export: {
      success: 'Accounts exportados con éxito',
    },

    new: {
      menu: 'Nuevo Account',
      title: 'Nuevo Account',
      success: 'Account creado con éxito',
    },

    view: {
      title: 'Ver Account',
    },

    edit: {
      menu: 'Editar Account',
      title: 'Editar Account',
      success: 'Account actualizado con éxito',
    },

    restore: {
      success: 'Account restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un account para restaurar.',
      confirmTitle: '¿Restaurar Account?',
    },

    restoreMany: {
      success: 'Account(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un account para restaurar.',
      confirmTitle: '¿Restaurar Account(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} account(es) seleccionados?',
    },

    archiveMany: {
      success: 'Account(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un account para archivar.',
      confirmTitle: '¿Archivar Account(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} account(es) seleccionados?',
    },

    archive: {
      success: 'Account archivado con éxito',
      noSelection: 'Debe seleccionar al menos un account para archivar.',
      confirmTitle: '¿Archivar Account?',
    },

    destroyMany: {
      success: 'Account(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Account para eliminar.',
      confirmTitle: '¿Eliminar Account(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Account(s) seleccionados?',
    },

    destroy: {
      success: 'Account eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Account para eliminar.',
      confirmTitle: '¿Eliminar Account?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  wallet: {
    label: 'Wallet',

    dashboardCard: {
      title: 'Wallets',
    },

    list: {
      menu: 'Wallets',
      title: 'Wallets',
      noResults: 'No se encontraron wallets.',
    },

    export: {
      success: 'Wallets exportados con éxito',
    },

    new: {
      menu: 'Nuevo Wallet',
      title: 'Nuevo Wallet',
      success: 'Wallet creado con éxito',
    },

    view: {
      title: 'Ver Wallet',
    },

    edit: {
      menu: 'Editar Wallet',
      title: 'Editar Wallet',
      success: 'Wallet actualizado con éxito',
    },

    restore: {
      success: 'Wallet restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un wallet para restaurar.',
      confirmTitle: '¿Restaurar Wallet?',
    },

    restoreMany: {
      success: 'Wallet(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un wallet para restaurar.',
      confirmTitle: '¿Restaurar Wallet(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} wallet(es) seleccionados?',
    },

    archiveMany: {
      success: 'Wallet(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un wallet para archivar.',
      confirmTitle: '¿Archivar Wallet(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} wallet(es) seleccionados?',
    },

    archive: {
      success: 'Wallet archivado con éxito',
      noSelection: 'Debe seleccionar al menos un wallet para archivar.',
      confirmTitle: '¿Archivar Wallet?',
    },

    destroyMany: {
      success: 'Wallet(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Wallet para eliminar.',
      confirmTitle: '¿Eliminar Wallet(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Wallet(s) seleccionados?',
    },

    destroy: {
      success: 'Wallet eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Wallet para eliminar.',
      confirmTitle: '¿Eliminar Wallet?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  deposit: {
    label: 'Deposit',

    dashboardCard: {
      title: 'Deposits',
    },

    list: {
      menu: 'Deposits',
      title: 'Deposits',
      noResults: 'No se encontraron deposits.',
    },

    export: {
      success: 'Deposits exportados con éxito',
    },

    new: {
      menu: 'Nuevo Deposit',
      title: 'Nuevo Deposit',
      success: 'Deposit creado con éxito',
    },

    view: {
      title: 'Ver Deposit',
    },

    edit: {
      menu: 'Editar Deposit',
      title: 'Editar Deposit',
      success: 'Deposit actualizado con éxito',
    },

    restore: {
      success: 'Deposit restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un deposit para restaurar.',
      confirmTitle: '¿Restaurar Deposit?',
    },

    restoreMany: {
      success: 'Deposit(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un deposit para restaurar.',
      confirmTitle: '¿Restaurar Deposit(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} deposit(es) seleccionados?',
    },

    archiveMany: {
      success: 'Deposit(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un deposit para archivar.',
      confirmTitle: '¿Archivar Deposit(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} deposit(es) seleccionados?',
    },

    archive: {
      success: 'Deposit archivado con éxito',
      noSelection: 'Debe seleccionar al menos un deposit para archivar.',
      confirmTitle: '¿Archivar Deposit?',
    },

    destroyMany: {
      success: 'Deposit(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Deposit para eliminar.',
      confirmTitle: '¿Eliminar Deposit(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Deposit(s) seleccionados?',
    },

    destroy: {
      success: 'Deposit eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Deposit para eliminar.',
      confirmTitle: '¿Eliminar Deposit?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron withdrawals.',
    },

    export: {
      success: 'Withdrawals exportados con éxito',
    },

    new: {
      menu: 'Nuevo Withdrawal',
      title: 'Nuevo Withdrawal',
      success: 'Withdrawal creado con éxito',
    },

    view: {
      title: 'Ver Withdrawal',
    },

    edit: {
      menu: 'Editar Withdrawal',
      title: 'Editar Withdrawal',
      success: 'Withdrawal actualizado con éxito',
    },

    restore: {
      success: 'Withdrawal restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un withdrawal para restaurar.',
      confirmTitle: '¿Restaurar Withdrawal?',
    },

    restoreMany: {
      success: 'Withdrawal(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un withdrawal para restaurar.',
      confirmTitle: '¿Restaurar Withdrawal(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} withdrawal(es) seleccionados?',
    },

    archiveMany: {
      success: 'Withdrawal(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un withdrawal para archivar.',
      confirmTitle: '¿Archivar Withdrawal(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} withdrawal(es) seleccionados?',
    },

    archive: {
      success: 'Withdrawal archivado con éxito',
      noSelection: 'Debe seleccionar al menos un withdrawal para archivar.',
      confirmTitle: '¿Archivar Withdrawal?',
    },

    destroyMany: {
      success: 'Withdrawal(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Withdrawal para eliminar.',
      confirmTitle: '¿Eliminar Withdrawal(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Withdrawal(s) seleccionados?',
    },

    destroy: {
      success: 'Withdrawal eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Withdrawal para eliminar.',
      confirmTitle: '¿Eliminar Withdrawal?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  order: {
    label: 'Order',

    dashboardCard: {
      title: 'Orders',
    },

    list: {
      menu: 'Orders',
      title: 'Orders',
      noResults: 'No se encontraron orders.',
    },

    export: {
      success: 'Orders exportados con éxito',
    },

    new: {
      menu: 'Nuevo Order',
      title: 'Nuevo Order',
      success: 'Order creado con éxito',
    },

    view: {
      title: 'Ver Order',
    },

    edit: {
      menu: 'Editar Order',
      title: 'Editar Order',
      success: 'Order actualizado con éxito',
    },

    restore: {
      success: 'Order restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un order para restaurar.',
      confirmTitle: '¿Restaurar Order?',
    },

    restoreMany: {
      success: 'Order(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un order para restaurar.',
      confirmTitle: '¿Restaurar Order(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} order(es) seleccionados?',
    },

    archiveMany: {
      success: 'Order(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un order para archivar.',
      confirmTitle: '¿Archivar Order(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} order(es) seleccionados?',
    },

    archive: {
      success: 'Order archivado con éxito',
      noSelection: 'Debe seleccionar al menos un order para archivar.',
      confirmTitle: '¿Archivar Order?',
    },

    destroyMany: {
      success: 'Order(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Order para eliminar.',
      confirmTitle: '¿Eliminar Order(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Order(s) seleccionados?',
    },

    destroy: {
      success: 'Order eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Order para eliminar.',
      confirmTitle: '¿Eliminar Order?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  asset: {
    label: 'Asset',

    dashboardCard: {
      title: 'Assets',
    },

    list: {
      menu: 'Assets',
      title: 'Assets',
      noResults: 'No se encontraron assets.',
    },

    export: {
      success: 'Assets exportados con éxito',
    },

    new: {
      menu: 'Nuevo Asset',
      title: 'Nuevo Asset',
      success: 'Asset creado con éxito',
    },

    view: {
      title: 'Ver Asset',
    },

    edit: {
      menu: 'Editar Asset',
      title: 'Editar Asset',
      success: 'Asset actualizado con éxito',
    },

    restore: {
      success: 'Asset restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un asset para restaurar.',
      confirmTitle: '¿Restaurar Asset?',
    },

    restoreMany: {
      success: 'Asset(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un asset para restaurar.',
      confirmTitle: '¿Restaurar Asset(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} asset(es) seleccionados?',
    },

    archiveMany: {
      success: 'Asset(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un asset para archivar.',
      confirmTitle: '¿Archivar Asset(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} asset(es) seleccionados?',
    },

    archive: {
      success: 'Asset archivado con éxito',
      noSelection: 'Debe seleccionar al menos un asset para archivar.',
      confirmTitle: '¿Archivar Asset?',
    },

    destroyMany: {
      success: 'Asset(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Asset para eliminar.',
      confirmTitle: '¿Eliminar Asset(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Asset(s) seleccionados?',
    },

    destroy: {
      success: 'Asset eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Asset para eliminar.',
      confirmTitle: '¿Eliminar Asset?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron instruments.',
    },

    export: {
      success: 'Instruments exportados con éxito',
    },

    new: {
      menu: 'Nuevo Instrument',
      title: 'Nuevo Instrument',
      success: 'Instrument creado con éxito',
    },

    view: {
      title: 'Ver Instrument',
    },

    edit: {
      menu: 'Editar Instrument',
      title: 'Editar Instrument',
      success: 'Instrument actualizado con éxito',
    },

    restore: {
      success: 'Instrument restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un instrument para restaurar.',
      confirmTitle: '¿Restaurar Instrument?',
    },

    restoreMany: {
      success: 'Instrument(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un instrument para restaurar.',
      confirmTitle: '¿Restaurar Instrument(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} instrument(es) seleccionados?',
    },

    archiveMany: {
      success: 'Instrument(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un instrument para archivar.',
      confirmTitle: '¿Archivar Instrument(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} instrument(es) seleccionados?',
    },

    archive: {
      success: 'Instrument archivado con éxito',
      noSelection: 'Debe seleccionar al menos un instrument para archivar.',
      confirmTitle: '¿Archivar Instrument?',
    },

    destroyMany: {
      success: 'Instrument(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Instrument para eliminar.',
      confirmTitle: '¿Eliminar Instrument(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Instrument(s) seleccionados?',
    },

    destroy: {
      success: 'Instrument eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Instrument para eliminar.',
      confirmTitle: '¿Eliminar Instrument?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  ledgerEvent: {
    label: 'LedgerEvent',

    dashboardCard: {
      title: 'LedgerEvents',
    },

    list: {
      menu: 'LedgerEvents',
      title: 'LedgerEvents',
      noResults: 'No se encontraron ledgerevents.',
    },

    export: {
      success: 'LedgerEvents exportados con éxito',
    },

    new: {
      menu: 'Nuevo LedgerEvent',
      title: 'Nuevo LedgerEvent',
      success: 'LedgerEvent creado con éxito',
    },

    view: {
      title: 'Ver LedgerEvent',
    },

    edit: {
      menu: 'Editar LedgerEvent',
      title: 'Editar LedgerEvent',
      success: 'LedgerEvent actualizado con éxito',
    },

    restore: {
      success: 'LedgerEvent restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerevent para restaurar.',
      confirmTitle: '¿Restaurar LedgerEvent?',
    },

    restoreMany: {
      success: 'LedgerEvent(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerevent para restaurar.',
      confirmTitle: '¿Restaurar LedgerEvent(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} ledgerevent(es) seleccionados?',
    },

    archiveMany: {
      success: 'LedgerEvent(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerevent para archivar.',
      confirmTitle: '¿Archivar LedgerEvent(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} ledgerevent(es) seleccionados?',
    },

    archive: {
      success: 'LedgerEvent archivado con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerevent para archivar.',
      confirmTitle: '¿Archivar LedgerEvent?',
    },

    destroyMany: {
      success: 'LedgerEvent(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un LedgerEvent para eliminar.',
      confirmTitle: '¿Eliminar LedgerEvent(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} LedgerEvent(s) seleccionados?',
    },

    destroy: {
      success: 'LedgerEvent eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un LedgerEvent para eliminar.',
      confirmTitle: '¿Eliminar LedgerEvent?',
    },

    fields: {
      type: 'Type',
      referenceId: 'ReferenceId',
      referenceType: 'ReferenceType',
      status: 'Status',
      description: 'Description',
      meta: 'Meta',
      entries: 'Entries',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron ledgerentries.',
    },

    export: {
      success: 'LedgerEntries exportados con éxito',
    },

    new: {
      menu: 'Nuevo LedgerEntry',
      title: 'Nuevo LedgerEntry',
      success: 'LedgerEntry creado con éxito',
    },

    view: {
      title: 'Ver LedgerEntry',
    },

    edit: {
      menu: 'Editar LedgerEntry',
      title: 'Editar LedgerEntry',
      success: 'LedgerEntry actualizado con éxito',
    },

    restore: {
      success: 'LedgerEntry restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerentry para restaurar.',
      confirmTitle: '¿Restaurar LedgerEntry?',
    },

    restoreMany: {
      success: 'LedgerEntry(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerentry para restaurar.',
      confirmTitle: '¿Restaurar LedgerEntry(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} ledgerentry(es) seleccionados?',
    },

    archiveMany: {
      success: 'LedgerEntry(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerentry para archivar.',
      confirmTitle: '¿Archivar LedgerEntry(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} ledgerentry(es) seleccionados?',
    },

    archive: {
      success: 'LedgerEntry archivado con éxito',
      noSelection: 'Debe seleccionar al menos un ledgerentry para archivar.',
      confirmTitle: '¿Archivar LedgerEntry?',
    },

    destroyMany: {
      success: 'LedgerEntry(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un LedgerEntry para eliminar.',
      confirmTitle: '¿Eliminar LedgerEntry(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} LedgerEntry(s) seleccionados?',
    },

    destroy: {
      success: 'LedgerEntry eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un LedgerEntry para eliminar.',
      confirmTitle: '¿Eliminar LedgerEntry?',
    },

    fields: {
      amount: 'Amount',
      accountId: 'AccountId',
      meta: 'Meta',
      event: 'Event',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  trade: {
    label: 'Trade',

    dashboardCard: {
      title: 'Trades',
    },

    list: {
      menu: 'Trades',
      title: 'Trades',
      noResults: 'No se encontraron trades.',
    },

    export: {
      success: 'Trades exportados con éxito',
    },

    new: {
      menu: 'Nuevo Trade',
      title: 'Nuevo Trade',
      success: 'Trade creado con éxito',
    },

    view: {
      title: 'Ver Trade',
    },

    edit: {
      menu: 'Editar Trade',
      title: 'Editar Trade',
      success: 'Trade actualizado con éxito',
    },

    restore: {
      success: 'Trade restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un trade para restaurar.',
      confirmTitle: '¿Restaurar Trade?',
    },

    restoreMany: {
      success: 'Trade(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un trade para restaurar.',
      confirmTitle: '¿Restaurar Trade(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} trade(es) seleccionados?',
    },

    archiveMany: {
      success: 'Trade(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un trade para archivar.',
      confirmTitle: '¿Archivar Trade(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} trade(es) seleccionados?',
    },

    archive: {
      success: 'Trade archivado con éxito',
      noSelection: 'Debe seleccionar al menos un trade para archivar.',
      confirmTitle: '¿Archivar Trade?',
    },

    destroyMany: {
      success: 'Trade(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Trade para eliminar.',
      confirmTitle: '¿Eliminar Trade(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Trade(s) seleccionados?',
    },

    destroy: {
      success: 'Trade eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Trade para eliminar.',
      confirmTitle: '¿Eliminar Trade?',
    },

    fields: {
      price: 'Price',
      quantity: 'Quantity',
      meta: 'Meta',
      buyOrderId: 'BuyOrderId',
      sellOrderId: 'SellOrderId',
      instrument: 'Instrument',
      fills: 'Fills',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  fill: {
    label: 'Fill',

    dashboardCard: {
      title: 'Fills',
    },

    list: {
      menu: 'Fills',
      title: 'Fills',
      noResults: 'No se encontraron fills.',
    },

    export: {
      success: 'Fills exportados con éxito',
    },

    new: {
      menu: 'Nuevo Fill',
      title: 'Nuevo Fill',
      success: 'Fill creado con éxito',
    },

    view: {
      title: 'Ver Fill',
    },

    edit: {
      menu: 'Editar Fill',
      title: 'Editar Fill',
      success: 'Fill actualizado con éxito',
    },

    restore: {
      success: 'Fill restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un fill para restaurar.',
      confirmTitle: '¿Restaurar Fill?',
    },

    restoreMany: {
      success: 'Fill(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un fill para restaurar.',
      confirmTitle: '¿Restaurar Fill(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} fill(es) seleccionados?',
    },

    archiveMany: {
      success: 'Fill(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un fill para archivar.',
      confirmTitle: '¿Archivar Fill(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} fill(es) seleccionados?',
    },

    archive: {
      success: 'Fill archivado con éxito',
      noSelection: 'Debe seleccionar al menos un fill para archivar.',
      confirmTitle: '¿Archivar Fill?',
    },

    destroyMany: {
      success: 'Fill(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Fill para eliminar.',
      confirmTitle: '¿Eliminar Fill(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Fill(s) seleccionados?',
    },

    destroy: {
      success: 'Fill eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Fill para eliminar.',
      confirmTitle: '¿Eliminar Fill?',
    },

    fields: {
      side: 'Side',
      price: 'Price',
      quantity: 'Quantity',
      fee: 'Fee',
      meta: 'Meta',
      trade: 'Trade',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  post: {
    label: 'Post',

    dashboardCard: {
      title: 'Posts',
    },

    list: {
      menu: 'Posts',
      title: 'Posts',
      noResults: 'No se encontraron posts.',
    },

    export: {
      success: 'Posts exportados con éxito',
    },

    new: {
      menu: 'Nuevo Post',
      title: 'Nuevo Post',
      success: 'Post creado con éxito',
    },

    view: {
      title: 'Ver Post',
    },

    edit: {
      menu: 'Editar Post',
      title: 'Editar Post',
      success: 'Post actualizado con éxito',
    },

    restore: {
      success: 'Post restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un post para restaurar.',
      confirmTitle: '¿Restaurar Post?',
    },

    restoreMany: {
      success: 'Post(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un post para restaurar.',
      confirmTitle: '¿Restaurar Post(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} post(es) seleccionados?',
    },

    archiveMany: {
      success: 'Post(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un post para archivar.',
      confirmTitle: '¿Archivar Post(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} post(es) seleccionados?',
    },

    archive: {
      success: 'Post archivado con éxito',
      noSelection: 'Debe seleccionar al menos un post para archivar.',
      confirmTitle: '¿Archivar Post?',
    },

    destroyMany: {
      success: 'Post(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Post para eliminar.',
      confirmTitle: '¿Eliminar Post(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Post(s) seleccionados?',
    },

    destroy: {
      success: 'Post eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Post para eliminar.',
      confirmTitle: '¿Eliminar Post?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      files: 'Files',
      images: 'Images',
      type: 'Type',
      meta: 'Meta',
      user: 'User',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron comments.',
    },

    export: {
      success: 'Comments exportados con éxito',
    },

    new: {
      menu: 'Nuevo Comment',
      title: 'Nuevo Comment',
      success: 'Comment creado con éxito',
    },

    view: {
      title: 'Ver Comment',
    },

    edit: {
      menu: 'Editar Comment',
      title: 'Editar Comment',
      success: 'Comment actualizado con éxito',
    },

    restore: {
      success: 'Comment restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un comment para restaurar.',
      confirmTitle: '¿Restaurar Comment?',
    },

    restoreMany: {
      success: 'Comment(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un comment para restaurar.',
      confirmTitle: '¿Restaurar Comment(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} comment(es) seleccionados?',
    },

    archiveMany: {
      success: 'Comment(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un comment para archivar.',
      confirmTitle: '¿Archivar Comment(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} comment(es) seleccionados?',
    },

    archive: {
      success: 'Comment archivado con éxito',
      noSelection: 'Debe seleccionar al menos un comment para archivar.',
      confirmTitle: '¿Archivar Comment?',
    },

    destroyMany: {
      success: 'Comment(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Comment para eliminar.',
      confirmTitle: '¿Eliminar Comment(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Comment(s) seleccionados?',
    },

    destroy: {
      success: 'Comment eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Comment para eliminar.',
      confirmTitle: '¿Eliminar Comment?',
    },

    fields: {
      body: 'Body',
      type: 'Type',
      images: 'Images',
      meta: 'Meta',
      user: 'User',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  article: {
    label: 'Article',

    dashboardCard: {
      title: 'Articles',
    },

    list: {
      menu: 'Articles',
      title: 'Articles',
      noResults: 'No se encontraron articles.',
    },

    export: {
      success: 'Articles exportados con éxito',
    },

    new: {
      menu: 'Nuevo Article',
      title: 'Nuevo Article',
      success: 'Article creado con éxito',
    },

    view: {
      title: 'Ver Article',
    },

    edit: {
      menu: 'Editar Article',
      title: 'Editar Article',
      success: 'Article actualizado con éxito',
    },

    restore: {
      success: 'Article restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un article para restaurar.',
      confirmTitle: '¿Restaurar Article?',
    },

    restoreMany: {
      success: 'Article(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un article para restaurar.',
      confirmTitle: '¿Restaurar Article(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} article(es) seleccionados?',
    },

    archiveMany: {
      success: 'Article(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un article para archivar.',
      confirmTitle: '¿Archivar Article(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} article(es) seleccionados?',
    },

    archive: {
      success: 'Article archivado con éxito',
      noSelection: 'Debe seleccionar al menos un article para archivar.',
      confirmTitle: '¿Archivar Article?',
    },

    destroyMany: {
      success: 'Article(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Article para eliminar.',
      confirmTitle: '¿Eliminar Article(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Article(s) seleccionados?',
    },

    destroy: {
      success: 'Article eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Article para eliminar.',
      confirmTitle: '¿Eliminar Article?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      type: 'Type',
      images: 'Images',
      files: 'Files',
      meta: 'Meta',
      user: 'User',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  chat: {
    label: 'Chat',

    dashboardCard: {
      title: 'Chats',
    },

    list: {
      menu: 'Chats',
      title: 'Chats',
      noResults: 'No se encontraron chats.',
    },

    export: {
      success: 'Chats exportados con éxito',
    },

    new: {
      menu: 'Nuevo Chat',
      title: 'Nuevo Chat',
      success: 'Chat creado con éxito',
    },

    view: {
      title: 'Ver Chat',
    },

    edit: {
      menu: 'Editar Chat',
      title: 'Editar Chat',
      success: 'Chat actualizado con éxito',
    },

    restore: {
      success: 'Chat restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un chat para restaurar.',
      confirmTitle: '¿Restaurar Chat?',
    },

    restoreMany: {
      success: 'Chat(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un chat para restaurar.',
      confirmTitle: '¿Restaurar Chat(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} chat(es) seleccionados?',
    },

    archiveMany: {
      success: 'Chat(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un chat para archivar.',
      confirmTitle: '¿Archivar Chat(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} chat(es) seleccionados?',
    },

    archive: {
      success: 'Chat archivado con éxito',
      noSelection: 'Debe seleccionar al menos un chat para archivar.',
      confirmTitle: '¿Archivar Chat?',
    },

    destroyMany: {
      success: 'Chat(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Chat para eliminar.',
      confirmTitle: '¿Eliminar Chat(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Chat(s) seleccionados?',
    },

    destroy: {
      success: 'Chat eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Chat para eliminar.',
      confirmTitle: '¿Eliminar Chat?',
    },

    fields: {
      name: 'Name',
      media: 'Media',
      meta: 'Meta',
      active: 'Active',
      messages: 'Messages',
      chaters: 'Chaters',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron chaters.',
    },

    export: {
      success: 'Chaters exportados con éxito',
    },

    new: {
      menu: 'Nuevo Chater',
      title: 'Nuevo Chater',
      success: 'Chater creado con éxito',
    },

    view: {
      title: 'Ver Chater',
    },

    edit: {
      menu: 'Editar Chater',
      title: 'Editar Chater',
      success: 'Chater actualizado con éxito',
    },

    restore: {
      success: 'Chater restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un chater para restaurar.',
      confirmTitle: '¿Restaurar Chater?',
    },

    restoreMany: {
      success: 'Chater(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un chater para restaurar.',
      confirmTitle: '¿Restaurar Chater(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} chater(es) seleccionados?',
    },

    archiveMany: {
      success: 'Chater(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un chater para archivar.',
      confirmTitle: '¿Archivar Chater(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} chater(es) seleccionados?',
    },

    archive: {
      success: 'Chater archivado con éxito',
      noSelection: 'Debe seleccionar al menos un chater para archivar.',
      confirmTitle: '¿Archivar Chater?',
    },

    destroyMany: {
      success: 'Chater(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Chater para eliminar.',
      confirmTitle: '¿Eliminar Chater(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Chater(s) seleccionados?',
    },

    destroy: {
      success: 'Chater eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Chater para eliminar.',
      confirmTitle: '¿Eliminar Chater?',
    },

    fields: {
      nickname: 'Nickname',
      status: 'Status',
      role: 'Role',
      meta: 'Meta',
      user: 'User',
      chat: 'Chat',
      messages: 'Messages',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron messages.',
    },

    export: {
      success: 'Messages exportados con éxito',
    },

    new: {
      menu: 'Nuevo Message',
      title: 'Nuevo Message',
      success: 'Message creado con éxito',
    },

    view: {
      title: 'Ver Message',
    },

    edit: {
      menu: 'Editar Message',
      title: 'Editar Message',
      success: 'Message actualizado con éxito',
    },

    restore: {
      success: 'Message restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un message para restaurar.',
      confirmTitle: '¿Restaurar Message?',
    },

    restoreMany: {
      success: 'Message(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un message para restaurar.',
      confirmTitle: '¿Restaurar Message(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} message(es) seleccionados?',
    },

    archiveMany: {
      success: 'Message(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un message para archivar.',
      confirmTitle: '¿Archivar Message(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} message(es) seleccionados?',
    },

    archive: {
      success: 'Message archivado con éxito',
      noSelection: 'Debe seleccionar al menos un message para archivar.',
      confirmTitle: '¿Archivar Message?',
    },

    destroyMany: {
      success: 'Message(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Message para eliminar.',
      confirmTitle: '¿Eliminar Message(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Message(s) seleccionados?',
    },

    destroy: {
      success: 'Message eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Message para eliminar.',
      confirmTitle: '¿Eliminar Message?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  feeSchedule: {
    label: 'FeeSchedule',

    dashboardCard: {
      title: 'FeeSchedules',
    },

    list: {
      menu: 'FeeSchedules',
      title: 'FeeSchedules',
      noResults: 'No se encontraron feeschedules.',
    },

    export: {
      success: 'FeeSchedules exportados con éxito',
    },

    new: {
      menu: 'Nuevo FeeSchedule',
      title: 'Nuevo FeeSchedule',
      success: 'FeeSchedule creado con éxito',
    },

    view: {
      title: 'Ver FeeSchedule',
    },

    edit: {
      menu: 'Editar FeeSchedule',
      title: 'Editar FeeSchedule',
      success: 'FeeSchedule actualizado con éxito',
    },

    restore: {
      success: 'FeeSchedule restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un feeschedule para restaurar.',
      confirmTitle: '¿Restaurar FeeSchedule?',
    },

    restoreMany: {
      success: 'FeeSchedule(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un feeschedule para restaurar.',
      confirmTitle: '¿Restaurar FeeSchedule(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} feeschedule(es) seleccionados?',
    },

    archiveMany: {
      success: 'FeeSchedule(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un feeschedule para archivar.',
      confirmTitle: '¿Archivar FeeSchedule(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} feeschedule(es) seleccionados?',
    },

    archive: {
      success: 'FeeSchedule archivado con éxito',
      noSelection: 'Debe seleccionar al menos un feeschedule para archivar.',
      confirmTitle: '¿Archivar FeeSchedule?',
    },

    destroyMany: {
      success: 'FeeSchedule(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un FeeSchedule para eliminar.',
      confirmTitle: '¿Eliminar FeeSchedule(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} FeeSchedule(s) seleccionados?',
    },

    destroy: {
      success: 'FeeSchedule eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un FeeSchedule para eliminar.',
      confirmTitle: '¿Eliminar FeeSchedule?',
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

      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron balancesnapshots.',
    },

    export: {
      success: 'BalanceSnapshots exportados con éxito',
    },

    new: {
      menu: 'Nuevo BalanceSnapshot',
      title: 'Nuevo BalanceSnapshot',
      success: 'BalanceSnapshot creado con éxito',
    },

    view: {
      title: 'Ver BalanceSnapshot',
    },

    edit: {
      menu: 'Editar BalanceSnapshot',
      title: 'Editar BalanceSnapshot',
      success: 'BalanceSnapshot actualizado con éxito',
    },

    restore: {
      success: 'BalanceSnapshot restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un balancesnapshot para restaurar.',
      confirmTitle: '¿Restaurar BalanceSnapshot?',
    },

    restoreMany: {
      success: 'BalanceSnapshot(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un balancesnapshot para restaurar.',
      confirmTitle: '¿Restaurar BalanceSnapshot(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} balancesnapshot(es) seleccionados?',
    },

    archiveMany: {
      success: 'BalanceSnapshot(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un balancesnapshot para archivar.',
      confirmTitle: '¿Archivar BalanceSnapshot(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} balancesnapshot(es) seleccionados?',
    },

    archive: {
      success: 'BalanceSnapshot archivado con éxito',
      noSelection: 'Debe seleccionar al menos un balancesnapshot para archivar.',
      confirmTitle: '¿Archivar BalanceSnapshot?',
    },

    destroyMany: {
      success: 'BalanceSnapshot(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un BalanceSnapshot para eliminar.',
      confirmTitle: '¿Eliminar BalanceSnapshot(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} BalanceSnapshot(s) seleccionados?',
    },

    destroy: {
      success: 'BalanceSnapshot eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un BalanceSnapshot para eliminar.',
      confirmTitle: '¿Eliminar BalanceSnapshot?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron systemaccounts.',
    },

    export: {
      success: 'SystemAccounts exportados con éxito',
    },

    new: {
      menu: 'Nuevo SystemAccount',
      title: 'Nuevo SystemAccount',
      success: 'SystemAccount creado con éxito',
    },

    view: {
      title: 'Ver SystemAccount',
    },

    edit: {
      menu: 'Editar SystemAccount',
      title: 'Editar SystemAccount',
      success: 'SystemAccount actualizado con éxito',
    },

    restore: {
      success: 'SystemAccount restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un systemaccount para restaurar.',
      confirmTitle: '¿Restaurar SystemAccount?',
    },

    restoreMany: {
      success: 'SystemAccount(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un systemaccount para restaurar.',
      confirmTitle: '¿Restaurar SystemAccount(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} systemaccount(es) seleccionados?',
    },

    archiveMany: {
      success: 'SystemAccount(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un systemaccount para archivar.',
      confirmTitle: '¿Archivar SystemAccount(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} systemaccount(es) seleccionados?',
    },

    archive: {
      success: 'SystemAccount archivado con éxito',
      noSelection: 'Debe seleccionar al menos un systemaccount para archivar.',
      confirmTitle: '¿Archivar SystemAccount?',
    },

    destroyMany: {
      success: 'SystemAccount(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un SystemAccount para eliminar.',
      confirmTitle: '¿Eliminar SystemAccount(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} SystemAccount(s) seleccionados?',
    },

    destroy: {
      success: 'SystemAccount eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un SystemAccount para eliminar.',
      confirmTitle: '¿Eliminar SystemAccount?',
    },

    fields: {
      type: 'Type',
      name: 'Name',
      description: 'Description',
      isActive: 'IsActive',
      meta: 'Meta',

      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  feedback: {
    label: 'Feedback',

    dashboardCard: {
      title: 'Feedbacks',
    },

    list: {
      menu: 'Feedbacks',
      title: 'Feedbacks',
      noResults: 'No se encontraron feedbacks.',
    },

    export: {
      success: 'Feedbacks exportados con éxito',
    },

    new: {
      menu: 'Nuevo Feedback',
      title: 'Nuevo Feedback',
      success: 'Feedback creado con éxito',
    },

    view: {
      title: 'Ver Feedback',
    },

    edit: {
      menu: 'Editar Feedback',
      title: 'Editar Feedback',
      success: 'Feedback actualizado con éxito',
    },

    restore: {
      success: 'Feedback restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un feedback para restaurar.',
      confirmTitle: '¿Restaurar Feedback?',
    },

    restoreMany: {
      success: 'Feedback(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un feedback para restaurar.',
      confirmTitle: '¿Restaurar Feedback(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} feedback(es) seleccionados?',
    },

    archiveMany: {
      success: 'Feedback(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un feedback para archivar.',
      confirmTitle: '¿Archivar Feedback(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} feedback(es) seleccionados?',
    },

    archive: {
      success: 'Feedback archivado con éxito',
      noSelection: 'Debe seleccionar al menos un feedback para archivar.',
      confirmTitle: '¿Archivar Feedback?',
    },

    destroyMany: {
      success: 'Feedback(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Feedback para eliminar.',
      confirmTitle: '¿Eliminar Feedback(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Feedback(s) seleccionados?',
    },

    destroy: {
      success: 'Feedback eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Feedback para eliminar.',
      confirmTitle: '¿Eliminar Feedback?',
    },

    fields: {
      title: 'Title',
      description: 'Description',
      attachments: 'Attachments',
      type: 'Type',
      status: 'Status',
      json: 'Json',
      user: 'User',
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  job: {
    label: 'Job',

    dashboardCard: {
      title: 'Jobs',
    },

    list: {
      menu: 'Jobs',
      title: 'Jobs',
      noResults: 'No se encontraron jobs.',
    },

    export: {
      success: 'Jobs exportados con éxito',
    },

    new: {
      menu: 'Nuevo Job',
      title: 'Nuevo Job',
      success: 'Job creado con éxito',
    },

    view: {
      title: 'Ver Job',
    },

    edit: {
      menu: 'Editar Job',
      title: 'Editar Job',
      success: 'Job actualizado con éxito',
    },

    restore: {
      success: 'Job restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un job para restaurar.',
      confirmTitle: '¿Restaurar Job?',
    },

    restoreMany: {
      success: 'Job(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un job para restaurar.',
      confirmTitle: '¿Restaurar Job(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} job(es) seleccionados?',
    },

    archiveMany: {
      success: 'Job(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un job para archivar.',
      confirmTitle: '¿Archivar Job(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} job(es) seleccionados?',
    },

    archive: {
      success: 'Job archivado con éxito',
      noSelection: 'Debe seleccionar al menos un job para archivar.',
      confirmTitle: '¿Archivar Job?',
    },

    destroyMany: {
      success: 'Job(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Job para eliminar.',
      confirmTitle: '¿Eliminar Job(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Job(s) seleccionados?',
    },

    destroy: {
      success: 'Job eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Job para eliminar.',
      confirmTitle: '¿Eliminar Job?',
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

      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  listing: {
    label: 'Listing',

    dashboardCard: {
      title: 'Listings',
    },

    list: {
      menu: 'Listings',
      title: 'Listings',
      noResults: 'No se encontraron listings.',
    },

    export: {
      success: 'Listings exportados con éxito',
    },

    new: {
      menu: 'Nuevo Listing',
      title: 'Nuevo Listing',
      success: 'Listing creado con éxito',
    },

    view: {
      title: 'Ver Listing',
    },

    edit: {
      menu: 'Editar Listing',
      title: 'Editar Listing',
      success: 'Listing actualizado con éxito',
    },

    restore: {
      success: 'Listing restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un listing para restaurar.',
      confirmTitle: '¿Restaurar Listing?',
    },

    restoreMany: {
      success: 'Listing(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un listing para restaurar.',
      confirmTitle: '¿Restaurar Listing(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} listing(es) seleccionados?',
    },

    archiveMany: {
      success: 'Listing(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un listing para archivar.',
      confirmTitle: '¿Archivar Listing(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} listing(es) seleccionados?',
    },

    archive: {
      success: 'Listing archivado con éxito',
      noSelection: 'Debe seleccionar al menos un listing para archivar.',
      confirmTitle: '¿Archivar Listing?',
    },

    destroyMany: {
      success: 'Listing(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Listing para eliminar.',
      confirmTitle: '¿Eliminar Listing(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Listing(s) seleccionados?',
    },

    destroy: {
      success: 'Listing eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Listing para eliminar.',
      confirmTitle: '¿Eliminar Listing?',
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

      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  referral: {
    label: 'Referral',

    dashboardCard: {
      title: 'Referrals',
    },

    list: {
      menu: 'Referrals',
      title: 'Referrals',
      noResults: 'No se encontraron referrals.',
    },

    export: {
      success: 'Referrals exportados con éxito',
    },

    new: {
      menu: 'Nuevo Referral',
      title: 'Nuevo Referral',
      success: 'Referral creado con éxito',
    },

    view: {
      title: 'Ver Referral',
    },

    edit: {
      menu: 'Editar Referral',
      title: 'Editar Referral',
      success: 'Referral actualizado con éxito',
    },

    restore: {
      success: 'Referral restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un referral para restaurar.',
      confirmTitle: '¿Restaurar Referral?',
    },

    restoreMany: {
      success: 'Referral(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un referral para restaurar.',
      confirmTitle: '¿Restaurar Referral(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} referral(es) seleccionados?',
    },

    archiveMany: {
      success: 'Referral(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un referral para archivar.',
      confirmTitle: '¿Archivar Referral(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} referral(es) seleccionados?',
    },

    archive: {
      success: 'Referral archivado con éxito',
      noSelection: 'Debe seleccionar al menos un referral para archivar.',
      confirmTitle: '¿Archivar Referral?',
    },

    destroyMany: {
      success: 'Referral(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Referral para eliminar.',
      confirmTitle: '¿Eliminar Referral(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Referral(s) seleccionados?',
    },

    destroy: {
      success: 'Referral eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Referral para eliminar.',
      confirmTitle: '¿Eliminar Referral?',
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

      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  notification: {
    label: 'Notification',

    dashboardCard: {
      title: 'Notifications',
    },

    list: {
      menu: 'Notifications',
      title: 'Notifications',
      noResults: 'No se encontraron notifications.',
    },

    export: {
      success: 'Notifications exportados con éxito',
    },

    new: {
      menu: 'Nuevo Notification',
      title: 'Nuevo Notification',
      success: 'Notification creado con éxito',
    },

    view: {
      title: 'Ver Notification',
    },

    edit: {
      menu: 'Editar Notification',
      title: 'Editar Notification',
      success: 'Notification actualizado con éxito',
    },

    restore: {
      success: 'Notification restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un notification para restaurar.',
      confirmTitle: '¿Restaurar Notification?',
    },

    restoreMany: {
      success: 'Notification(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un notification para restaurar.',
      confirmTitle: '¿Restaurar Notification(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} notification(es) seleccionados?',
    },

    archiveMany: {
      success: 'Notification(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un notification para archivar.',
      confirmTitle: '¿Archivar Notification(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} notification(es) seleccionados?',
    },

    archive: {
      success: 'Notification archivado con éxito',
      noSelection: 'Debe seleccionar al menos un notification para archivar.',
      confirmTitle: '¿Archivar Notification?',
    },

    destroyMany: {
      success: 'Notification(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Notification para eliminar.',
      confirmTitle: '¿Eliminar Notification(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Notification(s) seleccionados?',
    },

    destroy: {
      success: 'Notification eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Notification para eliminar.',
      confirmTitle: '¿Eliminar Notification?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      noResults: 'No se encontraron usernotifications.',
    },

    export: {
      success: 'UserNotifications exportados con éxito',
    },

    new: {
      menu: 'Nuevo UserNotification',
      title: 'Nuevo UserNotification',
      success: 'UserNotification creado con éxito',
    },

    view: {
      title: 'Ver UserNotification',
    },

    edit: {
      menu: 'Editar UserNotification',
      title: 'Editar UserNotification',
      success: 'UserNotification actualizado con éxito',
    },

    restore: {
      success: 'UserNotification restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un usernotification para restaurar.',
      confirmTitle: '¿Restaurar UserNotification?',
    },

    restoreMany: {
      success: 'UserNotification(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un usernotification para restaurar.',
      confirmTitle: '¿Restaurar UserNotification(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} usernotification(es) seleccionados?',
    },

    archiveMany: {
      success: 'UserNotification(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un usernotification para archivar.',
      confirmTitle: '¿Archivar UserNotification(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} usernotification(es) seleccionados?',
    },

    archive: {
      success: 'UserNotification archivado con éxito',
      noSelection: 'Debe seleccionar al menos un usernotification para archivar.',
      confirmTitle: '¿Archivar UserNotification?',
    },

    destroyMany: {
      success: 'UserNotification(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un UserNotification para eliminar.',
      confirmTitle: '¿Eliminar UserNotification(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} UserNotification(s) seleccionados?',
    },

    destroy: {
      success: 'UserNotification eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un UserNotification para eliminar.',
      confirmTitle: '¿Eliminar UserNotification?',
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
      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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

  candidate: {
    label: 'Candidate',

    dashboardCard: {
      title: 'Candidates',
    },

    list: {
      menu: 'Candidates',
      title: 'Candidates',
      noResults: 'No se encontraron candidates.',
    },

    export: {
      success: 'Candidates exportados con éxito',
    },

    new: {
      menu: 'Nuevo Candidate',
      title: 'Nuevo Candidate',
      success: 'Candidate creado con éxito',
    },

    view: {
      title: 'Ver Candidate',
    },

    edit: {
      menu: 'Editar Candidate',
      title: 'Editar Candidate',
      success: 'Candidate actualizado con éxito',
    },

    restore: {
      success: 'Candidate restaurado con éxito',
      noSelection: 'Debe seleccionar al menos un candidate para restaurar.',
      confirmTitle: '¿Restaurar Candidate?',
    },

    restoreMany: {
      success: 'Candidate(es) restaurado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un candidate para restaurar.',
      confirmTitle: '¿Restaurar Candidate(es)?',
      confirmDescription:
        '¿Está seguro de que desea restaurar los {0} candidate(es) seleccionados?',
    },

    archiveMany: {
      success: 'Candidate(es) archivado(s) con éxito',
      noSelection: 'Debe seleccionar al menos un candidate para archivar.',
      confirmTitle: '¿Archivar Candidate(es)?',
      confirmDescription:
        '¿Está seguro de que desea archivar los {0} candidate(es) seleccionados?',
    },

    archive: {
      success: 'Candidate archivado con éxito',
      noSelection: 'Debe seleccionar al menos un candidate para archivar.',
      confirmTitle: '¿Archivar Candidate?',
    },

    destroyMany: {
      success: 'Candidate(s) eliminado(s) con éxito',
      noSelection: 'Debes seleccionar al menos un Candidate para eliminar.',
      confirmTitle: '¿Eliminar Candidate(s)?',
      confirmDescription:
        '¿Estás seguro de que quieres eliminar los {0} Candidate(s) seleccionados?',
    },

    destroy: {
      success: 'Candidate eliminado con éxito',
      noSelection: 'Debes seleccionar al menos un Candidate para eliminar.',
      confirmTitle: '¿Eliminar Candidate?',
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

      createdByMembership: 'Creado por',
      updatedByMembership: 'Actualizado por',
      archivedByMembership: 'Archivado por',
      createdAt: 'Creado el',
      updatedAt: 'Actualizado el',
      archivedAt: 'Archivado el',
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
      menu: 'Registros de Auditoría',
      title: 'Registros de Auditoría',
      noResults: 'No se encontraron registros de auditoría.',
    },

    changesDialog: {
      title: 'Registro de Auditoría',
      changes: 'Cambios',
      noChanges: 'No hay cambios en este registro.',
    },

    export: {
      success: 'Registros de auditoría exportados exitosamente',
    },

    fields: {
      timestamp: 'Fecha',
      entityName: 'Entidad',
      entityNames: 'Entidades',
      entityId: 'ID de Entidad',
      operation: 'Operación',
      operations: 'Operaciones',
      membership: 'Usuario',
      apiKey: 'Clave API',
      apiEndpoint: 'Endpoint API',
      apiHttpResponseCode: 'Estado API',
      transactionId: 'ID de Transacción',
    },

    enumerators: {
      operation: {
        SI: 'Iniciar Sesión',
        SO: 'Cerrar Sesión',
        SU: 'Registrarse',
        PRR: 'Solicitud de Restablecimiento de Contraseña',
        PRC: 'Confirmación de Restablecimiento de Contraseña',
        PC: 'Cambio de Contraseña',
        VER: 'Solicitud de Verificación de Correo',
        VEC: 'Confirmación de Verificación de Correo',
        C: 'Crear',
        U: 'Actualizar',
        D: 'Eliminar',
        AG: 'API Get',
        APO: 'API Post',
        APU: 'API Put',
        AD: 'API Delete',
      },
    },

    dashboardCard: {
      activityChart: 'Actividad',
      activityList: 'Actividad Reciente',
    },

    readableOperations: {
      SI: '{0} inició sesión',
      SU: '{0} se registró',
      PRR: '{0} solicitó restablecer la contraseña',
      PRC: '{0} confirmó el restablecimiento de la contraseña',
      PC: '{0} cambió la contraseña',
      VER: '{0} solicitó verificar el correo',
      VEC: '{0} verificó el correo',
      C: '{0} creó {1} {2}',
      U: '{0} actualizó {1} {2}',
      D: '{0} eliminó {1} {2}',
    },
  },

  recaptcha: {
    errors: {
      disabled:
        'reCAPTCHA está deshabilitado en esta plataforma. Omitiendo verificación.',
      invalid: 'reCAPTCHA inválido',
    },
  },

  emails: {
    passwordResetEmail: {
      subject: `Restablecer tu contraseña para {0}`,
      content: `<p>Hola,</p> <p>Sigue este enlace para restablecer la contraseña de tu cuenta {0}. </p> <p><a href="{1}">{1}</a></p> <p>Si no has solicitado restablecer tu contraseña, puedes ignorar este correo.</p> <p>Gracias,</p> <p>Tu equipo de {0}</p>`,
    },
    verifyEmailEmail: {
      subject: `Verifica tu correo electrónico para {0}`,
      content: `<p>Hola,</p><p>Sigue este enlace para verificar tu dirección de correo electrónico.</p><p><a href="{1}">{1}</a></p><p>Si no has solicitado verificar esta dirección, puedes ignorar este correo.</p> <p>Gracias,</p> <p>Tu equipo de {0}</p>`,
    },
    invitationEmail: {
      singleTenant: {
        subject: `Has sido invitado a {0}`,
        content: `<p>Hola,</p> <p>Has sido invitado a {0}.</p> <p>Sigue este enlace para registrarte.</p> <p><a href="{1}">{1}</a></p> <p>Gracias,</p> <p>Tu equipo de {0}</p>`,
      },
      multiTenant: {
        subject: `Has sido invitado a {1} en {0}`,
        content: `<p>Hola,</p> <p>Has sido invitado a {2}.</p> <p>Sigue este enlace para registrarte.</p> <p><a href="{1}">{1}</a></p> <p>Gracias,</p> <p>Tu equipo de {0}</p>`,
      },
    },

    errors: {
      emailNotConfigured:
        'Faltan las variables de entorno de correo electrónico',
    },
  },
};

export default dictionary;
