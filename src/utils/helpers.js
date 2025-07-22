export function formatConfigValue(key, value) {
  if (!value) return value;

  if (key.includes('KEY') || key.includes('SECRET')) {
    if (value.length <= 8) {
      return '***';
    }
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }

  return value;
}

export function generateModelDescription(modelName, provider = 'Custom') {
  return `${modelName} - ${provider} 模型`;
}

export function isDefaultModel(modelId, defaultModelId) {
  return modelId === defaultModelId;
}

export function getModelStatusText(hasApiKey) {
  return hasApiKey ? '✅ 已配置' : '❌ 未配置';
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}
