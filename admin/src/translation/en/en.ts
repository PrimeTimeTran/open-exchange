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
      meta: 'Meta',
      files: 'Files',
      images: 'Images',
      type: 'Type',
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
      meta: '',
      files: '',
      images: '',
      type: '',
      user: '',
    },

    enumerators: {},
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
      meta: 'Meta',
      type: 'Type',
      images: 'Images',
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
      meta: '',
      type: '',
      images: '',
      user: '',
    },

    enumerators: {},
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
      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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
      meta: 'Meta',
      type: 'Type',
      images: 'Images',
      files: 'Files',
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
      meta: '',
      type: '',
      images: '',
      files: '',
      user: '',
    },

    enumerators: {},
  },

  item: {
    label: 'Item',

    dashboardCard: {
      title: 'Items',
    },

    list: {
      menu: 'Items',
      title: 'Items',
      noResults: 'No items found.',
    },

    export: {
      success: 'Items successfully exported',
    },

    new: {
      menu: 'New Item',
      title: 'New Item',
      success: 'Item successfully created',
    },

    view: {
      title: 'View Item',
    },

    edit: {
      menu: 'Edit Item',
      title: 'Edit Item',
      success: 'Item successfully updated',
    },

    restore: {
      success: 'Item successfully restored',
      noSelection: 'You must select at least one item to restore.',
      confirmTitle: 'Restore Item?',
    },

    restoreMany: {
      success: 'Item(s) successfully restored',
      noSelection: 'You must select at least one item to restore.',
      confirmTitle: 'Restore Item(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected item(s)?',
    },

    archiveMany: {
      success: 'Item(s) successfully archived',
      noSelection: 'You must select at least one item to archive.',
      confirmTitle: 'Archive Item(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected item(s)?',
    },

    archive: {
      success: 'Item successfully archived',
      noSelection: 'You must select at least one item to archive.',
      confirmTitle: 'Archive Item?',
    },

    destroyMany: {
      success: 'Item(s) successfully deleted',
      noSelection: 'You must select at least one item to delete.',
      confirmTitle: 'Delete Item(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected item(s)?',
    },

    destroy: {
      success: 'Item successfully deleted',
      noSelection: 'You must select at least one item to delete.',
      confirmTitle: 'Delete Item?',
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

      createdByMembership: 'Created By',
      updatedByMembership: 'Updated By',
      archivedByMembership: 'Archived By',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      archivedAt: 'Archived at',
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

    enumerators: {},
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
      chatees: 'Chatees',
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
      chatees: '',
    },

    enumerators: {},
  },

  chatee: {
    label: 'Chatee',

    dashboardCard: {
      title: 'Chatees',
    },

    list: {
      menu: 'Chatees',
      title: 'Chatees',
      noResults: 'No chatees found.',
    },

    export: {
      success: 'Chatees successfully exported',
    },

    new: {
      menu: 'New Chatee',
      title: 'New Chatee',
      success: 'Chatee successfully created',
    },

    view: {
      title: 'View Chatee',
    },

    edit: {
      menu: 'Edit Chatee',
      title: 'Edit Chatee',
      success: 'Chatee successfully updated',
    },

    restore: {
      success: 'Chatee successfully restored',
      noSelection: 'You must select at least one chatee to restore.',
      confirmTitle: 'Restore Chatee?',
    },

    restoreMany: {
      success: 'Chatee(s) successfully restored',
      noSelection: 'You must select at least one chatee to restore.',
      confirmTitle: 'Restore Chatee(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected chatee(s)?',
    },

    archiveMany: {
      success: 'Chatee(s) successfully archived',
      noSelection: 'You must select at least one chatee to archive.',
      confirmTitle: 'Archive Chatee(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected chatee(s)?',
    },

    archive: {
      success: 'Chatee successfully archived',
      noSelection: 'You must select at least one chatee to archive.',
      confirmTitle: 'Archive Chatee?',
    },

    destroyMany: {
      success: 'Chatee(s) successfully deleted',
      noSelection: 'You must select at least one chatee to delete.',
      confirmTitle: 'Delete Chatee(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected chatee(s)?',
    },

    destroy: {
      success: 'Chatee successfully deleted',
      noSelection: 'You must select at least one chatee to delete.',
      confirmTitle: 'Delete Chatee?',
    },

    fields: {
      nickname: 'Nickname',
      status: 'Status',
      role: 'Role',
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
      chatee: 'Chatee',
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
      chatee: '',
      sender: '',
    },

    enumerators: {},
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
      type: 'Type',
      precision: 'Precision',
      isFractional: 'IsFractional',
      meta: 'Meta',
      baseInstruments: 'BaseInstruments',
      quoteInstruments: 'QuoteInstruments',
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
      orders: 'Orders',
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
      type: 'Type',
      meta: 'Meta',
      status: 'Status',
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
      referenceType: 'ReferenceType',
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
      event: '',
    },

    enumerators: {},
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
      buyOrderId: 'BuyOrderId',
      sellOrderId: 'SellOrderId',
      instrument: 'Instrument',
      tradeFills: 'TradeFills',
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
      buyOrderId: '',
      sellOrderId: '',
      instrument: '',
      tradeFills: '',
    },

    enumerators: {},
  },

  tradeFill: {
    label: 'TradeFill',

    dashboardCard: {
      title: 'TradeFills',
    },

    list: {
      menu: 'TradeFills',
      title: 'TradeFills',
      noResults: 'No tradefills found.',
    },

    export: {
      success: 'TradeFills successfully exported',
    },

    new: {
      menu: 'New TradeFill',
      title: 'New TradeFill',
      success: 'TradeFill successfully created',
    },

    view: {
      title: 'View TradeFill',
    },

    edit: {
      menu: 'Edit TradeFill',
      title: 'Edit TradeFill',
      success: 'TradeFill successfully updated',
    },

    restore: {
      success: 'TradeFill successfully restored',
      noSelection: 'You must select at least one tradefill to restore.',
      confirmTitle: 'Restore TradeFill?',
    },

    restoreMany: {
      success: 'TradeFill(s) successfully restored',
      noSelection: 'You must select at least one tradefill to restore.',
      confirmTitle: 'Restore TradeFill(s)?',
      confirmDescription:
        'Are you sure you want to restore the {0} selected tradefill(s)?',
    },

    archiveMany: {
      success: 'TradeFill(s) successfully archived',
      noSelection: 'You must select at least one tradefill to archive.',
      confirmTitle: 'Archive TradeFill(s)?',
      confirmDescription:
        'Are you sure you want to archive the {0} selected tradefill(s)?',
    },

    archive: {
      success: 'TradeFill successfully archived',
      noSelection: 'You must select at least one tradefill to archive.',
      confirmTitle: 'Archive TradeFill?',
    },

    destroyMany: {
      success: 'TradeFill(s) successfully deleted',
      noSelection: 'You must select at least one tradefill to delete.',
      confirmTitle: 'Delete TradeFill(s)?',
      confirmDescription:
        'Are you sure you want to delete the {0} selected tradefill(s)?',
    },

    destroy: {
      success: 'TradeFill successfully deleted',
      noSelection: 'You must select at least one tradefill to delete.',
      confirmTitle: 'Delete TradeFill?',
    },

    fields: {
      side: 'Side',
      price: 'Price',
      quantity: 'Quantity',
      fee: 'Fee',
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
