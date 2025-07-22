#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import {
  handleConfigInit,
  handleConfigList,
  handleConfigGet,
  handleConfigSet,
  handleConfigDelete,
  handleModelList,
  handleModelSet,
  handleModelAdd,
  handleModelRemove,
  handleModelConfig,
  handleModelUpdate,
  handleModelSelect,
  displayWelcomeMessage,
  startChatSession,
  createAIClient,
  validateModel,
} from './src/index.js';
import type { CommandOptions } from './src/types/index.js';

const program = new Command();

program
  .name('terminal-chat')
  .description('AI终端助手')
  .version('1.0.0')
  .option('-s, --stream', '启用流式输出模式')
  .option('-m, --model <model-id>', '指定使用的模型')
  .action(async (options: CommandOptions) => {
    const modelId = options.model;

    if (!validateModel(modelId)) {
      process.exit(1);
    }

    try {
      const aiClient = createAIClient(modelId);

      const systemPrompt =
        process.env['SYSTEM_PROMPT'] ||
        '你是一个人工智能助手，你更擅长中文对话。你会为用户提供安全，有帮助，准确的回答';

      displayWelcomeMessage(aiClient.modelConfig.model, options.stream || false);
      await startChatSession(
        aiClient,
        aiClient.modelConfig.model,
        systemPrompt,
        options.stream || false
      );
    } catch (error) {
      console.error(chalk.red('❌ 应用程序初始化失败:'), (error as Error).message);
      process.exit(1);
    }
  });

const configCommand = program.command('config').description('配置管理');

configCommand.command('init').description('初始化配置文件').action(handleConfigInit);

configCommand.command('list').description('列出所有配置').action(handleConfigList);

configCommand
  .command('get')
  .description('获取指定配置项')
  .argument('[key]', '配置键名')
  .action(handleConfigGet);

configCommand
  .command('set')
  .description('设置配置项')
  .argument('[key]', '配置键名')
  .argument('[value]', '配置值')
  .action(handleConfigSet);

configCommand
  .command('delete')
  .description('删除配置文件（需要二次确认）')
  .action(handleConfigDelete);

const modelCommand = program.command('model').description('模型管理');

modelCommand
  .command('list')
  .description('列出所有可用模型')
  .option('--id', '只显示模型ID')
  .action(handleModelList);

modelCommand.command('select').description('选择模型').action(handleModelSelect);

modelCommand
  .command('set')
  .description('设置默认模型')
  .argument('[model-id]', '模型ID')
  .action(handleModelSet);

modelCommand.command('add').description('添加新模型').action(handleModelAdd);

modelCommand
  .command('remove')
  .description('删除模型')
  .argument('[model-id]', '模型ID')
  .action(handleModelRemove);

modelCommand
  .command('config')
  .description('查看模型配置')
  .argument('[model-id]', '模型ID')
  .action(handleModelConfig);

modelCommand
  .command('update')
  .description('更新模型配置')
  .argument('[model-id]', '模型ID')
  .argument('[field]', '字段名')
  .argument('[value]', '新值')
  .action(handleModelUpdate);

program.parse();
