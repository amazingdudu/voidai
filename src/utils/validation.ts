export function validateModelId(modelId: string) {
  if (!modelId) {
    return false;
  }

  const modelIdRegex = /^[a-zA-Z0-9_-]+$/;
  return modelIdRegex.test(modelId);
}

export function validateApiKey(apiKey: string) {
  if (!apiKey) {
    return false;
  }

  return apiKey.startsWith('sk-') && apiKey.length > 10;
}

export function validateUrl(url: string) {
  if (!url) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateModelName(modelName: string) {
  if (!modelName) {
    return false;
  }

  const modelNameRegex = /^[a-zA-Z0-9._-]+$/;
  return modelNameRegex.test(modelName);
}
