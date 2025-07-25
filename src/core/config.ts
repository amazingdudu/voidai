import rc from 'rc';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import type { Config, ModelConfig } from '../types/index.js';

const defaultConfig: Config = {
  DEFAULT_MODEL: 'openai-gpt-4',
  SYSTEM_PROMPT: '你是一个人工智能助手，你更擅长中文对话。你会为用户提供安全，有帮助，准确的回答',
  MODELS: {
    'openai-gpt-4': {
      baseURL: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4',
      description: 'OpenAI GPT-4 模型',
    },
    'claude-3-sonnet': {
      baseURL: 'https://api.anthropic.com',
      apiKey: '',
      model: 'claude-3-sonnet-20240229',
      description: 'Anthropic Claude 3 Sonnet 模型',
    },
  },
};

const CONFIG_FILE_PATH = path.join(os.homedir(), '.voidairc');

export function getConfigPath(): string {
  return CONFIG_FILE_PATH;
}

export function configExists(): boolean {
  return fs.existsSync(CONFIG_FILE_PATH);
}

export function loadConfig(): void {
  try {
    const config = rc('voidairc', defaultConfig);

    Object.entries(config).forEach(([key, value]) => {
      if (key.startsWith('_') || key === 'config' || key === 'configs') return;
      if (!process.env[key] && value !== undefined) {
        process.env[key] = String(value);
      }
    });

    console.log(
      configExists()
        ? chalk.green('✅ 已从配置文件加载设置')
        : chalk.yellow('⚠️ 配置文件不存在，请先运行 `voidai config init` 初始化配置')
    );

    if (!process.env['DEFAULT_MODEL']) {
      process.env['DEFAULT_MODEL'] = defaultConfig['DEFAULT_MODEL'];
    }
  } catch (error) {
    console.error(chalk.red('❌ 加载配置时出错:'), (error as Error).message);
  }
}

export function createDefaultConfig(): boolean {
  try {
    if (configExists()) {
      console.log(chalk.yellow('⚠️ 配置文件已存在，不会覆盖现有配置'));
      return true;
    }

    const configData: Config = {
      ...defaultConfig,
      SYSTEM_PROMPT:
        '你是一个人工智能助手，你更擅长中文对话。你会为用户提供安全，有帮助，准确的回答',
    };

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configData, null, 2));

    console.log(chalk.green('✅ 已创建默认配置文件'));
    console.log(chalk.cyan(`📁 配置文件位置: ${CONFIG_FILE_PATH}`));
    console.log(chalk.yellow('💡 请使用 `voidai config set OPENAI_API_KEY your-key` 设置API密钥'));

    return true;
  } catch (error) {
    console.error(chalk.red('❌ 创建配置文件失败:'), (error as Error).message);
    return false;
  }
}

export function readConfig(): Record<string, any> {
  try {
    if (!configExists()) return {};
    const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red('❌ 读取配置文件失败:'), (error as Error).message);
    return {};
  }
}

export function getAllConfig(): Record<string, any> {
  const config = rc('voidai', defaultConfig);
  const filteredConfig: Record<string, any> = {};
  Object.entries(config).forEach(([key, value]) => {
    if (!key.startsWith('_') && key !== 'config' && key !== 'configs') {
      filteredConfig[key] = value;
    }
  });
  return filteredConfig;
}

export function getConfigValue(key: string): string | null {
  const config = rc('voidai', defaultConfig);

  if (key.includes('.')) {
    const keys = key.split('.');
    let value: any = config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return value !== undefined ? String(value) : null;
  }

  const value = config[key];
  return value !== undefined ? String(value) : null;
}

export function setConfigValue(key: string, value: string): boolean {
  try {
    let existingConfig: Record<string, any> = configExists() ? readConfig() : {};

    if (key.includes('.')) {
      const keys = key.split('.');
      let current: any = existingConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (k && (!current[k] || typeof current[k] !== 'object')) {
          current[k] = {};
        }
        if (k) {
          current = current[k];
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
    } else {
      existingConfig[key] = value;
    }

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(existingConfig, null, 2));
    console.log(chalk.green(`✅ 配置已保存到: ${CONFIG_FILE_PATH}`));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ 设置配置值失败:'), (error as Error).message);
    return false;
  }
}

export function getAllModels(): Record<string, ModelConfig> {
  const config = rc('voidai', defaultConfig);
  const models: Record<string, ModelConfig> = { ...defaultConfig.MODELS };

  if (config.MODELS) {
    Object.assign(models, config.MODELS);
  }

  Object.entries(config).forEach(([key, value]) => {
    if (key.startsWith('MODELS.') && key !== 'MODELS') {
      const remainingKey = key.substring(7);
      const firstDotIndex = remainingKey.indexOf('.');

      if (firstDotIndex > 0) {
        const modelId = remainingKey.substring(0, firstDotIndex);
        const field = remainingKey.substring(firstDotIndex + 1) as keyof ModelConfig;

        if (!models[modelId]) {
          const defaultModel = defaultConfig.MODELS[modelId];
          if (defaultModel) {
            models[modelId] = { ...defaultModel };
          }
        }

        if (models[modelId] && typeof models[modelId] === 'object') {
          models[modelId][field] = value;
        }
      }
    }
  });

  return models;
}

export function getModelConfig(modelId: string): ModelConfig | null {
  const config = rc('voidai', defaultConfig);

  if (!defaultConfig.MODELS[modelId]) {
    if (config.MODELS && config.MODELS[modelId]) {
      return config.MODELS[modelId];
    }
    return null;
  }

  const modelConfig: ModelConfig = { ...defaultConfig.MODELS[modelId] };

  if (config.MODELS && config.MODELS[modelId]) {
    Object.assign(modelConfig, config.MODELS[modelId]);
  }

  Object.entries(config).forEach(([key, value]) => {
    if (key.startsWith(`MODELS.${modelId}.`)) {
      const field = key.split('.')[2] as keyof ModelConfig;
      if (field) {
        modelConfig[field] = value;
      }
    }
  });

  return modelConfig;
}

export function getDefaultModel(): string {
  const config = rc('voidai', defaultConfig);
  return config['DEFAULT_MODEL'] || defaultConfig['DEFAULT_MODEL'];
}

export function setDefaultModel(modelId: string): boolean {
  try {
    let existingConfig: Record<string, any> = configExists() ? readConfig() : {};
    existingConfig['DEFAULT_MODEL'] = modelId;
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(existingConfig, null, 2));
    console.log(chalk.green(`✅ 默认模型已设置为: ${modelId}`));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ 设置默认模型失败:'), (error as Error).message);
    return false;
  }
}

export function addModel(modelId: string, modelConfig: ModelConfig): boolean {
  try {
    let existingConfig: Record<string, any> = configExists() ? readConfig() : {};
    if (!existingConfig['MODELS']) {
      existingConfig['MODELS'] = {};
    }
    existingConfig['MODELS'][modelId] = modelConfig;
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(existingConfig, null, 2));
    console.log(chalk.green(`✅ 已添加模型: ${modelId}`));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ 添加模型失败:'), (error as Error).message);
    return false;
  }
}

export function removeModel(modelId: string): boolean {
  try {
    let existingConfig: Record<string, any> = configExists() ? readConfig() : {};
    if (existingConfig['MODELS'] && existingConfig['MODELS'][modelId]) {
      delete existingConfig['MODELS'][modelId];
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(existingConfig, null, 2));
      console.log(chalk.green(`✅ 已删除模型: ${modelId}`));
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ 模型 ${modelId} 不存在`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('❌ 删除模型失败:'), (error as Error).message);
    return false;
  }
}

export function updateModel(modelId: string, updates: Partial<ModelConfig>): boolean {
  try {
    let existingConfig: Record<string, any> = configExists() ? readConfig() : {};
    if (existingConfig['MODELS'] && existingConfig['MODELS'][modelId]) {
      existingConfig['MODELS'][modelId] = { ...existingConfig['MODELS'][modelId], ...updates };
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(existingConfig, null, 2));
      console.log(chalk.green(`✅ 已更新模型: ${modelId}`));
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ 模型 ${modelId} 不存在`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('❌ 更新模型失败:'), (error as Error).message);
    return false;
  }
}
