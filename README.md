# VoidAI

一个简单易用的终端AI聊天助手，支持流式输出和Markdown渲染，支持多模型管理。

## 功能特性

- 🤖 **多模型支持**: 支持OpenAI、Anthropic等多种AI模型
- 🔄 **流式输出**: 实时显示AI响应内容
- 📝 **Markdown渲染**: 支持代码高亮和格式化显示
- ⚙️ **灵活配置**: 每个模型独立的API密钥和基础URL
- 🎨 **美观界面**: 彩色输出和加载动画

## 安装

```bash
npm install -g voidai
```

或本地安装：

```bash
git clone <repository-url>
cd voidai
npm install
npm link
```

## 快速开始

### 1. 初始化配置

```bash
voidai config init
```

### 2. 配置模型

查看可用模型：

```bash
voidai model list
```

设置模型API密钥：

```bash
voidai config set "MODELS.openai-gpt-3.5-turbo.apiKey" "your-api-key"
```

### 3. 开始聊天

```bash
voidai
```

## 命令参考

### 聊天命令

| 命令                        | 描述                 | 示例                          |
| --------------------------- | -------------------- | ----------------------------- |
| `voidai`                    | 开始聊天会话         | `voidai`                      |
| `voidai --model <model-id>` | 使用指定模型开始聊天 | `voidai --model openai-gpt-4` |
| `voidai --stream`           | 启用流式输出         | `voidai --stream`             |

### 配置管理命令

| 命令                              | 描述                       | 示例                                                 |
| --------------------------------- | -------------------------- | ---------------------------------------------------- |
| `voidai config init`              | 初始化配置文件             | `voidai config init`                                 |
| `voidai config list`              | 列出所有配置项             | `voidai config list`                                 |
| `voidai config get <key>`         | 获取指定配置项的值         | `voidai config get DEFAULT_MODEL`                    |
| `voidai config set <key> <value>` | 设置配置项的值             | `voidai config set SYSTEM_PROMPT "你是一个编程助手"` |
| `voidai config delete`            | 删除配置文件（需二次确认） | `voidai config delete`                               |

### 模型管理命令

| 命令                                             | 描述               | 示例                                              |
| ------------------------------------------------ | ------------------ | ------------------------------------------------- |
| `voidai model list`                              | 列出所有可用模型   | `voidai model list`                               |
| `voidai model list --id`                         | 只显示模型ID列表   | `voidai model list --id`                          |
| `voidai model add`                               | 交互式添加新模型   | `voidai model add`                                |
| `voidai model set <model-id>`                    | 设置默认模型       | `voidai model set openai-gpt-4`                   |
| `voidai model remove <model-id>`                 | 删除指定模型       | `voidai model remove my-custom-model`             |
| `voidai model config <model-id>`                 | 查看指定模型的配置 | `voidai model config openai-gpt-4`                |
| `voidai model update <model-id> <field> <value>` | 更新模型配置字段   | `voidai model update openai-gpt-4 apiKey new-key` |
| `voidai model select`                            | 图形化选择模型     | `voidai model select`                             |

### 配置项说明

| 配置项                      | 类型   | 描述             | 示例                          |
| --------------------------- | ------ | ---------------- | ----------------------------- |
| `DEFAULT_MODEL`             | string | 默认使用的模型ID | `"openai-gpt-3.5-turbo"`      |
| `SYSTEM_PROMPT`             | string | 系统提示词       | `"你是一个编程助手"`          |
| `MODELS.<model-id>.model`   | string | API模型标识符    | `"gpt-3.5-turbo"`             |
| `MODELS.<model-id>.apiKey`  | string | API密钥          | `"sk-..."`                    |
| `MODELS.<model-id>.baseURL` | string | API基础URL       | `"https://api.openai.com/v1"` |

### 聊天会话内命令

在聊天过程中，你可以使用以下命令：

| 命令                                  | 描述         |
| ------------------------------------- | ------------ |
| `exit`, `quit`, `bye`, `退出`, `再见` | 退出聊天     |
| `clear`, `cls`, `清屏`                | 清屏         |
| `help`, `帮助`                        | 显示帮助信息 |

## 支持的模型

### 默认模型

- **GPT-3.5 Turbo** (`openai-gpt-3.5-turbo`) - OpenAI GPT-3.5 Turbo
- **GPT-4** (`openai-gpt-4`) - OpenAI GPT-4
- **Claude 3 Sonnet** (`claude-3-sonnet`) - Anthropic Claude 3 Sonnet

### 添加自定义模型

你可以添加任何兼容OpenAI API格式的模型：

```bash
voidai model add
```

支持以下提供商：

- OpenAI
- Anthropic
- 自定义API

## 配置文件

配置文件位置：`~/.voidairc`

示例配置：

```json
{
  "DEFAULT_MODEL": "openai-gpt-3.5-turbo",
  "SYSTEM_PROMPT": "你是一个人工智能助手，你更擅长中文对话。",
  "MODELS": {
    "openai-gpt-3.5-turbo": {
      "model": "gpt-3.5-turbo",
      "baseURL": "https://api.openai.com/v1",
      "apiKey": "your-api-key"
    }
  }
}
```

## 使用技巧

### 1. 快速切换模型

```bash
# 使用图形化界面选择模型
voidai model select

# 或直接指定模型
voidai --model openai-gpt-4
```

### 2. 批量配置模型

```bash
# 设置多个模型的API密钥
voidai config set "MODELS.openai-gpt-3.5-turbo.apiKey" "sk-..."
voidai config set "MODELS.openai-gpt-4.apiKey" "sk-..."
voidai config set "MODELS.claude-3-sonnet.apiKey" "sk-ant-..."
```

### 3. 查看模型状态

```bash
# 查看所有模型及其状态
voidai model list

# 只查看模型ID
voidai model list --id
```

## 开发

```bash
# 安装依赖
npm install

# 运行开发版本
npm start

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 许可证

ISC
