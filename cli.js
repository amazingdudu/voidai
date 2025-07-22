import 'dotenv/config';
import enquirer from 'enquirer';
import ora from 'ora';
import OpenAI from 'openai';
import boxen from 'boxen';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import chalk from 'chalk';
import figlet from 'figlet';

marked.use(markedTerminal());

const { Input } = enquirer;

const COMMANDS = {
  EXIT: ['exit', 'quit', 'bye', '退出', '再见'],
  CLEAR: ['clear', 'cls', '清屏'],
  HELP: ['help', '帮助'],
};

const MESSAGES = {
  WELCOME: '✨ 欢迎使用 AI 终端助手 ✨',
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

const aiClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt =
  process.env.SYSTEM_PROMPT ||
  '你是一个人工智能助手，你更擅长中文对话。你会为用户提供安全，有帮助，准确的回答';

const isStreamMode = process.argv.includes('--stream');
const currentModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

function createASCIITitle() {
  try {
    const title = figlet.textSync('TERMINAL CHAT', {
      font: 'Slant',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });

    const lines = title.split('\n');
    const coloredLines = lines.map((line, index) => {
      const ratio = index / (lines.length - 1);
      if (ratio < 0.33) return chalk.cyan(line);
      else if (ratio < 0.66) return chalk.blue(line);
      else return chalk.magenta(line);
    });

    return coloredLines.join('\n');
  } catch (error) {
    return chalk.cyan.bold('🤖 TERMINAL CHAT 🤖');
  }
}

function displayWelcomeMessage() {
  console.log('\n');
  console.log(createASCIITitle());
  console.log('\n');

  const modelInfo = chalk.yellow(`🤖 当前模型：${currentModel}`);
  const modeInfo = chalk.cyan(
    `⚡ 当前模式：${isStreamMode ? '流式输出' : '普通输出'}（可用 --stream 参数切换）`
  );
  const helpInfo = chalk.gray('💡 输入 "help" 查看可用命令');
  const tipInfo = chalk.gray('🚀 开始输入问题，与AI智能对话');

  const welcomeBox = boxen(
    `${chalk.green.bold('✨ 欢迎使用 AI 终端助手 ✨')}

${chalk.white(tipInfo)}

${modelInfo}
${modeInfo}
${helpInfo}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      textAlignment: 'center',
      title: chalk.cyan.bold(' 🤖 AI 助手 🤖 '),
      titleAlignment: 'center',
    }
  );

  console.log(welcomeBox);
  console.log('\n');
}

function displayHelpMessage() {
  const helpText = `
${chalk.green.bold('📖 可用命令：')}

${chalk.yellow('help, 帮助')}          - 显示此帮助信息
${chalk.yellow('clear, cls, 清屏')}    - 清屏
${chalk.yellow('exit, quit, bye, 退出, 再见')} - 退出程序

${chalk.cyan.bold('💡 使用技巧：')}
• 直接输入问题开始对话
• 支持中英文交流
• 使用 --stream 参数启用流式输出
• 按 Ctrl+C 可随时退出
`;

  console.log(
    boxen(helpText, {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'blue',
      title: chalk.blue.bold(' 帮助信息 '),
      titleAlignment: 'center',
    })
  );
}

function isExitCommand(input) {
  return COMMANDS.EXIT.includes(input.toLowerCase());
}

function isClearCommand(input) {
  return COMMANDS.CLEAR.includes(input.toLowerCase());
}

function isHelpCommand(input) {
  return COMMANDS.HELP.includes(input.toLowerCase());
}

function handleSpecialCommands(input) {
  if (isExitCommand(input)) {
    console.log(chalk.green(`\n${MESSAGES.GOODBYE}`));
    process.exit(0);
  }

  if (isClearCommand(input)) {
    console.clear();
    displayWelcomeMessage();
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

async function handleStreamResponse(userInput) {
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

async function handleNormalResponse(userInput) {
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

async function processAIRequest(userInput) {
  const thinkingSpinner = ora(chalk.blue(MESSAGES.THINKING)).start();

  try {
    if (isStreamMode) {
      thinkingSpinner.stop();
      await handleStreamResponse(userInput);
    } else {
      await handleNormalResponse(userInput);
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

async function startChatSession() {
  console.log(chalk.gray('开始聊天会话，随时输入问题开始对话...\n'));

  while (true) {
    const userInput = await getUserInput();

    if (!userInput) {
      continue;
    }

    if (handleSpecialCommands(userInput)) {
      console.log('\n');
      continue;
    }

    console.log('\n');
    await processAIRequest(userInput);
  }
}

async function initializeApplication() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error(chalk.red('❌ 缺少 OPENAI_API_KEY 环境变量'));
      process.exit(1);
    }

    displayWelcomeMessage();

    await startChatSession();
  } catch (error) {
    console.error(chalk.red('❌ 应用程序初始化失败:'), error.message);
    process.exit(1);
  }
}

initializeApplication();
