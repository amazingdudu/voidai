import "dotenv/config";
import enquirer from "enquirer";
import ora from "ora";
import OpenAI from "openai";

const { Input } = enquirer;

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const useStream = process.argv.includes("--stream");

console.log("欢迎使用AI终端助手！直接输入你的问题与AI对话。");
console.log(
  `当前模式：${useStream ? "流式输出" : "普通输出"}（可用 --stream 参数切换）`
);

async function chatLoop() {
  while (true) {
    let input = "";
    try {
      const prompt = new Input({ message: "你>" });
      input = (await prompt.run()).trim();
      if (!input) continue;
    } catch (err) {
      console.log("\n再见！");
      process.exit(0);
    }
    if (!input) continue;
    const spinner = ora("AI思考中...").start();
    try {
      if (useStream) {
        const stream = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL,
          messages: [{ role: "user", content: input }],
          stream: true,
        });

        let firstChunk = false;
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            if (!firstChunk) {
              spinner.stop();
              process.stdout.write("AI: ");
              firstChunk = true;
            }
            process.stdout.write(content);
          }
        }
        firstChunk = false;

        process.stdout.write("\n");
      } else {
        const completion = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL,
          messages: [{ role: "user", content: input }],
        });
        spinner.succeed("AI响应完成");
        console.log("AI:", completion.choices[0].message.content.trim());
      }
    } catch (err) {
      spinner.fail("AI请求出错");
      console.error("AI请求出错:", err.message);
    }
  }
}

chatLoop();
