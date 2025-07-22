import 'dotenv/config';
import enquirer from 'enquirer';
import ora from 'ora';
import OpenAI from 'openai';
import boxen from 'boxen';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import chalk from 'chalk';

marked.use(markedTerminal());

const { Input } = enquirer;

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt =
  process.env.SYSTEM_PROMPT ||
  '你是一个人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答';

const useStream = process.argv.includes('--stream');

const modelInfo = chalk.yellow(`当前模型：${process.env.OPENAI_MODEL}`);
const modeInfo = chalk.cyan(
  `当前模式：${useStream ? '流式输出' : '普通输出'}（可用 --stream 参数切换）`
);

const welcomeBox = boxen(
  `${chalk.green.bold('✨ 欢迎使用 AI 终端助手 ✨')}

${chalk.white('直接输入你的问题与 AI 对话')}

${modelInfo}

${modeInfo}`,
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    backgroundColor: '#222',
    textAlignment: 'center',
    title: chalk.white.bold(' AI 终端助手 '),
    titleAlignment: 'center',
  }
);

console.log(welcomeBox);
console.log('\n');

async function chatLoop() {
  while (true) {
    let input = '';

    try {
      const prompt = new Input({ message: chalk.yellow('你>') });
      input = (await prompt.run()).trim();
      if (!input) continue;
    } catch (err) {
      console.log('\n再见！');
      process.exit(0);
    }

    if (!input) continue;
    console.log('\n');
    const spinner = ora(chalk.blue('AI思考中...')).start();

    try {
      if (useStream) {
        let hasStarted = false;

        const stream = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input },
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            if (!hasStarted) {
              spinner.stop();
              process.stdout.write(chalk.magenta('AI: '));
              hasStarted = true;
            }
            process.stdout.write(content);
          }
        }
        process.stdout.write('\n');
        hasStarted = false;
      } else {
        const completion = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input },
          ],
        });

        spinner.succeed(chalk.green('AI响应完成'));
        console.log('\n');
        console.log(chalk.magenta('AI:'), marked.parse(completion.choices[0].message.content));
      }
    } catch (err) {
      spinner.fail(chalk.red('AI请求出错'));
      console.error(chalk.red('AI请求出错:'), err.message);
    }
  }
}

chatLoop();
