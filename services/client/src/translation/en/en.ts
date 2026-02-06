const dictionary = {
  

  projectName: 'Project',

  shared: {
    showArchived: 'Show Archived?',
    archive: 'Archive',
    restore: 'Restore',
    archived: 'Archived',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    save: 'Save',
    clear: 'Clear',
    decline: 'Decline',
    accept: 'Accept',
    dashboard: 'Dashboard',
    new: 'New',
    searchNotFound: 'Nothing found.',
    searchPlaceholder: 'Search...',
    selectPlaceholder: 'Select an option',
    datePlaceholder: 'Pick a date',
    timePlaceholder: 'Pick a time',
    dateFormat: 'MMM DD, YYYY',
    timeFormat: 'hh:mma',
    datetimeFormat: 'MMM DD, YYYY hh:mma',
    tagsPlaceholder: 'Type and press enter to add',
    edit: 'Edit',
    delete: 'Delete',
    openMenu: 'Open menu',
    submit: 'Submit',
    search: 'Search',
    reset: 'Reset',
    min: 'Min',
    max: 'Max',
    view: 'View',
    copiedToClipboard: 'Copied to clipboard',
    exportToCsv: 'Export to CSV',
    import: 'Import',
    pause: 'Pause',
    discard: 'Discard',
    preferences: 'Preferences',
    session: 'Session',
    deleted: 'Deleted',
    remove: 'Remove',
    startDate: 'Start date',
    endDate: 'End date',

    unsavedChanges: {
      message: 'You have unsaved changes.',
      proceed: 'Discard',
      dismiss: 'Cancel',
      saveChanges: 'Save Changes',
    },

    importer: {
      importHashAlreadyExists: 'Data has already been imported',
      title: 'Import CSV File',
      menu: 'Import CSV File',
      line: 'Line',
      status: 'Status',
      pending: 'Pending',
      success: 'Imported',
      error: 'Error',
      total: `{0} imported, {1} pending and {2} with error`,
      importedMessage: `Processed {0} of {1}.`,
      noValidRows: 'There are no valid rows.',
      noNavigateAwayMessage:
        'Do not navigate away from this page or import will be stopped.',
      completed: {
        success: 'Import completed. All rows were successfully imported.',
        someErrors:
          'Processing completed, but some rows were unable to be imported.',
        allErrors: 'Import failed. There are no valid rows.',
      },
      form: {
        downloadTemplate: 'Download the template',
      },
      list: {
        newConfirm: 'Are you sure?',
        discardConfirm: 'Are you sure? Non-imported data will be lost.',
      },
      errors: {
        invalidFileEmpty: 'The file is empty',
        invalidFileCsv: 'Only CSV (.csv) files are allowed',
        invalidFileUpload:
          'Invalid file. Make sure you are using the last version of the template.',
        importHashRequired: 'Import hash is required',
        importHashExistent: 'Data has already been imported',
      },
    },

    dataTable: {
      filters: 'Filters',
      noResults: 'No results found.',
      viewOptions: 'View',
      toggleColumns: 'Toggle Columns',
      actions: 'Actions',

      sortAscending: 'Asc',
      sortDescending: 'Desc',
      hide: 'Hide',

      selectAll: 'Select All',
      selectRow: 'Select Row',
      paginationTotal: 'Total: {0} row(s)',
      paginationSelected: '{0} row(s) selected.',
      paginationRowsPerPage: 'Rows per page',
      paginationCurrent: `Page {0} of {1}`,
      paginationGoToFirst: 'Go to first page',
      paginationGoToPrevious: 'Go to previous page',
      paginationGoToNext: 'Go to next page',
      paginationGoToLast: 'Go to last page',
    },

    locales: {
      en: 'English',
      es: 'Spanish',
      de: 'German',
      'pt-BR': 'Português (Brasil)',
    },

    localeSwitcher: {
      searchPlaceholder: 'Search language...',
      title: 'Language',
      placeholder: 'Select a Language',
      searchEmpty: 'No language found.',
    },

    theme: {
      toggle: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },

    errors: {
      cannotDeleteReferenced: `Cannot delete {0} because it's referenced by one or more {1}.`,
      timezone: 'Invalid timezone',
      required: `{0} is a required field`,
      invalid: `{0} is invalid`,
      dateFuture: `{0} must be in the future`,
      unknown: 'An error occurred',
      unique: `{0} must be unique`,
    },
  },

  apiKey: {
    docs: {
      menu: 'API Docs',
    },
    form: {
      addAll: 'Add All',
    },
    edit: {
      menu: 'Edit API Key',
      title: 'Edit API Key',
      success: 'API Key successfully updated',
    },
    new: {
      menu: 'New API Key',
      title: 'New API Key',
      success: 'API Key successfully created',
      text: `Save your API key! For security reasons you'll be able to see the API key only once.`,
      subtext: `You must add it to the Authorization header of your API calls.`,
      backToApiKeys: 'Back to API Keys',
    },
    list: {
      menu: 'API Keys',
      title: 'API Keys',
      viewActivity: 'View Activity',
      noResults: 'No API keys found.',
    },
    destroy: {
      confirmTitle: 'Delete API Key?',
      success: 'API Key successfully deleted',
    },
    enumerators: {
      status: {
        active: 'Active',
        disabled: 'Disabled',
        expired: 'Expired',
      },
    },
    fields: {
      apiKey: 'API Key',
      membership: 'User',
      name: 'Name',
      keyPrefix: 'Key Prefix',
      key: 'Key',
      scopes: 'Scopes',
      expiresAt: 'Expires At',
      status: 'Status',
      createdAt: 'Created At',
      disabled: 'Disabled',
    },
    disabledTooltip: `Disabled at {0}.`,
    errors: {
      invalidScopes: "scopes must match user's role",
    },
  },

  file: {
    button: 'Upload',
    delete: 'Delete',
    errors: {
      formats: `Invalid format. Must be one of: {0}.`,
      notImage: `File must be an image`,
      tooBig: `File is too big. Current size is {0} bytes, maximum size is {1} bytes`,
    },
  },

  auth: {
    signIn: {
      oauthError:
        'Not possible to sign-in with this provider. Please use another one.',
      title: 'Sign In',
      button: 'Sign In with Email',
      success: 'Successfully signed in',
      email: 'Email',
      password: 'Password',
      socialHeader: 'Or continue with',
      facebook: 'Facebook',
      github: 'GitHub',
      google: 'Google',
      passwordResetRequestLink: 'Forgot Password?',
      signUpLink: `Don't have an account? Create one`,
    },
    signUp: {
      title: 'Sign Up',
      signInLink: 'Already have an account? Sign in',
      button: 'Sign Up',
      success: 'Successfully signed up',
      email: 'Email',
      password: 'Password',
    },
    verifyEmailRequest: {
      title: 'Resend email verification',
      button: 'Resend email verification',
      message: 'Please confirm your email at <strong>{0}</strong> to continue.',
      success: 'Email verification successfully sent!',
    },
    verifyEmailConfirm: {
      title: 'Verify your email',
      success: 'Email successfully verified.',
      loadingMessage: 'Just a moment, your email is being verified...',
    },
    passwordResetRequest: {
      title: 'Forgot Password',
      signInLink: 'Cancel',
      button: 'Send password reset email',
      email: 'Email',
      success: 'Password reset email successfully sent',
    },
    passwordResetConfirm: {
      title: 'Reset Password',
      signInLink: 'Cancel',
      button: 'Reset Password',
      password: 'Password',
      success: 'Password successfully changed',
    },
    noPermissions: {
      title: 'Waiting for Permissions',
      message:
        'You have no permissions yet. Please wait for the admin to grant you privileges.',
    },
    invitation: {
      title: 'Invitations',
      success: 'Invitation successfully accepted',
      acceptWrongEmail: 'Accept Invitation With This Email',
      loadingMessage: 'Just a moment, we are accepting the invitation...',
      invalidToken: 'Expired or invalid invitation token.',
    },
    tenant: {
      title: 'Workspaces',
      create: {
        name: 'Workspace Name',
        success: 'Workspace successfully created',
        button: 'Create Workspace',
      },
      select: {
        tenant: 'Select a Workspace',
        joinSuccess: 'Successfully joined workspace',
        select: 'Select Workspace',
        acceptInvitation: 'Accept Invitation',
      },
    },
    passwordChange: {
      title: 'Password Change',
      subtitle: 'Please provide your old and new passwords.',
      menu: 'Password Change',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      newPasswordConfirmation: 'New Password Confirmation',
      button: 'Save Password',
      success: 'Password changed successfully saved',
      mustMatch: 'Passwords must match',
      cancel: 'Cancel',
    },
    profile: {
      title: 'Profile',
      subtitle:
        'Your profile will be shared among other users in your workspace.',
      menu: 'Profile',
      firstName: 'First Name',
      lastName: 'Last Name',
      avatars: 'Avatar',
      button: 'Save Profile',
      success: 'Profile successfully saved',
      cancel: 'Cancel',
    },
    profileOnboard: {
      title: 'Profile',
      firstName: 'First Name',
      lastName: 'Last Name',
      avatars: 'Avatar',
      button: 'Save Profile',
      success: 'Profile successfully saved',
    },
    signOut: {
      menu: 'Sign Out',
      button: 'Sign Out',
      title: 'Sign Out',
      loading: `You're being signed out...`,
    },
    errors: {
      invalidApiKey: 'Invalid or expired API Key',
      emailNotFound: 'Email not found',
      userNotFound: "Sorry, we don't recognize your credentials",
      wrongPassword: "Sorry, we don't recognize your credentials",
      weakPassword: 'This password is too weak',
      emailAlreadyInUse: 'Email is already in use',
      invalidPasswordResetToken:
        'Password reset link is invalid or has expired',
      invalidVerifyEmailToken:
        'Email verification link is invalid or has expired',
      wrongOldPassword: 'The old password is wrong',
    },
  },

  tenant: {
    switcher: {
      title: 'Workspaces',
      placeholder: 'Select a Workspace',
      searchPlaceholder: 'Search workspace...',
      searchEmpty: 'No workspace found.',
      create: 'Create Workspace',
    },

    invite: {
      title: `Accept Invitation to {0}`,
      message: `You've been invited to {0}. You may choose to accept or decline.`,
    },

    form: {
      name: 'Name',

      new: {
        title: 'Create Workspace',
        success: 'Workspace successfully created',
      },

      edit: {
        title: 'Workspace Settings',
        success: 'Workspace successfully updated',
      },
    },

    destroy: {
      success: 'Workspace successfully deleted',
      confirmTitle: 'Delete Workspace?',
      confirmDescription:
        'Are you sure you want to delete the {0} workspace? This action is irreversible!',
    },
  },

  membership: {
    dashboardCard: {
      title: 'Users',
    },

    view: {
      title: 'View User',
    },

    showActivity: 'Activity',

    list: {
      menu: 'Users',
      title: 'Users',
      noResults: 'No users found.',
    },

    export: {
      success: 'Users successfully exported',
    },

    edit: {
      menu: 'Edit User',
      title: 'Edit User',
      success: 'User successfully updated',
    },

    new: {
      menu: 'New User',
      title: 'New User',
      success: 'User successfully created',
    },

    destroyMany: {
      success: 'User(s) successfully deleted',
      noSelection: 'You must select at least one user to delete.',
      confirmTitle: 'Delete User(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected user(s)?',
    },

    destroy: {
      success: 'User successfully deleted',
      noSelection: 'You must select at least one user to delete.',
      confirmTitle: 'Delete User?',
    },

    resendInvitationEmail: {
      button: 'Resend Invitation Email',
      success: 'Invitation email successfully sent',
    },

    fields: {
      avatars: 'Avatar',
      fullName: 'Full Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      roles: 'Roles',
      status: 'Status',
    },

    enumerators: {
      roles: {
        admin: 'Admin',
        custom: 'Custom',
      },

      status: {
        invited: 'Invited',
        active: 'Active',
        disabled: 'Disabled',
      },
    },

    errors: {
      cannotRemoveSelfAdminRole: "You can't remove your own admin role",
      cannotDeleteSelf: "You can't remove your own membership",
      notInvited: 'You are not invited',
      invalidStatus: `Invalid status: {0}`,
      alreadyMember: `{0} is already a member`,
      notSameEmail: `This invitation was sent to {0} but you're signed in as {1}. Do you want to continue?`,
    },
  },

  subscription: {
    menu: 'Subscription',
    title: 'Plans and Pricing',
    current: 'Current Plan',

    subscribe: 'Subscribe',
    manage: 'Manage',
    notPlanUser: 'You are not the manager of this subscription.',
    cancelAtPeriodEnd: 'This plan will be canceled at the end of the period.',

    plans: {
      free: {
        title: 'Free',
        price: '$0',
        pricingPeriod: '/month',
        features: {
          first: 'First feature description',
          second: 'Second feature description',
          third: 'Third feature description',
        },
      },
      basic: {
        title: 'Basic',
        price: '$10',
        pricingPeriod: '/month',
        features: {
          first: 'First feature description',
          second: 'Second feature description',
          third: 'Third feature description',
        },
      },
      enterprise: {
        title: 'Enterprise',
        price: '$50',
        pricingPeriod: '/month',
        features: {
          first: 'First feature description',
          second: 'Second feature description',
          third: 'Third feature description',
        },
      },
    },

    errors: {
      disabled: 'Subscriptions are disabled in this platform',
      alreadyExistsActive: 'There is an active subscription already',
      stripeNotConfigured: 'Stripe ENV vars are missing',
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
      noResults: 'No accounts found.',
    },

    export: {
      success: 'Accounts successfully exported',
    },

    new: {
      menu: 'New Account',
      title: 'New Account',
      success: 'Account successfully created',
    },

    view: {
      title: 'View Account',
    },

    edit: {
      menu: 'Edit Account',
      title: 'Edit Account',
      success: 'Account successfully updated',
    },

    restore: {
      success: 'Account successfully restored',
      noSelection: 'You must select at least one account to restore.',
      confirmTitle: 'Restore Account?',
    },

    restoreMany: {
      success: 'Account(s) successfully restored',
      noSelection: 'You must select at least one account to restore.',
      confirmTitle: 'Restore Account(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected account(s)?',
    },

    archiveMany: {
      success: 'Account(s) successfully archived',
      noSelection: 'You must select at least one account to archive.',
      confirmTitle: 'Archive Account(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected account(s)?',
    },

    archive: {
      success: 'Account successfully archived',
      noSelection: 'You must select at least one account to archive.',
      confirmTitle: 'Archive Account?',
    },

    destroyMany: {
      success: 'Account(s) successfully deleted',
      noSelection: 'You must select at least one account to delete.',
      confirmTitle: 'Delete Account(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected account(s)?',
    },

    destroy: {
      success: 'Account successfully deleted',
      noSelection: 'You must select at least one account to delete.',
      confirmTitle: 'Delete Account?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No wallets found.',
    },

    export: {
      success: 'Wallets successfully exported',
    },

    new: {
      menu: 'New Wallet',
      title: 'New Wallet',
      success: 'Wallet successfully created',
    },

    view: {
      title: 'View Wallet',
    },

    edit: {
      menu: 'Edit Wallet',
      title: 'Edit Wallet',
      success: 'Wallet successfully updated',
    },

    restore: {
      success: 'Wallet successfully restored',
      noSelection: 'You must select at least one wallet to restore.',
      confirmTitle: 'Restore Wallet?',
    },

    restoreMany: {
      success: 'Wallet(s) successfully restored',
      noSelection: 'You must select at least one wallet to restore.',
      confirmTitle: 'Restore Wallet(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected wallet(s)?',
    },

    archiveMany: {
      success: 'Wallet(s) successfully archived',
      noSelection: 'You must select at least one wallet to archive.',
      confirmTitle: 'Archive Wallet(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected wallet(s)?',
    },

    archive: {
      success: 'Wallet successfully archived',
      noSelection: 'You must select at least one wallet to archive.',
      confirmTitle: 'Archive Wallet?',
    },

    destroyMany: {
      success: 'Wallet(s) successfully deleted',
      noSelection: 'You must select at least one wallet to delete.',
      confirmTitle: 'Delete Wallet(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected wallet(s)?',
    },

    destroy: {
      success: 'Wallet successfully deleted',
      noSelection: 'You must select at least one wallet to delete.',
      confirmTitle: 'Delete Wallet?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No deposits found.',
    },

    export: {
      success: 'Deposits successfully exported',
    },

    new: {
      menu: 'New Deposit',
      title: 'New Deposit',
      success: 'Deposit successfully created',
    },

    view: {
      title: 'View Deposit',
    },

    edit: {
      menu: 'Edit Deposit',
      title: 'Edit Deposit',
      success: 'Deposit successfully updated',
    },

    restore: {
      success: 'Deposit successfully restored',
      noSelection: 'You must select at least one deposit to restore.',
      confirmTitle: 'Restore Deposit?',
    },

    restoreMany: {
      success: 'Deposit(s) successfully restored',
      noSelection: 'You must select at least one deposit to restore.',
      confirmTitle: 'Restore Deposit(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected deposit(s)?',
    },

    archiveMany: {
      success: 'Deposit(s) successfully archived',
      noSelection: 'You must select at least one deposit to archive.',
      confirmTitle: 'Archive Deposit(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected deposit(s)?',
    },

    archive: {
      success: 'Deposit successfully archived',
      noSelection: 'You must select at least one deposit to archive.',
      confirmTitle: 'Archive Deposit?',
    },

    destroyMany: {
      success: 'Deposit(s) successfully deleted',
      noSelection: 'You must select at least one deposit to delete.',
      confirmTitle: 'Delete Deposit(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected deposit(s)?',
    },

    destroy: {
      success: 'Deposit successfully deleted',
      noSelection: 'You must select at least one deposit to delete.',
      confirmTitle: 'Delete Deposit?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No withdrawals found.',
    },

    export: {
      success: 'Withdrawals successfully exported',
    },

    new: {
      menu: 'New Withdrawal',
      title: 'New Withdrawal',
      success: 'Withdrawal successfully created',
    },

    view: {
      title: 'View Withdrawal',
    },

    edit: {
      menu: 'Edit Withdrawal',
      title: 'Edit Withdrawal',
      success: 'Withdrawal successfully updated',
    },

    restore: {
      success: 'Withdrawal successfully restored',
      noSelection: 'You must select at least one withdrawal to restore.',
      confirmTitle: 'Restore Withdrawal?',
    },

    restoreMany: {
      success: 'Withdrawal(s) successfully restored',
      noSelection: 'You must select at least one withdrawal to restore.',
      confirmTitle: 'Restore Withdrawal(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected withdrawal(s)?',
    },

    archiveMany: {
      success: 'Withdrawal(s) successfully archived',
      noSelection: 'You must select at least one withdrawal to archive.',
      confirmTitle: 'Archive Withdrawal(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected withdrawal(s)?',
    },

    archive: {
      success: 'Withdrawal successfully archived',
      noSelection: 'You must select at least one withdrawal to archive.',
      confirmTitle: 'Archive Withdrawal?',
    },

    destroyMany: {
      success: 'Withdrawal(s) successfully deleted',
      noSelection: 'You must select at least one withdrawal to delete.',
      confirmTitle: 'Delete Withdrawal(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected withdrawal(s)?',
    },

    destroy: {
      success: 'Withdrawal successfully deleted',
      noSelection: 'You must select at least one withdrawal to delete.',
      confirmTitle: 'Delete Withdrawal?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No orders found.',
    },

    export: {
      success: 'Orders successfully exported',
    },

    new: {
      menu: 'New Order',
      title: 'New Order',
      success: 'Order successfully created',
    },

    view: {
      title: 'View Order',
    },

    edit: {
      menu: 'Edit Order',
      title: 'Edit Order',
      success: 'Order successfully updated',
    },

    restore: {
      success: 'Order successfully restored',
      noSelection: 'You must select at least one order to restore.',
      confirmTitle: 'Restore Order?',
    },

    restoreMany: {
      success: 'Order(s) successfully restored',
      noSelection: 'You must select at least one order to restore.',
      confirmTitle: 'Restore Order(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected order(s)?',
    },

    archiveMany: {
      success: 'Order(s) successfully archived',
      noSelection: 'You must select at least one order to archive.',
      confirmTitle: 'Archive Order(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected order(s)?',
    },

    archive: {
      success: 'Order successfully archived',
      noSelection: 'You must select at least one order to archive.',
      confirmTitle: 'Archive Order?',
    },

    destroyMany: {
      success: 'Order(s) successfully deleted',
      noSelection: 'You must select at least one order to delete.',
      confirmTitle: 'Delete Order(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected order(s)?',
    },

    destroy: {
      success: 'Order successfully deleted',
      noSelection: 'You must select at least one order to delete.',
      confirmTitle: 'Delete Order?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No assets found.',
    },

    export: {
      success: 'Assets successfully exported',
    },

    new: {
      menu: 'New Asset',
      title: 'New Asset',
      success: 'Asset successfully created',
    },

    view: {
      title: 'View Asset',
    },

    edit: {
      menu: 'Edit Asset',
      title: 'Edit Asset',
      success: 'Asset successfully updated',
    },

    restore: {
      success: 'Asset successfully restored',
      noSelection: 'You must select at least one asset to restore.',
      confirmTitle: 'Restore Asset?',
    },

    restoreMany: {
      success: 'Asset(s) successfully restored',
      noSelection: 'You must select at least one asset to restore.',
      confirmTitle: 'Restore Asset(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected asset(s)?',
    },

    archiveMany: {
      success: 'Asset(s) successfully archived',
      noSelection: 'You must select at least one asset to archive.',
      confirmTitle: 'Archive Asset(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected asset(s)?',
    },

    archive: {
      success: 'Asset successfully archived',
      noSelection: 'You must select at least one asset to archive.',
      confirmTitle: 'Archive Asset?',
    },

    destroyMany: {
      success: 'Asset(s) successfully deleted',
      noSelection: 'You must select at least one asset to delete.',
      confirmTitle: 'Delete Asset(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected asset(s)?',
    },

    destroy: {
      success: 'Asset successfully deleted',
      noSelection: 'You must select at least one asset to delete.',
      confirmTitle: 'Delete Asset?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No instruments found.',
    },

    export: {
      success: 'Instruments successfully exported',
    },

    new: {
      menu: 'New Instrument',
      title: 'New Instrument',
      success: 'Instrument successfully created',
    },

    view: {
      title: 'View Instrument',
    },

    edit: {
      menu: 'Edit Instrument',
      title: 'Edit Instrument',
      success: 'Instrument successfully updated',
    },

    restore: {
      success: 'Instrument successfully restored',
      noSelection: 'You must select at least one instrument to restore.',
      confirmTitle: 'Restore Instrument?',
    },

    restoreMany: {
      success: 'Instrument(s) successfully restored',
      noSelection: 'You must select at least one instrument to restore.',
      confirmTitle: 'Restore Instrument(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected instrument(s)?',
    },

    archiveMany: {
      success: 'Instrument(s) successfully archived',
      noSelection: 'You must select at least one instrument to archive.',
      confirmTitle: 'Archive Instrument(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected instrument(s)?',
    },

    archive: {
      success: 'Instrument successfully archived',
      noSelection: 'You must select at least one instrument to archive.',
      confirmTitle: 'Archive Instrument?',
    },

    destroyMany: {
      success: 'Instrument(s) successfully deleted',
      noSelection: 'You must select at least one instrument to delete.',
      confirmTitle: 'Delete Instrument(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected instrument(s)?',
    },

    destroy: {
      success: 'Instrument successfully deleted',
      noSelection: 'You must select at least one instrument to delete.',
      confirmTitle: 'Delete Instrument?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No ledgerevents found.',
    },

    export: {
      success: 'LedgerEvents successfully exported',
    },

    new: {
      menu: 'New LedgerEvent',
      title: 'New LedgerEvent',
      success: 'LedgerEvent successfully created',
    },

    view: {
      title: 'View LedgerEvent',
    },

    edit: {
      menu: 'Edit LedgerEvent',
      title: 'Edit LedgerEvent',
      success: 'LedgerEvent successfully updated',
    },

    restore: {
      success: 'LedgerEvent successfully restored',
      noSelection: 'You must select at least one ledgerevent to restore.',
      confirmTitle: 'Restore LedgerEvent?',
    },

    restoreMany: {
      success: 'LedgerEvent(s) successfully restored',
      noSelection: 'You must select at least one ledgerevent to restore.',
      confirmTitle: 'Restore LedgerEvent(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected ledgerevent(s)?',
    },

    archiveMany: {
      success: 'LedgerEvent(s) successfully archived',
      noSelection: 'You must select at least one ledgerevent to archive.',
      confirmTitle: 'Archive LedgerEvent(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected ledgerevent(s)?',
    },

    archive: {
      success: 'LedgerEvent successfully archived',
      noSelection: 'You must select at least one ledgerevent to archive.',
      confirmTitle: 'Archive LedgerEvent?',
    },

    destroyMany: {
      success: 'LedgerEvent(s) successfully deleted',
      noSelection: 'You must select at least one ledgerevent to delete.',
      confirmTitle: 'Delete LedgerEvent(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected ledgerevent(s)?',
    },

    destroy: {
      success: 'LedgerEvent successfully deleted',
      noSelection: 'You must select at least one ledgerevent to delete.',
      confirmTitle: 'Delete LedgerEvent?',
    },

    fields: {
      type: 'Type',
      referenceId: 'ReferenceId',
      referenceType: 'ReferenceType',
      status: 'Status',
      description: 'Description',
      meta: 'Meta',
      entries: 'Entries',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No ledgerentries found.',
    },

    export: {
      success: 'LedgerEntries successfully exported',
    },

    new: {
      menu: 'New LedgerEntry',
      title: 'New LedgerEntry',
      success: 'LedgerEntry successfully created',
    },

    view: {
      title: 'View LedgerEntry',
    },

    edit: {
      menu: 'Edit LedgerEntry',
      title: 'Edit LedgerEntry',
      success: 'LedgerEntry successfully updated',
    },

    restore: {
      success: 'LedgerEntry successfully restored',
      noSelection: 'You must select at least one ledgerentry to restore.',
      confirmTitle: 'Restore LedgerEntry?',
    },

    restoreMany: {
      success: 'LedgerEntry(s) successfully restored',
      noSelection: 'You must select at least one ledgerentry to restore.',
      confirmTitle: 'Restore LedgerEntry(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected ledgerentry(s)?',
    },

    archiveMany: {
      success: 'LedgerEntry(s) successfully archived',
      noSelection: 'You must select at least one ledgerentry to archive.',
      confirmTitle: 'Archive LedgerEntry(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected ledgerentry(s)?',
    },

    archive: {
      success: 'LedgerEntry successfully archived',
      noSelection: 'You must select at least one ledgerentry to archive.',
      confirmTitle: 'Archive LedgerEntry?',
    },

    destroyMany: {
      success: 'LedgerEntry(s) successfully deleted',
      noSelection: 'You must select at least one ledgerentry to delete.',
      confirmTitle: 'Delete LedgerEntry(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected ledgerentry(s)?',
    },

    destroy: {
      success: 'LedgerEntry successfully deleted',
      noSelection: 'You must select at least one ledgerentry to delete.',
      confirmTitle: 'Delete LedgerEntry?',
    },

    fields: {
      amount: 'Amount',
      accountId: 'AccountId',
      meta: 'Meta',
      event: 'Event',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No trades found.',
    },

    export: {
      success: 'Trades successfully exported',
    },

    new: {
      menu: 'New Trade',
      title: 'New Trade',
      success: 'Trade successfully created',
    },

    view: {
      title: 'View Trade',
    },

    edit: {
      menu: 'Edit Trade',
      title: 'Edit Trade',
      success: 'Trade successfully updated',
    },

    restore: {
      success: 'Trade successfully restored',
      noSelection: 'You must select at least one trade to restore.',
      confirmTitle: 'Restore Trade?',
    },

    restoreMany: {
      success: 'Trade(s) successfully restored',
      noSelection: 'You must select at least one trade to restore.',
      confirmTitle: 'Restore Trade(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected trade(s)?',
    },

    archiveMany: {
      success: 'Trade(s) successfully archived',
      noSelection: 'You must select at least one trade to archive.',
      confirmTitle: 'Archive Trade(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected trade(s)?',
    },

    archive: {
      success: 'Trade successfully archived',
      noSelection: 'You must select at least one trade to archive.',
      confirmTitle: 'Archive Trade?',
    },

    destroyMany: {
      success: 'Trade(s) successfully deleted',
      noSelection: 'You must select at least one trade to delete.',
      confirmTitle: 'Delete Trade(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected trade(s)?',
    },

    destroy: {
      success: 'Trade successfully deleted',
      noSelection: 'You must select at least one trade to delete.',
      confirmTitle: 'Delete Trade?',
    },

    fields: {
      price: 'Price',
      quantity: 'Quantity',
      meta: 'Meta',
      buyOrderId: 'BuyOrderId',
      sellOrderId: 'SellOrderId',
      instrument: 'Instrument',
      fills: 'Fills',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No fills found.',
    },

    export: {
      success: 'Fills successfully exported',
    },

    new: {
      menu: 'New Fill',
      title: 'New Fill',
      success: 'Fill successfully created',
    },

    view: {
      title: 'View Fill',
    },

    edit: {
      menu: 'Edit Fill',
      title: 'Edit Fill',
      success: 'Fill successfully updated',
    },

    restore: {
      success: 'Fill successfully restored',
      noSelection: 'You must select at least one fill to restore.',
      confirmTitle: 'Restore Fill?',
    },

    restoreMany: {
      success: 'Fill(s) successfully restored',
      noSelection: 'You must select at least one fill to restore.',
      confirmTitle: 'Restore Fill(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected fill(s)?',
    },

    archiveMany: {
      success: 'Fill(s) successfully archived',
      noSelection: 'You must select at least one fill to archive.',
      confirmTitle: 'Archive Fill(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected fill(s)?',
    },

    archive: {
      success: 'Fill successfully archived',
      noSelection: 'You must select at least one fill to archive.',
      confirmTitle: 'Archive Fill?',
    },

    destroyMany: {
      success: 'Fill(s) successfully deleted',
      noSelection: 'You must select at least one fill to delete.',
      confirmTitle: 'Delete Fill(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected fill(s)?',
    },

    destroy: {
      success: 'Fill successfully deleted',
      noSelection: 'You must select at least one fill to delete.',
      confirmTitle: 'Delete Fill?',
    },

    fields: {
      side: 'Side',
      price: 'Price',
      quantity: 'Quantity',
      fee: 'Fee',
      meta: 'Meta',
      trade: 'Trade',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No posts found.',
    },

    export: {
      success: 'Posts successfully exported',
    },

    new: {
      menu: 'New Post',
      title: 'New Post',
      success: 'Post successfully created',
    },

    view: {
      title: 'View Post',
    },

    edit: {
      menu: 'Edit Post',
      title: 'Edit Post',
      success: 'Post successfully updated',
    },

    restore: {
      success: 'Post successfully restored',
      noSelection: 'You must select at least one post to restore.',
      confirmTitle: 'Restore Post?',
    },

    restoreMany: {
      success: 'Post(s) successfully restored',
      noSelection: 'You must select at least one post to restore.',
      confirmTitle: 'Restore Post(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected post(s)?',
    },

    archiveMany: {
      success: 'Post(s) successfully archived',
      noSelection: 'You must select at least one post to archive.',
      confirmTitle: 'Archive Post(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected post(s)?',
    },

    archive: {
      success: 'Post successfully archived',
      noSelection: 'You must select at least one post to archive.',
      confirmTitle: 'Archive Post?',
    },

    destroyMany: {
      success: 'Post(s) successfully deleted',
      noSelection: 'You must select at least one post to delete.',
      confirmTitle: 'Delete Post(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected post(s)?',
    },

    destroy: {
      success: 'Post successfully deleted',
      noSelection: 'You must select at least one post to delete.',
      confirmTitle: 'Delete Post?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      files: 'Files',
      images: 'Images',
      type: 'Type',
      meta: 'Meta',
      user: 'User',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No comments found.',
    },

    export: {
      success: 'Comments successfully exported',
    },

    new: {
      menu: 'New Comment',
      title: 'New Comment',
      success: 'Comment successfully created',
    },

    view: {
      title: 'View Comment',
    },

    edit: {
      menu: 'Edit Comment',
      title: 'Edit Comment',
      success: 'Comment successfully updated',
    },

    restore: {
      success: 'Comment successfully restored',
      noSelection: 'You must select at least one comment to restore.',
      confirmTitle: 'Restore Comment?',
    },

    restoreMany: {
      success: 'Comment(s) successfully restored',
      noSelection: 'You must select at least one comment to restore.',
      confirmTitle: 'Restore Comment(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected comment(s)?',
    },

    archiveMany: {
      success: 'Comment(s) successfully archived',
      noSelection: 'You must select at least one comment to archive.',
      confirmTitle: 'Archive Comment(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected comment(s)?',
    },

    archive: {
      success: 'Comment successfully archived',
      noSelection: 'You must select at least one comment to archive.',
      confirmTitle: 'Archive Comment?',
    },

    destroyMany: {
      success: 'Comment(s) successfully deleted',
      noSelection: 'You must select at least one comment to delete.',
      confirmTitle: 'Delete Comment(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected comment(s)?',
    },

    destroy: {
      success: 'Comment successfully deleted',
      noSelection: 'You must select at least one comment to delete.',
      confirmTitle: 'Delete Comment?',
    },

    fields: {
      body: 'Body',
      type: 'Type',
      images: 'Images',
      meta: 'Meta',
      user: 'User',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No articles found.',
    },

    export: {
      success: 'Articles successfully exported',
    },

    new: {
      menu: 'New Article',
      title: 'New Article',
      success: 'Article successfully created',
    },

    view: {
      title: 'View Article',
    },

    edit: {
      menu: 'Edit Article',
      title: 'Edit Article',
      success: 'Article successfully updated',
    },

    restore: {
      success: 'Article successfully restored',
      noSelection: 'You must select at least one article to restore.',
      confirmTitle: 'Restore Article?',
    },

    restoreMany: {
      success: 'Article(s) successfully restored',
      noSelection: 'You must select at least one article to restore.',
      confirmTitle: 'Restore Article(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected article(s)?',
    },

    archiveMany: {
      success: 'Article(s) successfully archived',
      noSelection: 'You must select at least one article to archive.',
      confirmTitle: 'Archive Article(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected article(s)?',
    },

    archive: {
      success: 'Article successfully archived',
      noSelection: 'You must select at least one article to archive.',
      confirmTitle: 'Archive Article?',
    },

    destroyMany: {
      success: 'Article(s) successfully deleted',
      noSelection: 'You must select at least one article to delete.',
      confirmTitle: 'Delete Article(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected article(s)?',
    },

    destroy: {
      success: 'Article successfully deleted',
      noSelection: 'You must select at least one article to delete.',
      confirmTitle: 'Delete Article?',
    },

    fields: {
      title: 'Title',
      body: 'Body',
      type: 'Type',
      images: 'Images',
      files: 'Files',
      meta: 'Meta',
      user: 'User',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No chats found.',
    },

    export: {
      success: 'Chats successfully exported',
    },

    new: {
      menu: 'New Chat',
      title: 'New Chat',
      success: 'Chat successfully created',
    },

    view: {
      title: 'View Chat',
    },

    edit: {
      menu: 'Edit Chat',
      title: 'Edit Chat',
      success: 'Chat successfully updated',
    },

    restore: {
      success: 'Chat successfully restored',
      noSelection: 'You must select at least one chat to restore.',
      confirmTitle: 'Restore Chat?',
    },

    restoreMany: {
      success: 'Chat(s) successfully restored',
      noSelection: 'You must select at least one chat to restore.',
      confirmTitle: 'Restore Chat(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected chat(s)?',
    },

    archiveMany: {
      success: 'Chat(s) successfully archived',
      noSelection: 'You must select at least one chat to archive.',
      confirmTitle: 'Archive Chat(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected chat(s)?',
    },

    archive: {
      success: 'Chat successfully archived',
      noSelection: 'You must select at least one chat to archive.',
      confirmTitle: 'Archive Chat?',
    },

    destroyMany: {
      success: 'Chat(s) successfully deleted',
      noSelection: 'You must select at least one chat to delete.',
      confirmTitle: 'Delete Chat(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected chat(s)?',
    },

    destroy: {
      success: 'Chat successfully deleted',
      noSelection: 'You must select at least one chat to delete.',
      confirmTitle: 'Delete Chat?',
    },

    fields: {
      name: 'Name',
      media: 'Media',
      meta: 'Meta',
      active: 'Active',
      messages: 'Messages',
      chaters: 'Chaters',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No chaters found.',
    },

    export: {
      success: 'Chaters successfully exported',
    },

    new: {
      menu: 'New Chater',
      title: 'New Chater',
      success: 'Chater successfully created',
    },

    view: {
      title: 'View Chater',
    },

    edit: {
      menu: 'Edit Chater',
      title: 'Edit Chater',
      success: 'Chater successfully updated',
    },

    restore: {
      success: 'Chater successfully restored',
      noSelection: 'You must select at least one chater to restore.',
      confirmTitle: 'Restore Chater?',
    },

    restoreMany: {
      success: 'Chater(s) successfully restored',
      noSelection: 'You must select at least one chater to restore.',
      confirmTitle: 'Restore Chater(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected chater(s)?',
    },

    archiveMany: {
      success: 'Chater(s) successfully archived',
      noSelection: 'You must select at least one chater to archive.',
      confirmTitle: 'Archive Chater(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected chater(s)?',
    },

    archive: {
      success: 'Chater successfully archived',
      noSelection: 'You must select at least one chater to archive.',
      confirmTitle: 'Archive Chater?',
    },

    destroyMany: {
      success: 'Chater(s) successfully deleted',
      noSelection: 'You must select at least one chater to delete.',
      confirmTitle: 'Delete Chater(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected chater(s)?',
    },

    destroy: {
      success: 'Chater successfully deleted',
      noSelection: 'You must select at least one chater to delete.',
      confirmTitle: 'Delete Chater?',
    },

    fields: {
      nickname: 'Nickname',
      status: 'Status',
      role: 'Role',
      meta: 'Meta',
      user: 'User',
      chat: 'Chat',
      messages: 'Messages',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No messages found.',
    },

    export: {
      success: 'Messages successfully exported',
    },

    new: {
      menu: 'New Message',
      title: 'New Message',
      success: 'Message successfully created',
    },

    view: {
      title: 'View Message',
    },

    edit: {
      menu: 'Edit Message',
      title: 'Edit Message',
      success: 'Message successfully updated',
    },

    restore: {
      success: 'Message successfully restored',
      noSelection: 'You must select at least one message to restore.',
      confirmTitle: 'Restore Message?',
    },

    restoreMany: {
      success: 'Message(s) successfully restored',
      noSelection: 'You must select at least one message to restore.',
      confirmTitle: 'Restore Message(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected message(s)?',
    },

    archiveMany: {
      success: 'Message(s) successfully archived',
      noSelection: 'You must select at least one message to archive.',
      confirmTitle: 'Archive Message(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected message(s)?',
    },

    archive: {
      success: 'Message successfully archived',
      noSelection: 'You must select at least one message to archive.',
      confirmTitle: 'Archive Message?',
    },

    destroyMany: {
      success: 'Message(s) successfully deleted',
      noSelection: 'You must select at least one message to delete.',
      confirmTitle: 'Delete Message(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected message(s)?',
    },

    destroy: {
      success: 'Message successfully deleted',
      noSelection: 'You must select at least one message to delete.',
      confirmTitle: 'Delete Message?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No feeschedules found.',
    },

    export: {
      success: 'FeeSchedules successfully exported',
    },

    new: {
      menu: 'New FeeSchedule',
      title: 'New FeeSchedule',
      success: 'FeeSchedule successfully created',
    },

    view: {
      title: 'View FeeSchedule',
    },

    edit: {
      menu: 'Edit FeeSchedule',
      title: 'Edit FeeSchedule',
      success: 'FeeSchedule successfully updated',
    },

    restore: {
      success: 'FeeSchedule successfully restored',
      noSelection: 'You must select at least one feeschedule to restore.',
      confirmTitle: 'Restore FeeSchedule?',
    },

    restoreMany: {
      success: 'FeeSchedule(s) successfully restored',
      noSelection: 'You must select at least one feeschedule to restore.',
      confirmTitle: 'Restore FeeSchedule(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected feeschedule(s)?',
    },

    archiveMany: {
      success: 'FeeSchedule(s) successfully archived',
      noSelection: 'You must select at least one feeschedule to archive.',
      confirmTitle: 'Archive FeeSchedule(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected feeschedule(s)?',
    },

    archive: {
      success: 'FeeSchedule successfully archived',
      noSelection: 'You must select at least one feeschedule to archive.',
      confirmTitle: 'Archive FeeSchedule?',
    },

    destroyMany: {
      success: 'FeeSchedule(s) successfully deleted',
      noSelection: 'You must select at least one feeschedule to delete.',
      confirmTitle: 'Delete FeeSchedule(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected feeschedule(s)?',
    },

    destroy: {
      success: 'FeeSchedule successfully deleted',
      noSelection: 'You must select at least one feeschedule to delete.',
      confirmTitle: 'Delete FeeSchedule?',
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

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No balancesnapshots found.',
    },

    export: {
      success: 'BalanceSnapshots successfully exported',
    },

    new: {
      menu: 'New BalanceSnapshot',
      title: 'New BalanceSnapshot',
      success: 'BalanceSnapshot successfully created',
    },

    view: {
      title: 'View BalanceSnapshot',
    },

    edit: {
      menu: 'Edit BalanceSnapshot',
      title: 'Edit BalanceSnapshot',
      success: 'BalanceSnapshot successfully updated',
    },

    restore: {
      success: 'BalanceSnapshot successfully restored',
      noSelection: 'You must select at least one balancesnapshot to restore.',
      confirmTitle: 'Restore BalanceSnapshot?',
    },

    restoreMany: {
      success: 'BalanceSnapshot(s) successfully restored',
      noSelection: 'You must select at least one balancesnapshot to restore.',
      confirmTitle: 'Restore BalanceSnapshot(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected balancesnapshot(s)?',
    },

    archiveMany: {
      success: 'BalanceSnapshot(s) successfully archived',
      noSelection: 'You must select at least one balancesnapshot to archive.',
      confirmTitle: 'Archive BalanceSnapshot(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected balancesnapshot(s)?',
    },

    archive: {
      success: 'BalanceSnapshot successfully archived',
      noSelection: 'You must select at least one balancesnapshot to archive.',
      confirmTitle: 'Archive BalanceSnapshot?',
    },

    destroyMany: {
      success: 'BalanceSnapshot(s) successfully deleted',
      noSelection: 'You must select at least one balancesnapshot to delete.',
      confirmTitle: 'Delete BalanceSnapshot(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected balancesnapshot(s)?',
    },

    destroy: {
      success: 'BalanceSnapshot successfully deleted',
      noSelection: 'You must select at least one balancesnapshot to delete.',
      confirmTitle: 'Delete BalanceSnapshot?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No systemaccounts found.',
    },

    export: {
      success: 'SystemAccounts successfully exported',
    },

    new: {
      menu: 'New SystemAccount',
      title: 'New SystemAccount',
      success: 'SystemAccount successfully created',
    },

    view: {
      title: 'View SystemAccount',
    },

    edit: {
      menu: 'Edit SystemAccount',
      title: 'Edit SystemAccount',
      success: 'SystemAccount successfully updated',
    },

    restore: {
      success: 'SystemAccount successfully restored',
      noSelection: 'You must select at least one systemaccount to restore.',
      confirmTitle: 'Restore SystemAccount?',
    },

    restoreMany: {
      success: 'SystemAccount(s) successfully restored',
      noSelection: 'You must select at least one systemaccount to restore.',
      confirmTitle: 'Restore SystemAccount(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected systemaccount(s)?',
    },

    archiveMany: {
      success: 'SystemAccount(s) successfully archived',
      noSelection: 'You must select at least one systemaccount to archive.',
      confirmTitle: 'Archive SystemAccount(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected systemaccount(s)?',
    },

    archive: {
      success: 'SystemAccount successfully archived',
      noSelection: 'You must select at least one systemaccount to archive.',
      confirmTitle: 'Archive SystemAccount?',
    },

    destroyMany: {
      success: 'SystemAccount(s) successfully deleted',
      noSelection: 'You must select at least one systemaccount to delete.',
      confirmTitle: 'Delete SystemAccount(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected systemaccount(s)?',
    },

    destroy: {
      success: 'SystemAccount successfully deleted',
      noSelection: 'You must select at least one systemaccount to delete.',
      confirmTitle: 'Delete SystemAccount?',
    },

    fields: {
      type: 'Type',
      name: 'Name',
      description: 'Description',
      isActive: 'IsActive',
      meta: 'Meta',

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No feedbacks found.',
    },

    export: {
      success: 'Feedbacks successfully exported',
    },

    new: {
      menu: 'New Feedback',
      title: 'New Feedback',
      success: 'Feedback successfully created',
    },

    view: {
      title: 'View Feedback',
    },

    edit: {
      menu: 'Edit Feedback',
      title: 'Edit Feedback',
      success: 'Feedback successfully updated',
    },

    restore: {
      success: 'Feedback successfully restored',
      noSelection: 'You must select at least one feedback to restore.',
      confirmTitle: 'Restore Feedback?',
    },

    restoreMany: {
      success: 'Feedback(s) successfully restored',
      noSelection: 'You must select at least one feedback to restore.',
      confirmTitle: 'Restore Feedback(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected feedback(s)?',
    },

    archiveMany: {
      success: 'Feedback(s) successfully archived',
      noSelection: 'You must select at least one feedback to archive.',
      confirmTitle: 'Archive Feedback(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected feedback(s)?',
    },

    archive: {
      success: 'Feedback successfully archived',
      noSelection: 'You must select at least one feedback to archive.',
      confirmTitle: 'Archive Feedback?',
    },

    destroyMany: {
      success: 'Feedback(s) successfully deleted',
      noSelection: 'You must select at least one feedback to delete.',
      confirmTitle: 'Delete Feedback(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected feedback(s)?',
    },

    destroy: {
      success: 'Feedback successfully deleted',
      noSelection: 'You must select at least one feedback to delete.',
      confirmTitle: 'Delete Feedback?',
    },

    fields: {
      title: 'Title',
      description: 'Description',
      attachments: 'Attachments',
      type: 'Type',
      status: 'Status',
      json: 'Json',
      user: 'User',
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No jobs found.',
    },

    export: {
      success: 'Jobs successfully exported',
    },

    new: {
      menu: 'New Job',
      title: 'New Job',
      success: 'Job successfully created',
    },

    view: {
      title: 'View Job',
    },

    edit: {
      menu: 'Edit Job',
      title: 'Edit Job',
      success: 'Job successfully updated',
    },

    restore: {
      success: 'Job successfully restored',
      noSelection: 'You must select at least one job to restore.',
      confirmTitle: 'Restore Job?',
    },

    restoreMany: {
      success: 'Job(s) successfully restored',
      noSelection: 'You must select at least one job to restore.',
      confirmTitle: 'Restore Job(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected job(s)?',
    },

    archiveMany: {
      success: 'Job(s) successfully archived',
      noSelection: 'You must select at least one job to archive.',
      confirmTitle: 'Archive Job(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected job(s)?',
    },

    archive: {
      success: 'Job successfully archived',
      noSelection: 'You must select at least one job to archive.',
      confirmTitle: 'Archive Job?',
    },

    destroyMany: {
      success: 'Job(s) successfully deleted',
      noSelection: 'You must select at least one job to delete.',
      confirmTitle: 'Delete Job(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected job(s)?',
    },

    destroy: {
      success: 'Job successfully deleted',
      noSelection: 'You must select at least one job to delete.',
      confirmTitle: 'Delete Job?',
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

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No listings found.',
    },

    export: {
      success: 'Listings successfully exported',
    },

    new: {
      menu: 'New Listing',
      title: 'New Listing',
      success: 'Listing successfully created',
    },

    view: {
      title: 'View Listing',
    },

    edit: {
      menu: 'Edit Listing',
      title: 'Edit Listing',
      success: 'Listing successfully updated',
    },

    restore: {
      success: 'Listing successfully restored',
      noSelection: 'You must select at least one listing to restore.',
      confirmTitle: 'Restore Listing?',
    },

    restoreMany: {
      success: 'Listing(s) successfully restored',
      noSelection: 'You must select at least one listing to restore.',
      confirmTitle: 'Restore Listing(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected listing(s)?',
    },

    archiveMany: {
      success: 'Listing(s) successfully archived',
      noSelection: 'You must select at least one listing to archive.',
      confirmTitle: 'Archive Listing(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected listing(s)?',
    },

    archive: {
      success: 'Listing successfully archived',
      noSelection: 'You must select at least one listing to archive.',
      confirmTitle: 'Archive Listing?',
    },

    destroyMany: {
      success: 'Listing(s) successfully deleted',
      noSelection: 'You must select at least one listing to delete.',
      confirmTitle: 'Delete Listing(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected listing(s)?',
    },

    destroy: {
      success: 'Listing successfully deleted',
      noSelection: 'You must select at least one listing to delete.',
      confirmTitle: 'Delete Listing?',
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

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No referrals found.',
    },

    export: {
      success: 'Referrals successfully exported',
    },

    new: {
      menu: 'New Referral',
      title: 'New Referral',
      success: 'Referral successfully created',
    },

    view: {
      title: 'View Referral',
    },

    edit: {
      menu: 'Edit Referral',
      title: 'Edit Referral',
      success: 'Referral successfully updated',
    },

    restore: {
      success: 'Referral successfully restored',
      noSelection: 'You must select at least one referral to restore.',
      confirmTitle: 'Restore Referral?',
    },

    restoreMany: {
      success: 'Referral(s) successfully restored',
      noSelection: 'You must select at least one referral to restore.',
      confirmTitle: 'Restore Referral(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected referral(s)?',
    },

    archiveMany: {
      success: 'Referral(s) successfully archived',
      noSelection: 'You must select at least one referral to archive.',
      confirmTitle: 'Archive Referral(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected referral(s)?',
    },

    archive: {
      success: 'Referral successfully archived',
      noSelection: 'You must select at least one referral to archive.',
      confirmTitle: 'Archive Referral?',
    },

    destroyMany: {
      success: 'Referral(s) successfully deleted',
      noSelection: 'You must select at least one referral to delete.',
      confirmTitle: 'Delete Referral(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected referral(s)?',
    },

    destroy: {
      success: 'Referral successfully deleted',
      noSelection: 'You must select at least one referral to delete.',
      confirmTitle: 'Delete Referral?',
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

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No notifications found.',
    },

    export: {
      success: 'Notifications successfully exported',
    },

    new: {
      menu: 'New Notification',
      title: 'New Notification',
      success: 'Notification successfully created',
    },

    view: {
      title: 'View Notification',
    },

    edit: {
      menu: 'Edit Notification',
      title: 'Edit Notification',
      success: 'Notification successfully updated',
    },

    restore: {
      success: 'Notification successfully restored',
      noSelection: 'You must select at least one notification to restore.',
      confirmTitle: 'Restore Notification?',
    },

    restoreMany: {
      success: 'Notification(s) successfully restored',
      noSelection: 'You must select at least one notification to restore.',
      confirmTitle: 'Restore Notification(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected notification(s)?',
    },

    archiveMany: {
      success: 'Notification(s) successfully archived',
      noSelection: 'You must select at least one notification to archive.',
      confirmTitle: 'Archive Notification(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected notification(s)?',
    },

    archive: {
      success: 'Notification successfully archived',
      noSelection: 'You must select at least one notification to archive.',
      confirmTitle: 'Archive Notification?',
    },

    destroyMany: {
      success: 'Notification(s) successfully deleted',
      noSelection: 'You must select at least one notification to delete.',
      confirmTitle: 'Delete Notification(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected notification(s)?',
    },

    destroy: {
      success: 'Notification successfully deleted',
      noSelection: 'You must select at least one notification to delete.',
      confirmTitle: 'Delete Notification?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No usernotifications found.',
    },

    export: {
      success: 'UserNotifications successfully exported',
    },

    new: {
      menu: 'New UserNotification',
      title: 'New UserNotification',
      success: 'UserNotification successfully created',
    },

    view: {
      title: 'View UserNotification',
    },

    edit: {
      menu: 'Edit UserNotification',
      title: 'Edit UserNotification',
      success: 'UserNotification successfully updated',
    },

    restore: {
      success: 'UserNotification successfully restored',
      noSelection: 'You must select at least one usernotification to restore.',
      confirmTitle: 'Restore UserNotification?',
    },

    restoreMany: {
      success: 'UserNotification(s) successfully restored',
      noSelection: 'You must select at least one usernotification to restore.',
      confirmTitle: 'Restore UserNotification(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected usernotification(s)?',
    },

    archiveMany: {
      success: 'UserNotification(s) successfully archived',
      noSelection: 'You must select at least one usernotification to archive.',
      confirmTitle: 'Archive UserNotification(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected usernotification(s)?',
    },

    archive: {
      success: 'UserNotification successfully archived',
      noSelection: 'You must select at least one usernotification to archive.',
      confirmTitle: 'Archive UserNotification?',
    },

    destroyMany: {
      success: 'UserNotification(s) successfully deleted',
      noSelection: 'You must select at least one usernotification to delete.',
      confirmTitle: 'Delete UserNotification(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected usernotification(s)?',
    },

    destroy: {
      success: 'UserNotification successfully deleted',
      noSelection: 'You must select at least one usernotification to delete.',
      confirmTitle: 'Delete UserNotification?',
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      noResults: 'No candidates found.',
    },

    export: {
      success: 'Candidates successfully exported',
    },

    new: {
      menu: 'New Candidate',
      title: 'New Candidate',
      success: 'Candidate successfully created',
    },

    view: {
      title: 'View Candidate',
    },

    edit: {
      menu: 'Edit Candidate',
      title: 'Edit Candidate',
      success: 'Candidate successfully updated',
    },

    restore: {
      success: 'Candidate successfully restored',
      noSelection: 'You must select at least one candidate to restore.',
      confirmTitle: 'Restore Candidate?',
    },

    restoreMany: {
      success: 'Candidate(s) successfully restored',
      noSelection: 'You must select at least one candidate to restore.',
      confirmTitle: 'Restore Candidate(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected candidate(s)?',
    },

    archiveMany: {
      success: 'Candidate(s) successfully archived',
      noSelection: 'You must select at least one candidate to archive.',
      confirmTitle: 'Archive Candidate(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected candidate(s)?',
    },

    archive: {
      success: 'Candidate successfully archived',
      noSelection: 'You must select at least one candidate to archive.',
      confirmTitle: 'Archive Candidate?',
    },

    destroyMany: {
      success: 'Candidate(s) successfully deleted',
      noSelection: 'You must select at least one candidate to delete.',
      confirmTitle: 'Delete Candidate(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected candidate(s)?',
    },

    destroy: {
      success: 'Candidate successfully deleted',
      noSelection: 'You must select at least one candidate to delete.',
      confirmTitle: 'Delete Candidate?',
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

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      menu: 'Audit Logs',
      title: 'Audit Logs',
      noResults: 'No audit logs found.',
    },

    changesDialog: {
      title: 'Audit Log',
      changes: 'Changes',
      noChanges: 'There are no changes in this log.',
    },

    export: {
      success: 'Audit Logs successfully exported',
    },

    fields: {
      timestamp: 'Date',
      entityName: 'Entity',
      entityNames: 'Entities',
      entityId: 'Entity ID',
      operation: 'Operation',
      operations: 'Operations',
      membership: 'User',
      apiKey: 'API Key',
      apiEndpoint: 'API Endpoint',
      apiHttpResponseCode: 'API Status',
      transactionId: 'Transaction ID',
    },

    enumerators: {
      operation: {
        SI: 'Sign In',
        SO: 'Sign Out',
        SU: 'Sign Up',
        PRR: 'Password Reset Request',
        PRC: 'Password Reset Confirm',
        PC: 'Password Change',
        VER: 'Verify Email Request',
        VEC: 'Verify Email Confirm',
        C: 'Create',
        U: 'Update',
        D: 'Delete',
        AG: 'API Get',
        APO: 'API Post',
        APU: 'API Put',
        AD: 'API Delete',
      },
    },

    dashboardCard: {
      activityChart: 'Activity',
      activityList: 'Recent Activity',
    },

    readableOperations: {
      SI: '{0} signed in',
      SU: '{0} registered',
      PRR: '{0} requested to reset the password',
      PRC: '{0} confirmed password reset',
      PC: '{0} changed the password',
      VER: '{0} requested to verify the email',
      VEC: '{0} verified the email',
      C: '{0} created {1} {2}',
      U: '{0} updated {1} {2}',
      D: '{0} deleted {1} {2}',
    },
  },

  recaptcha: {
    errors: {
      disabled:
        'reCAPTCHA is disabled in this platform. Skipping verification.',
      invalid: 'Invalid reCAPTCHA',
    },
  },

  emails: {
    passwordResetEmail: {
      subject: `Reset your password for {0}`,
      content: `<p>Hello,</p> <p> Follow this link to reset your {0} password for your account. </p> <p><a href="{1}">{1}</a></p> <p> If you didn’t ask to reset your password, you can ignore this email. </p> <p>Thanks,</p> <p>Your {0} team</p>`,
    },
    verifyEmailEmail: {
      subject: `Verify your email for {0}`,
      content: `<p>Hello,</p><p>Follow this link to verify your email address.</p><p><a href="{1}">{1}</a></p><p>If you didn’t ask to verify this address, you can ignore this email. </p> <p>Thanks,</p> <p>Your {0} team</p>`,
    },
    invitationEmail: {
      singleTenant: {
        subject: `You've been invited to {0}`,
        content: `<p>Hello,</p> <p>You've been invited to {0}.</p> <p>Follow this link to register.</p> <p><a href="{1}">{1}</a></p> <p>Thanks,</p> <p>Your {0} team</p>`,
      },
      multiTenant: {
        subject: `You've been invited to {1} at {0}`,
        content: `<p>Hello,</p> <p>You've been invited to {2}.</p> <p>Follow this link to register.</p> <p><a href="{1}">{1}</a></p> <p>Thanks,</p> <p>Your {0} team</p>`,
      },
    },

    errors: {
      emailNotConfigured: 'Email ENV vars are missing',
    },
  },
};

export default dictionary;
