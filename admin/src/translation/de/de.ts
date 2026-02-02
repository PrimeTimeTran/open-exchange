const dictionary = {
  

  projectName: 'Projekt',

  shared: {
    showArchived: 'Archivierte anzeigen?',
    archive: 'Archivieren',
    restore: 'Wiederherstellen',
    archived: 'Archiviert',
    yes: 'Ja',
    no: 'Nein',
    cancel: 'Abbrechen',
    save: 'Speichern',
    clear: 'Leeren',
    decline: 'Ablehnen',
    accept: 'Akzeptieren',
    dashboard: 'Dashboard',
    new: 'Neu',
    searchNotFound: 'Nichts gefunden.',
    searchPlaceholder: 'Suchen...',
    selectPlaceholder: 'Option auswählen',
    datePlaceholder: 'Datum auswählen',
    timePlaceholder: 'Zeit auswählen',
    dateFormat: 'DD. MMM YYYY',
    timeFormat: 'HH:mm',
    datetimeFormat: 'DD. MMM YYYY HH:mm',
    tagsPlaceholder: 'Tippen und Enter drücken, um hinzuzufügen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    openMenu: 'Menü öffnen',
    submit: 'Absenden',
    search: 'Suche',
    reset: 'Zurücksetzen',
    min: 'Min',
    max: 'Max',
    view: 'Ansicht',
    copiedToClipboard: 'In die Zwischenablage kopiert',
    exportToCsv: 'Als CSV exportieren',
    import: 'Importieren',
    pause: 'Pausieren',
    discard: 'Verwerfen',
    preferences: 'Einstellungen',
    session: 'Sitzung',
    deleted: 'Gelöscht',
    remove: 'Entfernen',
    startDate: 'Startdatum',
    endDate: 'Enddatum',

    unsavedChanges: {
      message: 'Sie haben ungespeicherte Änderungen.',
      proceed: 'Verwerfen',
      dismiss: 'Abbrechen',
      saveChanges: 'Änderungen speichern',
    },

    importer: {
      importHashAlreadyExists: 'Daten wurden bereits importiert',
      title: 'CSV-Datei importieren',
      menu: 'CSV-Datei importieren',
      line: 'Zeile',
      status: 'Status',
      pending: 'Ausstehend',
      success: 'Importiert',
      error: 'Fehler',
      total: `{0} importiert, {1} ausstehend und {2} mit Fehler`,
      importedMessage: `{0} von {1} verarbeitet.`,
      noValidRows: 'Keine gültigen Zeilen.',
      noNavigateAwayMessage:
        'Diese Seite nicht verlassen, sonst wird der Import gestoppt.',
      completed: {
        success:
          'Import abgeschlossen. Alle Zeilen wurden erfolgreich importiert.',
        someErrors:
          'Verarbeitung abgeschlossen, einige Zeilen konnten jedoch nicht importiert werden.',
        allErrors: 'Import fehlgeschlagen. Keine gültigen Zeilen.',
      },
      form: {
        downloadTemplate: 'Vorlage herunterladen',
      },
      list: {
        newConfirm: 'Sind Sie sicher?',
        discardConfirm:
          'Sind Sie sicher? Nicht importierte Daten gehen verloren.',
      },
      errors: {
        invalidFileEmpty: 'Die Datei ist leer',
        invalidFileCsv: 'Nur CSV (.csv) Dateien sind erlaubt',
        invalidFileUpload:
          'Ungültige Datei. Stellen Sie sicher, dass Sie die neueste Version der Vorlage verwenden.',
        importHashRequired: 'Import-Hash ist erforderlich',
        importHashExistent: 'Daten wurden bereits importiert',
      },
    },

    dataTable: {
      filters: 'Filter',
      noResults: 'Keine Ergebnisse gefunden.',
      viewOptions: 'Ansicht',
      toggleColumns: 'Spalten umschalten',
      actions: 'Aktionen',
      sortAscending: 'Aufsteigend',
      sortDescending: 'Absteigend',
      hide: 'Ausblenden',
      selectAll: 'Alles auswählen',
      selectRow: 'Zeile auswählen',
      paginationTotal: 'Insgesamt: {0} Zeile(n)',
      paginationSelected: '{0} Zeile(n) ausgewählt.',
      paginationRowsPerPage: 'Zeilen pro Seite',
      paginationCurrent: `Seite {0} von {1}`,
      paginationGoToFirst: 'Zur ersten Seite gehen',
      paginationGoToPrevious: 'Zur vorherigen Seite gehen',
      paginationGoToNext: 'Zur nächsten Seite gehen',
      paginationGoToLast: 'Zur letzten Seite gehen',
    },

    locales: {
      en: 'Englisch',
      es: 'Spanisch',
      de: 'Deutsch',
      'pt-BR': 'Portugiesisch (Brasilien)',
    },

    localeSwitcher: {
      searchPlaceholder: 'Sprache suchen...',
      title: 'Sprache',
      placeholder: 'Sprache auswählen',
      searchEmpty: 'Keine Sprache gefunden.',
    },

    theme: {
      toggle: 'Design',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System',
    },

    errors: {
      cannotDeleteReferenced: `Kann {0} nicht löschen, da es von einem oder mehreren {1} referenziert wird.`,
      timezone: 'Ungültige Zeitzone',
      required: `{0} ist ein Pflichtfeld`,
      invalid: `{0} ist ungültig`,
      dateFuture: `{0} muss in der Zukunft liegen`,
      unknown: 'Ein Fehler ist aufgetreten',
      unique: `{0} muss eindeutig sein`,
    },
  },

  apiKey: {
    docs: {
      menu: 'API-Dokumentation',
    },
    form: {
      addAll: 'Alle hinzufügen',
    },
    edit: {
      menu: 'API-Schlüssel bearbeiten',
      title: 'API-Schlüssel bearbeiten',
      success: 'API-Schlüssel erfolgreich aktualisiert',
    },
    new: {
      menu: 'Neuer API-Schlüssel',
      title: 'Neuer API-Schlüssel',
      success: 'API-Schlüssel erfolgreich erstellt',
      text: `Speichern Sie Ihren API-Schlüssel! Aus Sicherheitsgründen können Sie den API-Schlüssel nur einmal sehen.`,
      subtext: `Sie müssen ihn im Authorization-Header Ihrer API-Aufrufe hinzufügen.`,
      backToApiKeys: 'Zurück zu API-Schlüsseln',
    },
    list: {
      menu: 'API-Schlüssel',
      title: 'API-Schlüssel',
      viewActivity: 'Aktivität anzeigen',
      noResults: 'Keine API-Schlüssel gefunden.',
    },
    destroy: {
      confirmTitle: 'API-Schlüssel löschen?',
      success: 'API-Schlüssel erfolgreich gelöscht',
    },
    enumerators: {
      status: {
        active: 'Aktiv',
        disabled: 'Deaktiviert',
        expired: 'Abgelaufen',
      },
    },
    fields: {
      apiKey: 'API-Schlüssel',
      membership: 'Benutzer',
      name: 'Name',
      keyPrefix: 'Schlüsselpräfix',
      key: 'Schlüssel',
      scopes: 'Bereiche',
      expiresAt: 'Läuft ab am',
      status: 'Status',
      createdAt: 'Erstellt am',
      disabled: 'Deaktiviert',
    },
    disabledTooltip: `Deaktiviert am {0}.`,
    errors: {
      invalidScopes: 'Bereiche müssen der Rolle des Benutzers entsprechen',
    },
  },

  file: {
    button: 'Hochladen',
    delete: 'Löschen',
    errors: {
      formats: `Ungültiges Format. Muss eines der folgenden sein: {0}.`,
      notImage: `Datei muss ein Bild sein`,
      tooBig: `Datei ist zu groß. Aktuelle Größe ist {0} Bytes, maximale Größe ist {1} Bytes`,
    },
  },

  auth: {
    signIn: {
      oauthError:
        'Anmeldung mit diesem Anbieter nicht möglich. Bitte einen anderen verwenden.',
      title: 'Anmelden',
      button: 'Mit E-Mail anmelden',
      success: 'Erfolgreich angemeldet',
      email: 'E-Mail',
      password: 'Passwort',
      socialHeader: 'Oder weiter mit',
      facebook: 'Facebook',
      github: 'GitHub',
      google: 'Google',
      passwordResetRequestLink: 'Passwort vergessen?',
      signUpLink: 'Noch kein Konto? Erstellen',
    },
    signUp: {
      title: 'Registrieren',
      signInLink: 'Bereits ein Konto? Anmelden',
      button: 'Registrieren',
      success: 'Erfolgreich registriert',
      email: 'E-Mail',
      password: 'Passwort',
    },
    verifyEmailRequest: {
      title: 'E-Mail-Verifikation erneut senden',
      button: 'E-Mail-Verifikation erneut senden',
      message:
        'Bitte bestätige deine E-Mail-Adresse bei <strong>{0}</strong>, um fortzufahren.',
      success: 'E-Mail-Verifikation erfolgreich gesendet!',
    },
    verifyEmailConfirm: {
      title: 'E-Mail verifizieren',
      success: 'E-Mail erfolgreich verifiziert.',
      loadingMessage: 'Einen Moment, deine E-Mail wird verifiziert...',
    },
    passwordResetRequest: {
      title: 'Passwort vergessen',
      signInLink: 'Abbrechen',
      button: 'E-Mail zum Zurücksetzen des Passworts senden',
      email: 'E-Mail',
      success: 'E-Mail zum Zurücksetzen des Passworts erfolgreich gesendet',
    },
    passwordResetConfirm: {
      title: 'Passwort zurücksetzen',
      signInLink: 'Abbrechen',
      button: 'Passwort zurücksetzen',
      password: 'Passwort',
      success: 'Passwort erfolgreich geändert',
    },
    noPermissions: {
      title: 'Warten auf Berechtigungen',
      message:
        'Du hast noch keine Berechtigungen. Bitte warte, bis der Admin dir Rechte gewährt.',
    },
    invitation: {
      title: 'Einladungen',
      success: 'Einladung erfolgreich angenommen',
      acceptWrongEmail: 'Einladung mit dieser E-Mail annehmen',
      loadingMessage: 'Einen Moment, wir akzeptieren die Einladung...',
      invalidToken: 'Abgelaufener oder ungültiger Einladungstoken.',
    },
    tenant: {
      title: 'Arbeitsbereiche',
      create: {
        name: 'Name des Arbeitsbereichs',
        success: 'Arbeitsbereich erfolgreich erstellt',
        button: 'Arbeitsbereich erstellen',
      },
      select: {
        tenant: 'Einen Arbeitsbereich auswählen',
        joinSuccess: 'Erfolgreich dem Arbeitsbereich beigetreten',
        select: 'Arbeitsbereich auswählen',
        acceptInvitation: 'Einladung annehmen',
      },
    },
    passwordChange: {
      title: 'Passwort ändern',
      subtitle: 'Bitte gib dein altes und dein neues Passwort ein.',
      menu: 'Passwort ändern',
      oldPassword: 'Altes Passwort',
      newPassword: 'Neues Passwort',
      newPasswordConfirmation: 'Neues Passwort bestätigen',
      button: 'Passwort speichern',
      success: 'Passwort erfolgreich gespeichert',
      mustMatch: 'Passwörter müssen übereinstimmen',
      cancel: 'Abbrechen',
    },
    profile: {
      title: 'Profil',
      subtitle:
        'Dein Profil wird unter den anderen Benutzern in deinem Arbeitsbereich geteilt.',
      menu: 'Profil',
      firstName: 'Vorname',
      lastName: 'Nachname',
      avatars: 'Avatar',
      button: 'Profil speichern',
      success: 'Profil erfolgreich gespeichert',
      cancel: 'Abbrechen',
    },
    profileOnboard: {
      title: 'Profil',
      firstName: 'Vorname',
      lastName: 'Nachname',
      avatars: 'Avatar',
      button: 'Profil speichern',
      success: 'Profil erfolgreich gespeichert',
    },
    signOut: {
      menu: 'Abmelden',
      button: 'Abmelden',
      title: 'Abmelden',
      loading: 'Sie werden abgemeldet...',
    },
    errors: {
      invalidApiKey: 'Ungültiger oder abgelaufener API-Schlüssel',
      emailNotFound: 'E-Mail nicht gefunden',
      userNotFound: 'Leider erkennen wir deine Anmeldedaten nicht',
      wrongPassword: 'Leider erkennen wir deine Anmeldedaten nicht',
      weakPassword: 'Dieses Passwort ist zu schwach',
      emailAlreadyInUse: 'E-Mail wird bereits verwendet',
      invalidPasswordResetToken:
        'Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen',
      invalidVerifyEmailToken:
        'E-Mail-Verifizierungslink ist ungültig oder abgelaufen',
      wrongOldPassword: 'Das alte Passwort ist falsch',
    },
  },

  tenant: {
    switcher: {
      title: 'Arbeitsbereiche',
      placeholder: 'Einen Arbeitsbereich auswählen',
      searchPlaceholder: 'Arbeitsbereich suchen...',
      searchEmpty: 'Kein Arbeitsbereich gefunden.',
      create: 'Arbeitsbereich erstellen',
    },

    invite: {
      title: `Einladung zu {0} annehmen`,
      message: `Du wurdest zu {0} eingeladen. Du kannst wählen, ob du annimmst oder ablehnst.`,
    },

    form: {
      name: 'Name',

      new: {
        title: 'Arbeitsbereich erstellen',
        success: 'Arbeitsbereich erfolgreich erstellt',
      },

      edit: {
        title: 'Einstellungen des Arbeitsbereichs',
        success: 'Arbeitsbereich erfolgreich aktualisiert',
      },
    },

    destroy: {
      success: 'Arbeitsbereich erfolgreich gelöscht',
      confirmTitle: 'Arbeitsbereich löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie den Arbeitsbereich {0} löschen möchten? Diese Aktion ist nicht rückgängig zu machen!',
    },
  },

  membership: {
    dashboardCard: {
      title: 'Benutzer',
    },

    showActivity: 'Aktivität',

    view: {
      title: 'Benutzer anzeigen',
    },

    list: {
      menu: 'Benutzer',
      title: 'Benutzer',
      noResults: 'Keine Benutzer gefunden.',
    },

    export: {
      success: 'Benutzer erfolgreich exportiert',
    },

    edit: {
      menu: 'Benutzer bearbeiten',
      title: 'Benutzer bearbeiten',
      success: 'Benutzer erfolgreich aktualisiert',
    },

    new: {
      menu: 'Neuer Benutzer',
      title: 'Neuer Benutzer',
      success: 'Benutzer erfolgreich erstellt',
    },

    destroyMany: {
      success: 'Benutzer erfolgreich gelöscht',
      noSelection: 'Du musst mindestens einen Benutzer auswählen, um ihn zu löschen.',
      confirmTitle: 'Benutzer löschen?',
      confirmDescription:
        'Bist du sicher, dass du die {0} ausgewählten Benutzer löschen möchtest?',
    },

    destroy: {
      success: 'Benutzer erfolgreich gelöscht',
      noSelection: 'Du musst mindestens einen Benutzer auswählen, um ihn zu löschen.',
      confirmTitle: 'Benutzer löschen?',
    },

    resendInvitationEmail: {
      button: 'Einladungsemail erneut senden',
      success: 'Einladungsemail erfolgreich gesendet',
    },

    fields: {
      avatars: 'Avatar',
      fullName: 'Vollständiger Name',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      roles: 'Rollen',
      status: 'Status',
    },

    enumerators: {
      roles: {
        admin: 'Admin',
        custom: 'Benutzerdefiniert',
      },

      status: {
        invited: 'Eingeladen',
        active: 'Aktiv',
        disabled: 'Deaktiviert',
      },
    },

    errors: {
      cannotRemoveSelfAdminRole:
        'Du kannst deine eigene Admin-Rolle nicht entfernen',
      cannotDeleteSelf: 'Du kannst deine eigene Mitgliedschaft nicht entfernen',
      notInvited: 'Du bist nicht eingeladen',
      invalidStatus: `Ungültiger Status: {0}`,
      alreadyMember: `{0} ist bereits Mitglied`,
      notSameEmail: `Diese Einladung wurde an {0} gesendet, aber du bist als {1} angemeldet. Möchtest du fortfahren?`,
    },
  },

  subscription: {
    menu: 'Abonnement',
    title: 'Tarife und Preise',
    current: 'Aktueller Tarif',

    subscribe: 'Abonnieren',
    manage: 'Verwalten',
    notPlanUser: 'Du bist nicht der Manager dieses Abonnements.',
    cancelAtPeriodEnd: 'Dieser Tarif wird am Ende des Zeitraums gekündigt.',

    plans: {
      free: {
        title: 'Kostenlos',
        price: '0 €',
        pricingPeriod: '/Monat',
        features: {
          first: 'Erste Funktion Beschreibung',
          second: 'Zweite Funktion Beschreibung',
          third: 'Dritte Funktion Beschreibung',
        },
      },
      basic: {
        title: 'Basis',
        price: '10 €',
        pricingPeriod: '/Monat',
        features: {
          first: 'Erste Funktion Beschreibung',
          second: 'Zweite Funktion Beschreibung',
          third: 'Dritte Funktion Beschreibung',
        },
      },
      enterprise: {
        title: 'Unternehmen',
        price: '50 €',
        pricingPeriod: '/Monat',
        features: {
          first: 'Erste Funktion Beschreibung',
          second: 'Zweite Funktion Beschreibung',
          third: 'Dritte Funktion Beschreibung',
        },
      },
    },

    errors: {
      disabled: 'Abonnements sind auf dieser Plattform deaktiviert',
      alreadyExistsActive: 'Es gibt bereits ein aktives Abonnement',
      stripeNotConfigured: 'Stripe-Umgebungsvariablen fehlen',
    },
  },

  account: {
    label: 'Accounts',

    dashboardCard: {
      title: 'Accounts',
    },

    list: {
      menu: 'Accounts',
      title: 'Accounts',
      noResults: 'Keine accounts gefunden.',
    },

    export: {
      success: 'Accounts erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Account',
    },

    new: {
      menu: 'Neuer Account',
      title: 'Neuer Account',
      success: 'Account erfolgreich erstellt',
    },

    edit: {
      menu: 'Accounts bearbeiten',
      title: 'Accounts bearbeiten',
      success: 'Account erfolgreich aktualisiert',
    },

    restore: {
      success: 'Account erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen account auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Account wiederherstellen?',
    },

    restoreMany: {
      success: 'Account(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen account auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Account(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten account(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Account(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen account auswählen, um ihn zu archivieren.',
      confirmTitle: 'Account(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten account(n) archivieren möchten?',
    },

    archive: {
      success: 'Account erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen account auswählen, um ihn zu archivieren.',
      confirmTitle: 'Account archivieren?',
    },

    destroyMany: {
      success: 'Account(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen account auswählen, um ihn zu löschen.',
      confirmTitle: 'Account(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten account löschen möchten?',
    },

    destroy: {
      success: 'Account erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen account auswählen, um ihn zu löschen.',
      confirmTitle: 'Account löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Wallets',

    dashboardCard: {
      title: 'Wallets',
    },

    list: {
      menu: 'Wallets',
      title: 'Wallets',
      noResults: 'Keine wallets gefunden.',
    },

    export: {
      success: 'Wallets erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Wallet',
    },

    new: {
      menu: 'Neuer Wallet',
      title: 'Neuer Wallet',
      success: 'Wallet erfolgreich erstellt',
    },

    edit: {
      menu: 'Wallets bearbeiten',
      title: 'Wallets bearbeiten',
      success: 'Wallet erfolgreich aktualisiert',
    },

    restore: {
      success: 'Wallet erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen wallet auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Wallet wiederherstellen?',
    },

    restoreMany: {
      success: 'Wallet(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen wallet auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Wallet(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten wallet(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Wallet(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen wallet auswählen, um ihn zu archivieren.',
      confirmTitle: 'Wallet(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten wallet(n) archivieren möchten?',
    },

    archive: {
      success: 'Wallet erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen wallet auswählen, um ihn zu archivieren.',
      confirmTitle: 'Wallet archivieren?',
    },

    destroyMany: {
      success: 'Wallet(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen wallet auswählen, um ihn zu löschen.',
      confirmTitle: 'Wallet(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten wallet löschen möchten?',
    },

    destroy: {
      success: 'Wallet erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen wallet auswählen, um ihn zu löschen.',
      confirmTitle: 'Wallet löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Deposits',

    dashboardCard: {
      title: 'Deposits',
    },

    list: {
      menu: 'Deposits',
      title: 'Deposits',
      noResults: 'Keine deposits gefunden.',
    },

    export: {
      success: 'Deposits erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Deposit',
    },

    new: {
      menu: 'Neuer Deposit',
      title: 'Neuer Deposit',
      success: 'Deposit erfolgreich erstellt',
    },

    edit: {
      menu: 'Deposits bearbeiten',
      title: 'Deposits bearbeiten',
      success: 'Deposit erfolgreich aktualisiert',
    },

    restore: {
      success: 'Deposit erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen deposit auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Deposit wiederherstellen?',
    },

    restoreMany: {
      success: 'Deposit(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen deposit auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Deposit(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten deposit(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Deposit(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen deposit auswählen, um ihn zu archivieren.',
      confirmTitle: 'Deposit(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten deposit(n) archivieren möchten?',
    },

    archive: {
      success: 'Deposit erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen deposit auswählen, um ihn zu archivieren.',
      confirmTitle: 'Deposit archivieren?',
    },

    destroyMany: {
      success: 'Deposit(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen deposit auswählen, um ihn zu löschen.',
      confirmTitle: 'Deposit(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten deposit löschen möchten?',
    },

    destroy: {
      success: 'Deposit erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen deposit auswählen, um ihn zu löschen.',
      confirmTitle: 'Deposit löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Withdrawals',

    dashboardCard: {
      title: 'Withdrawals',
    },

    list: {
      menu: 'Withdrawals',
      title: 'Withdrawals',
      noResults: 'Keine withdrawals gefunden.',
    },

    export: {
      success: 'Withdrawals erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Withdrawal',
    },

    new: {
      menu: 'Neuer Withdrawal',
      title: 'Neuer Withdrawal',
      success: 'Withdrawal erfolgreich erstellt',
    },

    edit: {
      menu: 'Withdrawals bearbeiten',
      title: 'Withdrawals bearbeiten',
      success: 'Withdrawal erfolgreich aktualisiert',
    },

    restore: {
      success: 'Withdrawal erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen withdrawal auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Withdrawal wiederherstellen?',
    },

    restoreMany: {
      success: 'Withdrawal(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen withdrawal auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Withdrawal(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten withdrawal(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Withdrawal(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen withdrawal auswählen, um ihn zu archivieren.',
      confirmTitle: 'Withdrawal(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten withdrawal(n) archivieren möchten?',
    },

    archive: {
      success: 'Withdrawal erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen withdrawal auswählen, um ihn zu archivieren.',
      confirmTitle: 'Withdrawal archivieren?',
    },

    destroyMany: {
      success: 'Withdrawal(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen withdrawal auswählen, um ihn zu löschen.',
      confirmTitle: 'Withdrawal(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten withdrawal löschen möchten?',
    },

    destroy: {
      success: 'Withdrawal erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen withdrawal auswählen, um ihn zu löschen.',
      confirmTitle: 'Withdrawal löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Orders',

    dashboardCard: {
      title: 'Orders',
    },

    list: {
      menu: 'Orders',
      title: 'Orders',
      noResults: 'Keine orders gefunden.',
    },

    export: {
      success: 'Orders erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Order',
    },

    new: {
      menu: 'Neuer Order',
      title: 'Neuer Order',
      success: 'Order erfolgreich erstellt',
    },

    edit: {
      menu: 'Orders bearbeiten',
      title: 'Orders bearbeiten',
      success: 'Order erfolgreich aktualisiert',
    },

    restore: {
      success: 'Order erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen order auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Order wiederherstellen?',
    },

    restoreMany: {
      success: 'Order(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen order auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Order(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten order(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Order(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen order auswählen, um ihn zu archivieren.',
      confirmTitle: 'Order(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten order(n) archivieren möchten?',
    },

    archive: {
      success: 'Order erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen order auswählen, um ihn zu archivieren.',
      confirmTitle: 'Order archivieren?',
    },

    destroyMany: {
      success: 'Order(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen order auswählen, um ihn zu löschen.',
      confirmTitle: 'Order(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten order löschen möchten?',
    },

    destroy: {
      success: 'Order erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen order auswählen, um ihn zu löschen.',
      confirmTitle: 'Order löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
    },

    hints: {
      side: '',
      type: '',
      price: '',
      quantity: '',
      quantityFilled: '',
      status: '',
      timeInFore: '',
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
    label: 'Assets',

    dashboardCard: {
      title: 'Assets',
    },

    list: {
      menu: 'Assets',
      title: 'Assets',
      noResults: 'Keine assets gefunden.',
    },

    export: {
      success: 'Assets erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Asset',
    },

    new: {
      menu: 'Neuer Asset',
      title: 'Neuer Asset',
      success: 'Asset erfolgreich erstellt',
    },

    edit: {
      menu: 'Assets bearbeiten',
      title: 'Assets bearbeiten',
      success: 'Asset erfolgreich aktualisiert',
    },

    restore: {
      success: 'Asset erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen asset auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Asset wiederherstellen?',
    },

    restoreMany: {
      success: 'Asset(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen asset auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Asset(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten asset(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Asset(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen asset auswählen, um ihn zu archivieren.',
      confirmTitle: 'Asset(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten asset(n) archivieren möchten?',
    },

    archive: {
      success: 'Asset erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen asset auswählen, um ihn zu archivieren.',
      confirmTitle: 'Asset archivieren?',
    },

    destroyMany: {
      success: 'Asset(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen asset auswählen, um ihn zu löschen.',
      confirmTitle: 'Asset(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten asset löschen möchten?',
    },

    destroy: {
      success: 'Asset erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen asset auswählen, um ihn zu löschen.',
      confirmTitle: 'Asset löschen?',
    },

    fields: {
      symbol: 'Symbol',
      type: 'Type',
      precision: 'Precision',
      isFractional: 'IsFractional',
      meta: 'Meta',
      decimals: 'Decimals',
      baseInstruments: 'BaseInstruments',
      quoteInstruments: 'QuoteInstruments',
      wallets: 'Wallets',
      deposits: 'Deposits',
      withdrawals: 'Withdrawals',
      snapshots: 'Snapshots',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
    },

    hints: {
      symbol: '',
      type: '',
      precision: '',
      isFractional: '',
      meta: '',
      decimals: '',
      baseInstruments: '',
      quoteInstruments: '',
      wallets: '',
      deposits: '',
      withdrawals: '',
      snapshots: '',
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

  instrument: {
    label: 'Instruments',

    dashboardCard: {
      title: 'Instruments',
    },

    list: {
      menu: 'Instruments',
      title: 'Instruments',
      noResults: 'Keine instruments gefunden.',
    },

    export: {
      success: 'Instruments erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Instrument',
    },

    new: {
      menu: 'Neuer Instrument',
      title: 'Neuer Instrument',
      success: 'Instrument erfolgreich erstellt',
    },

    edit: {
      menu: 'Instruments bearbeiten',
      title: 'Instruments bearbeiten',
      success: 'Instrument erfolgreich aktualisiert',
    },

    restore: {
      success: 'Instrument erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen instrument auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Instrument wiederherstellen?',
    },

    restoreMany: {
      success: 'Instrument(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen instrument auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Instrument(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten instrument(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Instrument(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen instrument auswählen, um ihn zu archivieren.',
      confirmTitle: 'Instrument(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten instrument(n) archivieren möchten?',
    },

    archive: {
      success: 'Instrument erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen instrument auswählen, um ihn zu archivieren.',
      confirmTitle: 'Instrument archivieren?',
    },

    destroyMany: {
      success: 'Instrument(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen instrument auswählen, um ihn zu löschen.',
      confirmTitle: 'Instrument(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten instrument löschen möchten?',
    },

    destroy: {
      success: 'Instrument erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen instrument auswählen, um ihn zu löschen.',
      confirmTitle: 'Instrument löschen?',
    },

    fields: {
      type: 'Type',
      meta: 'Meta',
      status: 'Status',
      underlyingAsset: 'UnderlyingAsset',
      quoteAsset: 'QuoteAsset',
      orders: 'Orders',
      trades: 'Trades',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'LedgerEvents',

    dashboardCard: {
      title: 'LedgerEvents',
    },

    list: {
      menu: 'LedgerEvents',
      title: 'LedgerEvents',
      noResults: 'Keine ledgerevents gefunden.',
    },

    export: {
      success: 'LedgerEvents erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen LedgerEvent',
    },

    new: {
      menu: 'Neuer LedgerEvent',
      title: 'Neuer LedgerEvent',
      success: 'LedgerEvent erfolgreich erstellt',
    },

    edit: {
      menu: 'LedgerEvents bearbeiten',
      title: 'LedgerEvents bearbeiten',
      success: 'LedgerEvent erfolgreich aktualisiert',
    },

    restore: {
      success: 'LedgerEvent erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen ledgerevent auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'LedgerEvent wiederherstellen?',
    },

    restoreMany: {
      success: 'LedgerEvent(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen ledgerevent auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'LedgerEvent(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten ledgerevent(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'LedgerEvent(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen ledgerevent auswählen, um ihn zu archivieren.',
      confirmTitle: 'LedgerEvent(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten ledgerevent(n) archivieren möchten?',
    },

    archive: {
      success: 'LedgerEvent erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen ledgerevent auswählen, um ihn zu archivieren.',
      confirmTitle: 'LedgerEvent archivieren?',
    },

    destroyMany: {
      success: 'LedgerEvent(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen ledgerevent auswählen, um ihn zu löschen.',
      confirmTitle: 'LedgerEvent(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten ledgerevent löschen möchten?',
    },

    destroy: {
      success: 'LedgerEvent erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen ledgerevent auswählen, um ihn zu löschen.',
      confirmTitle: 'LedgerEvent löschen?',
    },

    fields: {
      type: 'Type',
      referenceId: 'ReferenceId',
      referenceType: 'ReferenceType',
      status: 'Status',
      description: 'Description',
      meta: 'Meta',
      entries: 'Entries',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'LedgerEntries',

    dashboardCard: {
      title: 'LedgerEntries',
    },

    list: {
      menu: 'LedgerEntries',
      title: 'LedgerEntries',
      noResults: 'Keine ledgerentries gefunden.',
    },

    export: {
      success: 'LedgerEntries erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen LedgerEntry',
    },

    new: {
      menu: 'Neuer LedgerEntry',
      title: 'Neuer LedgerEntry',
      success: 'LedgerEntry erfolgreich erstellt',
    },

    edit: {
      menu: 'LedgerEntries bearbeiten',
      title: 'LedgerEntries bearbeiten',
      success: 'LedgerEntry erfolgreich aktualisiert',
    },

    restore: {
      success: 'LedgerEntry erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen ledgerentry auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'LedgerEntry wiederherstellen?',
    },

    restoreMany: {
      success: 'LedgerEntry(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen ledgerentry auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'LedgerEntry(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten ledgerentry(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'LedgerEntry(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen ledgerentry auswählen, um ihn zu archivieren.',
      confirmTitle: 'LedgerEntry(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten ledgerentry(n) archivieren möchten?',
    },

    archive: {
      success: 'LedgerEntry erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen ledgerentry auswählen, um ihn zu archivieren.',
      confirmTitle: 'LedgerEntry archivieren?',
    },

    destroyMany: {
      success: 'LedgerEntry(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen ledgerentry auswählen, um ihn zu löschen.',
      confirmTitle: 'LedgerEntry(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten ledgerentry löschen möchten?',
    },

    destroy: {
      success: 'LedgerEntry erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen ledgerentry auswählen, um ihn zu löschen.',
      confirmTitle: 'LedgerEntry löschen?',
    },

    fields: {
      amount: 'Amount',
      accountId: 'AccountId',
      meta: 'Meta',
      event: 'Event',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Trades',

    dashboardCard: {
      title: 'Trades',
    },

    list: {
      menu: 'Trades',
      title: 'Trades',
      noResults: 'Keine trades gefunden.',
    },

    export: {
      success: 'Trades erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Trade',
    },

    new: {
      menu: 'Neuer Trade',
      title: 'Neuer Trade',
      success: 'Trade erfolgreich erstellt',
    },

    edit: {
      menu: 'Trades bearbeiten',
      title: 'Trades bearbeiten',
      success: 'Trade erfolgreich aktualisiert',
    },

    restore: {
      success: 'Trade erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen trade auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Trade wiederherstellen?',
    },

    restoreMany: {
      success: 'Trade(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen trade auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Trade(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten trade(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Trade(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen trade auswählen, um ihn zu archivieren.',
      confirmTitle: 'Trade(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten trade(n) archivieren möchten?',
    },

    archive: {
      success: 'Trade erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen trade auswählen, um ihn zu archivieren.',
      confirmTitle: 'Trade archivieren?',
    },

    destroyMany: {
      success: 'Trade(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen trade auswählen, um ihn zu löschen.',
      confirmTitle: 'Trade(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten trade löschen möchten?',
    },

    destroy: {
      success: 'Trade erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen trade auswählen, um ihn zu löschen.',
      confirmTitle: 'Trade löschen?',
    },

    fields: {
      price: 'Price',
      quantity: 'Quantity',
      meta: 'Meta',
      buyOrderId: 'BuyOrderId',
      sellOrderId: 'SellOrderId',
      instrument: 'Instrument',
      fills: 'Fills',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Fills',

    dashboardCard: {
      title: 'Fills',
    },

    list: {
      menu: 'Fills',
      title: 'Fills',
      noResults: 'Keine fills gefunden.',
    },

    export: {
      success: 'Fills erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Fill',
    },

    new: {
      menu: 'Neuer Fill',
      title: 'Neuer Fill',
      success: 'Fill erfolgreich erstellt',
    },

    edit: {
      menu: 'Fills bearbeiten',
      title: 'Fills bearbeiten',
      success: 'Fill erfolgreich aktualisiert',
    },

    restore: {
      success: 'Fill erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen fill auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Fill wiederherstellen?',
    },

    restoreMany: {
      success: 'Fill(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen fill auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Fill(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten fill(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Fill(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen fill auswählen, um ihn zu archivieren.',
      confirmTitle: 'Fill(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten fill(n) archivieren möchten?',
    },

    archive: {
      success: 'Fill erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen fill auswählen, um ihn zu archivieren.',
      confirmTitle: 'Fill archivieren?',
    },

    destroyMany: {
      success: 'Fill(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen fill auswählen, um ihn zu löschen.',
      confirmTitle: 'Fill(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten fill löschen möchten?',
    },

    destroy: {
      success: 'Fill erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen fill auswählen, um ihn zu löschen.',
      confirmTitle: 'Fill löschen?',
    },

    fields: {
      side: 'Side',
      price: 'Price',
      quantity: 'Quantity',
      fee: 'Fee',
      meta: 'Meta',
      trade: 'Trade',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Posts',

    dashboardCard: {
      title: 'Posts',
    },

    list: {
      menu: 'Posts',
      title: 'Posts',
      noResults: 'Keine posts gefunden.',
    },

    export: {
      success: 'Posts erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Post',
    },

    new: {
      menu: 'Neuer Post',
      title: 'Neuer Post',
      success: 'Post erfolgreich erstellt',
    },

    edit: {
      menu: 'Posts bearbeiten',
      title: 'Posts bearbeiten',
      success: 'Post erfolgreich aktualisiert',
    },

    restore: {
      success: 'Post erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen post auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Post wiederherstellen?',
    },

    restoreMany: {
      success: 'Post(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen post auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Post(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten post(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Post(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen post auswählen, um ihn zu archivieren.',
      confirmTitle: 'Post(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten post(n) archivieren möchten?',
    },

    archive: {
      success: 'Post erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen post auswählen, um ihn zu archivieren.',
      confirmTitle: 'Post archivieren?',
    },

    destroyMany: {
      success: 'Post(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen post auswählen, um ihn zu löschen.',
      confirmTitle: 'Post(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten post löschen möchten?',
    },

    destroy: {
      success: 'Post erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen post auswählen, um ihn zu löschen.',
      confirmTitle: 'Post löschen?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      meta: 'Meta',
      files: 'Files',
      images: 'Images',
      type: 'Type',
      user: 'User',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Comments',

    dashboardCard: {
      title: 'Comments',
    },

    list: {
      menu: 'Comments',
      title: 'Comments',
      noResults: 'Keine comments gefunden.',
    },

    export: {
      success: 'Comments erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Comment',
    },

    new: {
      menu: 'Neuer Comment',
      title: 'Neuer Comment',
      success: 'Comment erfolgreich erstellt',
    },

    edit: {
      menu: 'Comments bearbeiten',
      title: 'Comments bearbeiten',
      success: 'Comment erfolgreich aktualisiert',
    },

    restore: {
      success: 'Comment erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen comment auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Comment wiederherstellen?',
    },

    restoreMany: {
      success: 'Comment(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen comment auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Comment(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten comment(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Comment(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen comment auswählen, um ihn zu archivieren.',
      confirmTitle: 'Comment(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten comment(n) archivieren möchten?',
    },

    archive: {
      success: 'Comment erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen comment auswählen, um ihn zu archivieren.',
      confirmTitle: 'Comment archivieren?',
    },

    destroyMany: {
      success: 'Comment(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen comment auswählen, um ihn zu löschen.',
      confirmTitle: 'Comment(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten comment löschen möchten?',
    },

    destroy: {
      success: 'Comment erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen comment auswählen, um ihn zu löschen.',
      confirmTitle: 'Comment löschen?',
    },

    fields: {
      body: 'Body',
      meta: 'Meta',
      type: 'Type',
      images: 'Images',
      user: 'User',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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

  article: {
    label: 'Articles',

    dashboardCard: {
      title: 'Articles',
    },

    list: {
      menu: 'Articles',
      title: 'Articles',
      noResults: 'Keine articles gefunden.',
    },

    export: {
      success: 'Articles erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Article',
    },

    new: {
      menu: 'Neuer Article',
      title: 'Neuer Article',
      success: 'Article erfolgreich erstellt',
    },

    edit: {
      menu: 'Articles bearbeiten',
      title: 'Articles bearbeiten',
      success: 'Article erfolgreich aktualisiert',
    },

    restore: {
      success: 'Article erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen article auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Article wiederherstellen?',
    },

    restoreMany: {
      success: 'Article(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen article auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Article(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten article(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Article(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen article auswählen, um ihn zu archivieren.',
      confirmTitle: 'Article(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten article(n) archivieren möchten?',
    },

    archive: {
      success: 'Article erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen article auswählen, um ihn zu archivieren.',
      confirmTitle: 'Article archivieren?',
    },

    destroyMany: {
      success: 'Article(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen article auswählen, um ihn zu löschen.',
      confirmTitle: 'Article(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten article löschen möchten?',
    },

    destroy: {
      success: 'Article erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen article auswählen, um ihn zu löschen.',
      confirmTitle: 'Article löschen?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      meta: 'Meta',
      type: 'Type',
      images: 'Images',
      files: 'Files',
      user: 'User',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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

  chat: {
    label: 'Chats',

    dashboardCard: {
      title: 'Chats',
    },

    list: {
      menu: 'Chats',
      title: 'Chats',
      noResults: 'Keine chats gefunden.',
    },

    export: {
      success: 'Chats erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Chat',
    },

    new: {
      menu: 'Neuer Chat',
      title: 'Neuer Chat',
      success: 'Chat erfolgreich erstellt',
    },

    edit: {
      menu: 'Chats bearbeiten',
      title: 'Chats bearbeiten',
      success: 'Chat erfolgreich aktualisiert',
    },

    restore: {
      success: 'Chat erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen chat auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Chat wiederherstellen?',
    },

    restoreMany: {
      success: 'Chat(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen chat auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Chat(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten chat(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Chat(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen chat auswählen, um ihn zu archivieren.',
      confirmTitle: 'Chat(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten chat(n) archivieren möchten?',
    },

    archive: {
      success: 'Chat erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen chat auswählen, um ihn zu archivieren.',
      confirmTitle: 'Chat archivieren?',
    },

    destroyMany: {
      success: 'Chat(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen chat auswählen, um ihn zu löschen.',
      confirmTitle: 'Chat(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten chat löschen möchten?',
    },

    destroy: {
      success: 'Chat erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen chat auswählen, um ihn zu löschen.',
      confirmTitle: 'Chat löschen?',
    },

    fields: {
      name: 'Name',
      media: 'Media',
      meta: 'Meta',
      active: 'Active',
      messages: 'Messages',
      chatees: 'Chatees',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Chatees',

    dashboardCard: {
      title: 'Chatees',
    },

    list: {
      menu: 'Chatees',
      title: 'Chatees',
      noResults: 'Keine chatees gefunden.',
    },

    export: {
      success: 'Chatees erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Chatee',
    },

    new: {
      menu: 'Neuer Chatee',
      title: 'Neuer Chatee',
      success: 'Chatee erfolgreich erstellt',
    },

    edit: {
      menu: 'Chatees bearbeiten',
      title: 'Chatees bearbeiten',
      success: 'Chatee erfolgreich aktualisiert',
    },

    restore: {
      success: 'Chatee erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen chatee auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Chatee wiederherstellen?',
    },

    restoreMany: {
      success: 'Chatee(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen chatee auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Chatee(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten chatee(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Chatee(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen chatee auswählen, um ihn zu archivieren.',
      confirmTitle: 'Chatee(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten chatee(n) archivieren möchten?',
    },

    archive: {
      success: 'Chatee erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen chatee auswählen, um ihn zu archivieren.',
      confirmTitle: 'Chatee archivieren?',
    },

    destroyMany: {
      success: 'Chatee(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen chatee auswählen, um ihn zu löschen.',
      confirmTitle: 'Chatee(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten chatee löschen möchten?',
    },

    destroy: {
      success: 'Chatee erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen chatee auswählen, um ihn zu löschen.',
      confirmTitle: 'Chatee löschen?',
    },

    fields: {
      nickname: 'Nickname',
      status: 'Status',
      role: 'Role',
      meta: 'Meta',
      user: 'User',
      chat: 'Chat',
      messages: 'Messages',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Messages',

    dashboardCard: {
      title: 'Messages',
    },

    list: {
      menu: 'Messages',
      title: 'Messages',
      noResults: 'Keine messages gefunden.',
    },

    export: {
      success: 'Messages erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Message',
    },

    new: {
      menu: 'Neuer Message',
      title: 'Neuer Message',
      success: 'Message erfolgreich erstellt',
    },

    edit: {
      menu: 'Messages bearbeiten',
      title: 'Messages bearbeiten',
      success: 'Message erfolgreich aktualisiert',
    },

    restore: {
      success: 'Message erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen message auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Message wiederherstellen?',
    },

    restoreMany: {
      success: 'Message(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen message auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Message(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten message(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Message(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen message auswählen, um ihn zu archivieren.',
      confirmTitle: 'Message(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten message(n) archivieren möchten?',
    },

    archive: {
      success: 'Message erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen message auswählen, um ihn zu archivieren.',
      confirmTitle: 'Message archivieren?',
    },

    destroyMany: {
      success: 'Message(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen message auswählen, um ihn zu löschen.',
      confirmTitle: 'Message(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten message löschen möchten?',
    },

    destroy: {
      success: 'Message erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen message auswählen, um ihn zu löschen.',
      confirmTitle: 'Message löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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

  feeSchedule: {
    label: 'FeeSchedules',

    dashboardCard: {
      title: 'FeeSchedules',
    },

    list: {
      menu: 'FeeSchedules',
      title: 'FeeSchedules',
      noResults: 'Keine feeschedules gefunden.',
    },

    export: {
      success: 'FeeSchedules erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen FeeSchedule',
    },

    new: {
      menu: 'Neuer FeeSchedule',
      title: 'Neuer FeeSchedule',
      success: 'FeeSchedule erfolgreich erstellt',
    },

    edit: {
      menu: 'FeeSchedules bearbeiten',
      title: 'FeeSchedules bearbeiten',
      success: 'FeeSchedule erfolgreich aktualisiert',
    },

    restore: {
      success: 'FeeSchedule erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen feeschedule auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'FeeSchedule wiederherstellen?',
    },

    restoreMany: {
      success: 'FeeSchedule(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen feeschedule auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'FeeSchedule(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten feeschedule(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'FeeSchedule(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen feeschedule auswählen, um ihn zu archivieren.',
      confirmTitle: 'FeeSchedule(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten feeschedule(n) archivieren möchten?',
    },

    archive: {
      success: 'FeeSchedule erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen feeschedule auswählen, um ihn zu archivieren.',
      confirmTitle: 'FeeSchedule archivieren?',
    },

    destroyMany: {
      success: 'FeeSchedule(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen feeschedule auswählen, um ihn zu löschen.',
      confirmTitle: 'FeeSchedule(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten feeschedule löschen möchten?',
    },

    destroy: {
      success: 'FeeSchedule erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen feeschedule auswählen, um ihn zu löschen.',
      confirmTitle: 'FeeSchedule löschen?',
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

      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'BalanceSnapshots',

    dashboardCard: {
      title: 'BalanceSnapshots',
    },

    list: {
      menu: 'BalanceSnapshots',
      title: 'BalanceSnapshots',
      noResults: 'Keine balancesnapshots gefunden.',
    },

    export: {
      success: 'BalanceSnapshots erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen BalanceSnapshot',
    },

    new: {
      menu: 'Neuer BalanceSnapshot',
      title: 'Neuer BalanceSnapshot',
      success: 'BalanceSnapshot erfolgreich erstellt',
    },

    edit: {
      menu: 'BalanceSnapshots bearbeiten',
      title: 'BalanceSnapshots bearbeiten',
      success: 'BalanceSnapshot erfolgreich aktualisiert',
    },

    restore: {
      success: 'BalanceSnapshot erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen balancesnapshot auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'BalanceSnapshot wiederherstellen?',
    },

    restoreMany: {
      success: 'BalanceSnapshot(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen balancesnapshot auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'BalanceSnapshot(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten balancesnapshot(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'BalanceSnapshot(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen balancesnapshot auswählen, um ihn zu archivieren.',
      confirmTitle: 'BalanceSnapshot(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten balancesnapshot(n) archivieren möchten?',
    },

    archive: {
      success: 'BalanceSnapshot erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen balancesnapshot auswählen, um ihn zu archivieren.',
      confirmTitle: 'BalanceSnapshot archivieren?',
    },

    destroyMany: {
      success: 'BalanceSnapshot(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen balancesnapshot auswählen, um ihn zu löschen.',
      confirmTitle: 'BalanceSnapshot(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten balancesnapshot löschen möchten?',
    },

    destroy: {
      success: 'BalanceSnapshot erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen balancesnapshot auswählen, um ihn zu löschen.',
      confirmTitle: 'BalanceSnapshot löschen?',
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
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'SystemAccounts',

    dashboardCard: {
      title: 'SystemAccounts',
    },

    list: {
      menu: 'SystemAccounts',
      title: 'SystemAccounts',
      noResults: 'Keine systemaccounts gefunden.',
    },

    export: {
      success: 'SystemAccounts erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen SystemAccount',
    },

    new: {
      menu: 'Neuer SystemAccount',
      title: 'Neuer SystemAccount',
      success: 'SystemAccount erfolgreich erstellt',
    },

    edit: {
      menu: 'SystemAccounts bearbeiten',
      title: 'SystemAccounts bearbeiten',
      success: 'SystemAccount erfolgreich aktualisiert',
    },

    restore: {
      success: 'SystemAccount erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen systemaccount auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'SystemAccount wiederherstellen?',
    },

    restoreMany: {
      success: 'SystemAccount(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen systemaccount auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'SystemAccount(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten systemaccount(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'SystemAccount(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen systemaccount auswählen, um ihn zu archivieren.',
      confirmTitle: 'SystemAccount(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten systemaccount(n) archivieren möchten?',
    },

    archive: {
      success: 'SystemAccount erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen systemaccount auswählen, um ihn zu archivieren.',
      confirmTitle: 'SystemAccount archivieren?',
    },

    destroyMany: {
      success: 'SystemAccount(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen systemaccount auswählen, um ihn zu löschen.',
      confirmTitle: 'SystemAccount(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten systemaccount löschen möchten?',
    },

    destroy: {
      success: 'SystemAccount erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen systemaccount auswählen, um ihn zu löschen.',
      confirmTitle: 'SystemAccount löschen?',
    },

    fields: {
      type: 'Type',
      name: 'Name',
      description: 'Description',
      isActive: 'IsActive',
      meta: 'Meta',

      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
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
    label: 'Feedbacks',

    dashboardCard: {
      title: 'Feedbacks',
    },

    list: {
      menu: 'Feedbacks',
      title: 'Feedbacks',
      noResults: 'Keine feedbacks gefunden.',
    },

    export: {
      success: 'Feedbacks erfolgreich exportiert',
    },

    view: {
      title: 'Ansehen Feedback',
    },

    new: {
      menu: 'Neuer Feedback',
      title: 'Neuer Feedback',
      success: 'Feedback erfolgreich erstellt',
    },

    edit: {
      menu: 'Feedbacks bearbeiten',
      title: 'Feedbacks bearbeiten',
      success: 'Feedback erfolgreich aktualisiert',
    },

    restore: {
      success: 'Feedback erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen feedback auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Feedback wiederherstellen?',
    },

    restoreMany: {
      success: 'Feedback(n) erfolgreich wiederhergestellt',
      noSelection: 'Sie müssen mindestens einen feedback auswählen, um ihn wiederherzustellen.',
      confirmTitle: 'Feedback(n) wiederherstellen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten feedback(n) wiederherstellen möchten?',
    },

    archiveMany: {
      success: 'Feedback(n) erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen feedback auswählen, um ihn zu archivieren.',
      confirmTitle: 'Feedback(n) archivieren?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten feedback(n) archivieren möchten?',
    },

    archive: {
      success: 'Feedback erfolgreich archiviert',
      noSelection: 'Sie müssen mindestens einen feedback auswählen, um ihn zu archivieren.',
      confirmTitle: 'Feedback archivieren?',
    },

    destroyMany: {
      success: 'Feedback(n) erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen feedback auswählen, um ihn zu löschen.',
      confirmTitle: 'Feedback(n) löschen?',
      confirmDescription:
        'Sind Sie sicher, dass Sie die {0} ausgewählten feedback löschen möchten?',
    },

    destroy: {
      success: 'Feedback erfolgreich gelöscht',
      noSelection:
        'Sie müssen mindestens einen feedback auswählen, um ihn zu löschen.',
      confirmTitle: 'Feedback löschen?',
    },

    fields: {
      title: 'Title',
      description: 'Description',
      attachments: 'Attachments',
      type: 'Type',
      status: 'Status',
      user: 'User',
      createdByMembership: 'Erstellt von',
      updatedByMembership: 'Aktualisiert von',
      archivedByMembership: 'Archiviert von',
      createdAt: 'Erstellt am',
      updatedAt: 'Aktualisiert am',
      archivedAt: 'Archiviert am',
    },

    hints: {
      title: '',
      description: '',
      attachments: '',
      type: '',
      status: '',
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

  auditLog: {
    list: {
      menu: 'Prüfprotokolle',
      title: 'Prüfprotokolle',
      noResults: 'Keine Prüfprotokolle gefunden.',
    },

    changesDialog: {
      title: 'Prüfprotokoll',
      changes: 'Änderungen',
      noChanges: 'In diesem Protokoll gibt es keine Änderungen.',
    },

    export: {
      success: 'Prüfprotokolle erfolgreich exportiert',
    },

    fields: {
      timestamp: 'Datum',
      entityName: 'Entität',
      entityNames: 'Entitäten',
      entityId: 'Entitäts-ID',
      operation: 'Vorgang',
      operations: 'Vorgänge',
      membership: 'Benutzer',
      apiKey: 'API-Schlüssel',
      apiEndpoint: 'API-Endpunkt',
      apiHttpResponseCode: 'API-Status',
      transactionId: 'Transaktions-ID',
    },

    enumerators: {
      operation: {
        SI: 'Anmeldung',
        SO: 'Abmeldung',
        SU: 'Registrierung',
        PRR: 'Passwortzurücksetzung angefordert',
        PRC: 'Passwortzurücksetzung bestätigt',
        PC: 'Passwort geändert',
        VER: 'E-Mail-Überprüfung angefordert',
        VEC: 'E-Mail bestätigt',
        C: 'Erstellen',
        U: 'Aktualisieren',
        D: 'Löschen',
        AG: 'API Abruf',
        APO: 'API Post',
        APU: 'API Put',
        AD: 'API Löschen',
      },
    },

    dashboardCard: {
      activityChart: 'Aktivität',
      activityList: 'Kürzliche Aktivitäten',
    },

    readableOperations: {
      SI: '{0} hat sich angemeldet',
      SU: '{0} hat sich registriert',
      PRR: '{0} hat eine Passwortzurücksetzung angefordert',
      PRC: '{0} hat die Passwortzurücksetzung bestätigt',
      PC: '{0} hat das Passwort geändert',
      VER: '{0} hat eine E-Mail-Überprüfung angefordert',
      VEC: '{0} hat die E-Mail bestätigt',
      C: '{0} hat {1} {2} erstellt',
      U: '{0} hat {1} {2} aktualisiert',
      D: '{0} hat {1} {2} gelöscht',
    },
  },

  recaptcha: {
    errors: {
      disabled:
        'reCAPTCHA ist auf dieser Plattform deaktiviert. Überprüfung wird übersprungen.',
      invalid: 'Ungültiges reCAPTCHA',
    },
  },

  emails: {
    passwordResetEmail: {
      subject: `Setzen Sie Ihr Passwort für {0} zurück`,
      content: `<p>Hallo,</p> <p>Folgen Sie diesem Link, um Ihr Passwort für {0} zurückzusetzen.</p> <p><a href="{1}">{1}</a></p> <p>Wenn Sie nicht darum gebeten haben, Ihr Passwort zurückzusetzen, können Sie diese E-Mail ignorieren.</p> <p>Danke,</p> <p>Ihr {0} Team</p>`,
    },
    verifyEmailEmail: {
      subject: `Bestätigen Sie Ihre E-Mail für {0}`,
      content: `<p>Hallo,</p><p>Folgen Sie diesem Link, um Ihre E-Mail-Adresse zu bestätigen.</p><p><a href="{1}">{1}</a></p><p>Wenn Sie nicht darum gebeten haben, diese Adresse zu bestätigen, können Sie diese E-Mail ignorieren.</p> <p>Danke,</p> <p>Ihr {0} Team</p>`,
    },
    invitationEmail: {
      singleTenant: {
        subject: `Sie wurden zu {0} eingeladen`,
        content: `<p>Hallo,</p> <p>Sie wurden zu {0} eingeladen.</p> <p>Folgen Sie diesem Link zur Registrierung.</p> <p><a href="{1}">{1}</a></p> <p>Danke,</p> <p>Ihr {0} Team</p>`,
      },
      multiTenant: {
        subject: `Sie wurden zu {1} bei {0} eingeladen`,
        content: `<p>Hallo,</p> <p>Sie wurden zu {2} eingeladen.</p> <p>Folgen Sie diesem Link zur Registrierung.</p> <p><a href="{1}">{1}</a></p> <p>Danke,</p> <p>Ihr {0} Team</p>`,
      },
    },
    errors: {
      emailNotConfigured: 'E-Mail ENV-Variablen fehlen',
    },
  },
};

export default dictionary;
