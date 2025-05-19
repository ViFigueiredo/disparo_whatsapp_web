export const webhooks = {
  companies: {
    list: import.meta.env.VITE_WEBHOOK_COMPANIES_LIST,
    listone: import.meta.env.VITE_WEBHOOK_COMPANIES_LISTONE,
    create: import.meta.env.VITE_WEBHOOK_COMPANIES_CREATE,
    update: import.meta.env.VITE_WEBHOOK_COMPANIES_UPDATE,
    delete: import.meta.env.VITE_WEBHOOK_COMPANIES_DELETE
  },
  companiesConnections: {
    list: import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_LIST,
    create: import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_CREATE,
    update: import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_UPDATE,
    delete: import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_DELETE
  },
  connections: {
    list: import.meta.env.VITE_WEBHOOK_CONNECTIONS_LIST,
    create: import.meta.env.VITE_WEBHOOK_CONNECTIONS_CREATE,
    connect: import.meta.env.VITE_WEBHOOK_CONNECTIONS_CONNECT,
    state: import.meta.env.VITE_WEBHOOK_CONNECTIONS_STATE,
    delete: import.meta.env.VITE_WEBHOOK_CONNECTIONS_REMOVE
  },
  validation: {
    list: import.meta.env.VITE_WEBHOOK_VALIDATION_LIST,
    save: import.meta.env.VITE_WEBHOOK_VALIDATION_SAVE,
    delete: import.meta.env.VITE_WEBHOOK_VALIDATION_DELETE,
    validate: import.meta.env.VITE_WEBHOOK_VALIDATION
  },
  templates: {
    list: import.meta.env.VITE_WEBHOOK_TEMPLATE_LIST,
    create: import.meta.env.VITE_WEBHOOK_TEMPLATE_CREATE,
    update: import.meta.env.VITE_WEBHOOK_TEMPLATE_UPDATE,
    delete: import.meta.env.VITE_WEBHOOK_TEMPLATE_DELETE,
    execute: import.meta.env.VITE_WEBHOOK_TEMPLATE_SEND
  },
  business: {
    templates: import.meta.env.VITE_WEBHOOK_BUSINESS_TEMPLATES
  },
  users: {
    list: import.meta.env.VITE_WEBHOOK_USERS_LIST,
    create: import.meta.env.VITE_WEBHOOK_USERS_CREATE,
    update: import.meta.env.VITE_WEBHOOK_USERS_UPDATE,
    delete: import.meta.env.VITE_WEBHOOK_USERS_DELETE,
    resetPassword: import.meta.env.VITE_WEBHOOK_USERS_RESET_PASSWORD
  },
  auth: {
    login: import.meta.env.VITE_WEBHOOK_AUTH_LOGIN,
    logout: import.meta.env.VITE_WEBHOOK_AUTH_LOGOUT,
    verify: import.meta.env.VITE_WEBHOOK_AUTH_VERIFY
  }
}