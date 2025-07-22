import chalk from 'chalk';

import {
  createDefaultConfig,
  getAllConfig,
  getConfigValue,
  setConfigValue,
  getConfigPath,
  configExists,
  getDefaultModel,
} from '../core/config.js';
import type { ModelConfig } from '../types/index.js';

export function handleConfigInit() {
  console.log(chalk.cyan.bold('\n🔧 初始化配置文件\n'));

  const configPath = getConfigPath();

  console.log(chalk.yellow('配置文件路径:'));
  console.log(`  ${chalk.white(configPath)}\n`);

  if (configExists()) {
    console.log(chalk.yellow('⚠️ 配置文件已存在'));
  } else {
    createDefaultConfig();
  }

  console.log(chalk.cyan('\n💡 提示: 使用 `termchat config list` 查看当前配置'));
  console.log(chalk.cyan('💡 提示: 使用 `termchat model add` 添加模型'));
}

export function handleConfigList() {
  console.log(chalk.cyan.bold('\n📋 当前所有配置:\n'));

  const allConfig = getAllConfig();

  if (Object.keys(allConfig).length === 0) {
    console.log(chalk.gray('  (无配置项)'));
    console.log(chalk.cyan('\n💡 使用 `termchat config init` 初始化配置文件'));
    console.log(chalk.cyan('💡 使用 `termchat model add` 添加模型'));
    return;
  }

  console.log(chalk.yellow(`配置文件: ${getConfigPath()}\n`));

  const categories: Record<string, string[]> = {
    基本设置: ['DEFAULT_MODEL', 'SYSTEM_PROMPT'],
    模型配置: [],
  };

  const otherKeys: string[] = [];
  for (const key of Object.keys(allConfig)) {
    if (key === 'MODELS') {
      categories['模型配置']?.push(key);
    } else if (categories['基本设置']?.includes(key)) {
      continue;
    } else {
      otherKeys.push(key);
    }
  }

  if (otherKeys.length > 0) {
    categories['其他设置'] = otherKeys;
  }

  for (const [category, keys] of Object.entries(categories)) {
    if (!keys || keys.length === 0) continue;

    console.log(chalk.blue.bold(`${category}:`));
    for (const key of keys) {
      if (key === 'MODELS') {
        const models = allConfig[key] as Record<string, ModelConfig>;
        if (models && Object.keys(models).length > 0) {
          console.log(
            `  ${chalk.green('MODELS'.padEnd(20))}: ${chalk.white(`${Object.keys(models).length} 个模型`)}`
          );
          const defaultModel = getDefaultModel();
          for (const [modelId, model] of Object.entries(models)) {
            const isDefault = modelId === defaultModel;
            const status = model.apiKey ? chalk.green('✅') : chalk.red('❌');
            const defaultMark = isDefault ? chalk.yellow(' (默认)') : '';
            console.log(`    ${status} ${chalk.gray(modelId)}${defaultMark} - ${model.model}`);
          }
          console.log(chalk.cyan('    💡 使用 `termchat model list` 查看详细模型信息'));
          console.log(
            chalk.cyan('    💡 使用 `termchat config get MODELS.<model-id>.<field>` 查看具体配置')
          );
        } else {
          console.log(`  ${chalk.green('MODELS'.padEnd(20))}: ${chalk.gray('(无模型)')}`);
        }
      } else if (allConfig[key]) {
        const value = allConfig[key];
        const displayValue =
          key.includes('KEY') || key.includes('SECRET')
            ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
            : value;

        console.log(`  ${chalk.green(key.padEnd(20))}: ${chalk.white(displayValue)}`);
      }
    }
    console.log();
  }

  console.log(chalk.yellow('配置文件状态:'));
  console.log(`  ${configExists() ? chalk.green('存在') : chalk.gray('不存在')}`);
}

export function handleConfigGet(key?: string) {
  if (!key) {
    console.log(chalk.red('❌ 使用方法: termchat config get <key>'));
    console.log(chalk.yellow('💡 示例: termchat config get DEFAULT_MODEL'));
    console.log(chalk.yellow('💡 示例: termchat config get MODELS.openai-gpt-4.apiKey'));
    console.log(chalk.cyan('💡 使用 `termchat config list` 查看所有配置'));
    return;
  }

  const value = getConfigValue(key);
  if (value !== null) {
    const displayValue =
      key.includes('KEY') || key.includes('SECRET')
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value;

    console.log(chalk.green(`${key}:`), chalk.white(displayValue));

    if (key.startsWith('MODELS.')) {
      console.log(
        chalk.cyan('\n💡 提示: 也可以使用 `termchat model config <model-id>` 查看模型配置')
      );
    }
  } else {
    console.log(chalk.yellow(`⚠️ 配置项 "${key}" 不存在或未设置`));
    console.log(chalk.cyan(`💡 使用 'termchat config set ${key} <value>' 设置此配置项`));
  }
}

export async function handleConfigSet(key?: string, value?: string) {
  if (!key || value === undefined) {
    console.log(chalk.red('❌ 使用方法: termchat config set <key> <value>'));
    console.log(chalk.yellow('💡 示例: termchat config set DEFAULT_MODEL openai-gpt-4'));
    console.log(chalk.yellow('💡 示例: termchat config set MODELS.openai-gpt-4.apiKey your-key'));
    return;
  }

  console.log(chalk.cyan.bold('\n🔧 设置配置项\n'));

  const currentValue = getConfigValue(key);
  if (currentValue) {
    const displayValue =
      key.includes('KEY') || key.includes('SECRET')
        ? `${currentValue.substring(0, 4)}...${currentValue.substring(currentValue.length - 4)}`
        : currentValue;
    console.log(`当前值: ${chalk.white(displayValue)}`);
  } else {
    console.log(`当前值: ${chalk.gray('(未设置)')}`);
  }

  const displayNewValue =
    key.includes('KEY') || key.includes('SECRET')
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : value;
  console.log(`新值: ${chalk.white(displayNewValue)}\n`);

  const success = setConfigValue(key, value);

  if (success) {
    console.log(chalk.green(`✅ 已设置 ${key} = ${displayNewValue}`));
    console.log(chalk.cyan(`📁 保存到: ${getConfigPath()}`));

    if (key.startsWith('MODELS.')) {
      console.log(
        chalk.cyan(
          '\n💡 提示: 也可以使用 `termchat model update <model-id> <field> <value>` 更新模型配置'
        )
      );
    }
  } else {
    console.log(chalk.red('❌ 设置配置项失败'));
  }
}

export async function handleConfigDelete() {
  console.log(chalk.cyan.bold('\n🗑️ 删除配置文件\n'));

  const configPath = getConfigPath();

  if (!configExists()) {
    console.log(chalk.yellow('⚠️ 配置文件不存在'));
    console.log(chalk.cyan('💡 使用 `termchat config init` 初始化配置文件'));
    return;
  }

  console.log(chalk.yellow('配置文件路径:'));
  console.log(`  ${chalk.white(configPath)}\n`);

  const allConfig = getAllConfig();
  const modelCount = allConfig['MODELS'] ? Object.keys(allConfig['MODELS']).length : 0;

  console.log(chalk.red('⚠️ 删除配置文件将导致以下影响:'));
  console.log(chalk.red(`  • 所有配置项将被删除`));
  console.log(chalk.red(`  • ${modelCount} 个模型配置将丢失`));
  console.log(chalk.red(`  • 需要重新初始化配置`));
  console.log(chalk.red(`  • 需要重新添加模型`));
  console.log();

  try {
    const enquirer = await import('enquirer');

    const response = await enquirer.default.prompt<{ confirmed: boolean }>({
      type: 'confirm',
      name: 'confirmed',
      message: '确定要删除配置文件吗？',
      initial: false,
    });

    const confirmed = response.confirmed;

    if (confirmed) {
      const fs = await import('fs');
      fs.unlinkSync(configPath);
      console.log(chalk.green('✅ 配置文件已删除'));
      console.log(chalk.cyan('💡 使用 `termchat config init` 重新初始化配置'));
    } else {
      console.log(chalk.green('👋 取消删除配置文件'));
    }
  } catch (error) {
    const errorMessage = (error as any)?.message || '';
    console.error(chalk.red('❌ 删除配置文件失败:'), errorMessage || error);
  }
}
