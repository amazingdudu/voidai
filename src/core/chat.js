import enquirer from 'enquirer';
import ora from 'ora';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import chalk from 'chalk';
import { displayWelcomeMessage } from '../ui/components.js';

marked.use(markedTerminal());

const { Input } = enquirer;

const COMMANDS = {
  EXIT: ['exit', 'quit', 'bye', '退出', '再见'],
  CLEAR: ['clear', 'cls', '清屏'],
  HELP: ['help', '帮助'],
};

const MESSAGES = {
  THINKING: 'AI正在思考中...',
  RESPONSE_COMPLETE: 'AI响应完成',
  REQUEST_ERROR: 'AI请求失败',
  GOODBYE: '👋 感谢使用，再见！',
  INVALID_INPUT: '请输入有效的问题',
  CONNECTION_ERROR: '连接失败，请检查网络或API配置',
};

const PROMPTS = {
  USER_INPUT: '你',
  AI_RESPONSE: 'AI',
};

function isExitCommand(input) {
  return COMMANDS.EXIT.includes(input.toLowerCase());
}

function isClearCommand(input) {
  return COMMANDS.CLEAR.includes(input.toLowerCase());
}

function handleSpecialCommands(input, currentModel, isStreamMode) {
  if (isExitCommand(input)) {
    console.log(chalk.green(`\n${MESSAGES.GOODBYE}`));
    process.exit(0);
  }

  if (isClearCommand(input)) {
    console.clear();
    displayWelcomeMessage(currentModel, isStreamMode);
    return true;
  }

  if (isHelpCommand(input)) {
    displayHelpMessage();
    return true;
  }

  return false;
}

async function getUserInput() {
  try {
    const prompt = new Input({
      message: chalk.yellow(`${PROMPTS.USER_INPUT} > `),
    });
    const input = (await prompt.run()).trim();

    if (!input) {
      console.log(chalk.gray(MESSAGES.INVALID_INPUT));
      return null;
    }

    return input;
  } catch (error) {
    console.log(chalk.green(`\n${MESSAGES.GOODBYE}`));
    process.exit(0);
  }
}

async function handleStreamResponse(userInput, aiClient, currentModel, systemPrompt) {
  let hasResponseStarted = false;

  try {
    const stream = await aiClient.chat.completions.create({
      model: currentModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        if (!hasResponseStarted) {
          process.stdout.write(chalk.magenta(`${PROMPTS.AI_RESPONSE}: `));
          hasResponseStarted = true;
        }
        process.stdout.write(content);
      }
    }

    if (hasResponseStarted) {
      process.stdout.write('\n\n');
    }
  } catch (error) {
    throw new Error(`流式响应错误: ${error.message}`);
  }
}

async function handleNormalResponse(userInput, aiClient, currentModel, systemPrompt) {
  try {
    const completion = await aiClient.chat.completions.create({
      model: currentModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
    });

    const responseContent = completion.choices[0].message.content;
    console.log(chalk.magenta(`${PROMPTS.AI_RESPONSE}:`), marked.parse(responseContent));
  } catch (error) {
    throw new Error(`AI响应错误: ${error.message}`);
  }
}

async function processAIRequest(userInput, aiClient, currentModel, systemPrompt, isStreamMode) {
  const thinkingSpinner = ora(chalk.blue(MESSAGES.THINKING)).start();

  try {
    if (isStreamMode) {
      thinkingSpinner.stop();
      await handleStreamResponse(userInput, aiClient, currentModel, systemPrompt);
    } else {
      await handleNormalResponse(userInput, aiClient, currentModel, systemPrompt);
      thinkingSpinner.succeed(chalk.green(MESSAGES.RESPONSE_COMPLETE));
      console.log('\n');
    }
  } catch (error) {
    thinkingSpinner.fail(chalk.red(MESSAGES.REQUEST_ERROR));

    if (error.message.includes('API key')) {
      console.error(chalk.red('❌ API密钥无效，请检查 OPENAI_API_KEY 环境变量'));
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.error(chalk.red('❌ 网络连接失败，请检查网络连接和 OPENAI_BASE_URL 配置'));
    } else {
      console.error(chalk.red(`❌ ${error.message}`));
    }
    console.log('\n');
  }
}

export async function startChatSession(aiClient, currentModel, systemPrompt, isStreamMode) {
  console.log(chalk.gray('开始聊天会话，随时输入问题开始对话...\n'));

  while (true) {
    const userInput = await getUserInput();

    if (!userInput) {
      continue;
    }

    if (handleSpecialCommands(userInput, currentModel, isStreamMode)) {
      console.log('\n');
      continue;
    }

    console.log('\n');
    await processAIRequest(userInput, aiClient, currentModel, systemPrompt, isStreamMode);
  }
}
