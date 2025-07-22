import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';

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

export function displayWelcomeMessage(currentModel, isStreamMode) {
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

export function displayHelpMessage() {
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
