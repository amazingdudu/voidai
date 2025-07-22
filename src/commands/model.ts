import chalk from 'chalk';
import {
  getAllModels,
  getDefaultModel,
  getModelConfig,
  setDefaultModel,
  addModel,
  removeModel,
  updateModel,
} from '../core/config.js';
import {
  validateModelId,
  validateApiKey,
  validateUrl,
  validateModelName,
} from '../utils/validation.js';
import type { ModelCommandOptions, ModelConfig } from '../types/index.js';

export function handleModelList(options: ModelCommandOptions = {}) {
  const models = getAllModels();
  const defaultModelId = getDefaultModel();

  if (!models || Object.keys(models).length === 0) {
    if (options.id) {
      console.log(chalk.gray('(无可用模型)'));
    } else {
      console.log(chalk.cyan.bold('\n📋 可用模型列表:\n'));
      console.log(chalk.gray('  (无可用模型)'));
      console.log(chalk.cyan('\n💡 使用 `termchat model add` 添加模型'));
    }
    return;
  }

  if (options.id) {
    const modelIds = Object.keys(models);
    modelIds.forEach((modelId) => {
      const isDefault = modelId === defaultModelId;
      const defaultMark = isDefault ? ' (默认)' : '';
      console.log(`${modelId}${defaultMark}`);
    });
    return;
  }

  console.log(chalk.cyan.bold('\n📋 可用模型列表:\n'));

  for (const [modelId, model] of Object.entries(models)) {
    const isDefault = modelId === defaultModelId;
    const status = model.apiKey ? chalk.green('✅') : chalk.red('❌');
    const defaultMark = isDefault ? chalk.yellow(' (默认)') : '';
    console.log(chalk.blue.bold(`${model.model}${defaultMark}`));
    console.log(`  ID: ${chalk.gray(modelId)}`);
    console.log(`  状态: ${status} ${model.apiKey ? '已配置' : '未配置'}`);
    if (model.baseURL) {
      console.log(`  API地址: ${chalk.gray(model.baseURL)}`);
    }
    console.log();
  }

  console.log(chalk.cyan('💡 使用 `termchat model select` 图形化选择模型'));
  console.log(chalk.cyan('💡 使用 `termchat model set <model-id>` 设置默认模型'));
  console.log(chalk.cyan('💡 使用 `termchat model list --id` 只显示模型ID'));
}

export function handleModelSet(modelId?: string) {
  if (!modelId) {
    console.log(chalk.red('❌ 使用方法: termchat model set <model-id>'));
    console.log(chalk.yellow('💡 示例: termchat model set openai-gpt-4'));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  const models = getAllModels();
  if (!models[modelId]) {
    console.log(chalk.red(`❌ 模型 "${modelId}" 不存在`));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  const success = setDefaultModel(modelId);
  if (success) {
    console.log(chalk.green(`✅ 已设置默认模型为: ${models[modelId].model}`));
  } else {
    console.log(chalk.red('❌ 设置默认模型失败'));
  }
}

export async function handleModelAdd() {
  console.log(chalk.cyan.bold('\n➕ 添加新模型\n'));

  try {
    const enquirer = await import('enquirer');

    const modelIdResponse = await enquirer.default.prompt({
      type: 'input',
      name: 'modelId',
      message: '模型ID (用于标识模型):',
      initial: 'custom-model',
      validate: (value: string) => {
        if (!validateModelId(value)) {
          return '模型ID只能包含字母、数字、连字符和下划线';
        }
        const models = getAllModels();
        if (models[value]) {
          return '模型ID已存在';
        }
        return true;
      },
    });

    const baseURLResponse = await enquirer.default.prompt({
      type: 'input',
      name: 'baseURL',
      message: 'API基础URL:',
      initial: 'https://',
      validate: (value: string) => {
        if (value && !validateUrl(value)) {
          return 'URL格式无效';
        }
        return true;
      },
    });

    const apiKeyResponse = await enquirer.default.prompt({
      type: 'input',
      name: 'apiKey',
      message: 'API密钥:',
      initial: 'sk-',
      validate: (value: string) => {
        if (!validateApiKey(value)) {
          return 'API密钥格式无效，应以sk-开头';
        }
        return true;
      },
    });

    const modelResponse = await enquirer.default.prompt({
      type: 'input',
      name: 'model',
      message: '模型名称 (API模型标识符):',
      initial: 'gpt-3.5-turbo',
      validate: (value: string) => {
        if (!validateModelName(value)) {
          return '模型名称只能包含字母、数字、连字符、点和下划线';
        }
        return true;
      },
    });

    const modelId = (modelIdResponse as any).modelId;
    const baseURL = (baseURLResponse as any).baseURL;
    const apiKey = (apiKeyResponse as any).apiKey;
    const model = (modelResponse as any).model;

    const success = addModel(modelId, {
      baseURL: baseURL || '',
      apiKey: apiKey,
      model: model,
      description: `自定义模型: ${model}`,
    });

    if (success) {
      console.log(chalk.green(`✅ 已添加模型: ${model}`));
      console.log(chalk.cyan('💡 使用 `termchat model set <model-id>` 设置为默认模型'));
    } else {
      console.log(chalk.red('❌ 添加模型失败'));
    }
  } catch (error) {
    const errorMessage = (error as any)?.message || '';
    console.error(chalk.red('❌ 添加模型失败:'), errorMessage || error);
  }
}

export async function handleModelRemove(modelId?: string) {
  if (!modelId) {
    console.log(chalk.red('❌ 使用方法: termchat model remove <model-id>'));
    console.log(chalk.yellow('💡 示例: termchat model remove openai-gpt-4'));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  const models = getAllModels();
  if (!models[modelId]) {
    console.log(chalk.red(`❌ 模型 "${modelId}" 不存在`));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  console.log(chalk.yellow(`⚠️ 确定要删除模型 "${models[modelId].model}" 吗？`));
  console.log(chalk.yellow('此操作不可恢复！'));

  const success = removeModel(modelId);
  if (success) {
    console.log(chalk.green(`✅ 已删除模型: ${models[modelId].model}`));
  } else {
    console.log(chalk.red('❌ 删除模型失败'));
  }
}

export function handleModelConfig(modelId?: string) {
  if (!modelId) {
    console.log(chalk.red('❌ 使用方法: termchat model config <model-id>'));
    console.log(chalk.yellow('💡 示例: termchat model config openai-gpt-4'));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  const model = getModelConfig(modelId);
  if (!model) {
    console.log(chalk.red(`❌ 模型 "${modelId}" 不存在`));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  console.log(chalk.cyan.bold(`\n📋 模型配置: ${model.model}\n`));

  console.log(chalk.yellow('基本信息:'));
  console.log(`  模型ID: ${chalk.white(modelId)}`);
  console.log(`  模型名称: ${chalk.white(model.model)}`);
  console.log(`  API密钥: ${model.apiKey ? chalk.green('✅ 已配置') : chalk.red('❌ 未配置')}`);
  if (model.apiKey) {
    const maskedKey = `${model.apiKey.substring(0, 4)}...${model.apiKey.substring(model.apiKey.length - 4)}`;
    console.log(`  密钥预览: ${chalk.gray(maskedKey)}`);
  }
  console.log(
    `  API地址: ${model.baseURL ? chalk.white(model.baseURL) : chalk.gray('(使用默认)')}`
  );
}

export async function handleModelUpdate(modelId?: string, field?: string, value?: string) {
  if (!modelId || !field || value === undefined) {
    console.log(chalk.red('❌ 使用方法: termchat model update <model-id> <field> <value>'));
    console.log(chalk.yellow('💡 示例: termchat model update openai-gpt-4 apiKey your-api-key'));
    console.log(
      chalk.yellow('💡 示例: termchat model update openai-gpt-4 baseURL https://api.openai.com/v1')
    );
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  const allowedFields = ['model', 'apiKey', 'baseURL'];
  if (!allowedFields.includes(field)) {
    console.log(chalk.red(`❌ 不支持更新字段: ${field}`));
    console.log(chalk.yellow(`支持的字段: ${allowedFields.join(', ')}`));
    return;
  }

  const model = getModelConfig(modelId);
  if (!model) {
    console.log(chalk.red(`❌ 模型 "${modelId}" 不存在`));
    console.log(chalk.cyan('💡 使用 `termchat model list` 查看可用模型'));
    return;
  }

  console.log(chalk.cyan.bold(`\n🔧 更新模型配置: ${model.model}\n`));

  const currentValue = (model as any)[field];
  if (currentValue) {
    const displayValue =
      field === 'apiKey'
        ? `${currentValue.substring(0, 4)}...${currentValue.substring(currentValue.length - 4)}`
        : currentValue;
    console.log(`当前 ${field}: ${chalk.white(displayValue)}`);
  } else {
    console.log(`当前 ${field}: ${chalk.gray('(未设置)')}`);
  }

  const displayNewValue =
    field === 'apiKey' ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : value;
  console.log(`新 ${field}: ${chalk.white(displayNewValue)}\n`);

  const success = updateModel(modelId, { [field]: value } as Partial<ModelConfig>);
  if (success) {
    console.log(chalk.green(`✅ 已更新 ${field} = ${displayNewValue}`));
  } else {
    console.log(chalk.red('❌ 更新模型配置失败'));
  }
}

export async function handleModelSelect() {
  console.log(chalk.cyan.bold('\n🎯 选择模型\n'));

  try {
    const enquirer = await import('enquirer');

    const models = getAllModels();
    const defaultModelId = getDefaultModel();

    if (!models || Object.keys(models).length === 0) {
      console.log(chalk.yellow('⚠️ 没有可用的模型'));
      console.log(chalk.cyan('💡 使用 `termchat model add` 添加模型'));
      return;
    }

    const choices = Object.entries(models).map(([modelId, model]) => {
      const isDefault = modelId === defaultModelId;
      const status = model.apiKey ? chalk.green('✅') : chalk.red('❌');
      const defaultMark = isDefault ? chalk.yellow(' (默认)') : '';
      const description = model.apiKey ? '已配置API密钥' : '未配置API密钥';

      return {
        name: modelId,
        message: `${status} ${model.model}${defaultMark}`,
        hint: description,
        value: modelId,
      };
    });

    const response = await enquirer.default.prompt({
      type: 'select',
      name: 'selectedModelId',
      message: '选择要查看的模型:',
      choices: choices,
      initial: defaultModelId,
    } as any);

    const selectedModelId = (response as any).selectedModelId;

    handleModelSet(selectedModelId);
  } catch (error) {
    const errorMessage = (error as any)?.message || '';
    console.error(chalk.red('❌ 选择模型失败:'), errorMessage || error);
  }
}
