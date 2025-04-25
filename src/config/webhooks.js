export const webhooks = {
  templates: {
    list: import.meta.env.VITE_WEBHOOK_TEMPLATE_LIST,
    create: import.meta.env.VITE_WEBHOOK_TEMPLATE_CREATE,
    update: import.meta.env.VITE_WEBHOOK_TEMPLATE_UPDATE,
    delete: import.meta.env.VITE_WEBHOOK_TEMPLATE_DELETE
  },
  validation: {
    validate: import.meta.env.VITE_WEBHOOK_VALIDATION,
    status: import.meta.env.VITE_WEBHOOK_VALIDATION_STATUS
  },
  dispatch: {
    send: import.meta.env.VITE_WEBHOOK_DISPATCH_SEND,
    status: import.meta.env.VITE_WEBHOOK_DISPATCH_STATUS
  },
  connections: {
    list: import.meta.env.VITE_WEBHOOK_CONNECTIONS_LIST
  }
}