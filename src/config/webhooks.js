export const webhooks = {
  templates: {
    list: import.meta.env.VITE_WEBHOOK_TEMPLATE_LIST,
    create: import.meta.env.VITE_WEBHOOK_TEMPLATE_CREATE,
    update: import.meta.env.VITE_WEBHOOK_TEMPLATE_UPDATE,
    delete: import.meta.env.VITE_WEBHOOK_TEMPLATE_DELETE,
    execute: import.meta.env.VITE_WEBHOOK_TEMPLATE_SEND
  },
  validation: {
    validate: import.meta.env.VITE_WEBHOOK_VALIDATION,
    list: import.meta.env.VITE_WEBHOOK_VALIDATION_LIST,
    save: import.meta.env.VITE_WEBHOOK_VALIDATION_SAVE,
    delete: import.meta.env.VITE_WEBHOOK_VALIDATION_DELETE
  },
  // Adicionar o endpoint para criação de conexões
  connections: {
    list: import.meta.env.VITE_WEBHOOK_CONNECTIONS_LIST,
    create: import.meta.env.VITE_WEBHOOK_CONNECTIONS_CREATE,
    connect: import.meta.env.VITE_WEBHOOK_CONNECTIONS_CONNECT,
    state: import.meta.env.VITE_WEBHOOK_CONNECTIONS_STATE,
    delete: import.meta.env.VITE_WEBHOOK_CONNECTIONS_REMOVE,
  },
  business: {
    templates: import.meta.env.VITE_WEBHOOK_BUSINESS_TEMPLATES || import.meta.env.VITE_WEBHOOK_TEMPLATE_CLOUD
  }
}