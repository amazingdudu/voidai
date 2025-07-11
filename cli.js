import 'dotenv/config';
import enquirer from 'enquirer';
import ora from 'ora';
import OpenAI from 'openai';

import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import chalk from 'chalk';

marked.use(markedTerminal());

const { Input } = enquirer;

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const useStream = process.argv.includes('--stream');

console.log(chalk.green.bold('欢迎使用AI终端助手！直接输入你的问题与AI对话。'));
console.log(
  chalk.cyan(`当前模式：${useStream ? '流式输出' : '普通输出'}（可用 --stream 参数切换）`)
);
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
          messages: [{ role: 'user', content: input }],
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
          messages: [{ role: 'user', content: input }],
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
