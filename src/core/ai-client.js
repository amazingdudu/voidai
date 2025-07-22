import OpenAI from 'openai';
import { getModelConfig, getDefaultModel } from './config.js';
import chalk from 'chalk';

export function createAIClient(modelId = null) {
  const targetModelId = modelId || getDefaultModel();
  const modelConfig = getModelConfig(targetModelId);

  if (!modelConfig) {
    throw new Error(`模型 "${targetModelId}" 不存在`);
  }

  if (!modelConfig.apiKey) {
    throw new Error(`模型 "${targetModelId}" 未配置API密钥`);
  }

  const client = new OpenAI({
    baseURL: modelConfig.baseURL,
    apiKey: modelConfig.apiKey,
  });

  return {
    client,
    modelConfig,
    modelId: targetModelId,
  };
}

export function validateModel(modelId = null) {
  const targetModelId = modelId || getDefaultModel();
  const modelConfig = getModelConfig(targetModelId);

  if (!modelConfig) {
    console.error(chalk.red(`❌ 模型 "${targetModelId}" 不存在`));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return false;
  }

  if (!modelConfig.apiKey) {
    console.error(chalk.red(`❌ 模型 "${targetModelId}" 未配置API密钥`));
    console.log(chalk.cyan(`💡 使用 'termchat model config ${targetModelId}' 配置API密钥`));
    return false;
  }

  return true;
}
