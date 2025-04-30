// ... existing code ...

const handleTemplateSelect = (template) => {
  console.log('Template de negócio selecionado:', template);
  
  // Emitir o evento com o template completo, não apenas o ID
  if (typeof template === 'object') {
    emit('update:modelValue', template);
  } else {
    // Se for apenas uma string (ID), tentar encontrar o template completo
    const selectedTemplate = businessTemplates.value.find(t => t.id === template);
    if (selectedTemplate) {
      console.log('Template completo encontrado:', selectedTemplate);
      emit('update:modelValue', selectedTemplate);
    } else {
      console.log('Apenas ID disponível:', template);
      // Criar um objeto com o ID e um nome temporário
      emit('update:modelValue', {
        id: template,
        name: 'hello_world' // Nome temporário para teste
      });
    }
  }
}

// ... existing code ...