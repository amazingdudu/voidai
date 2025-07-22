export function validateModelId(modelId) {
  if (!modelId || typeof modelId !== 'string') {
    return false;
  }

  const modelIdRegex = /^[a-zA-Z0-9_-]+$/;
  return modelIdRegex.test(modelId);
}

export function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  return apiKey.startsWith('sk-') && apiKey.length > 10;
}

export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateModelName(modelName) {
  if (!modelName || typeof modelName !== 'string') {
    return false;
  }

  const modelNameRegex = /^[a-zA-Z0-9._-]+$/;
  return modelNameRegex.test(modelName);
}
