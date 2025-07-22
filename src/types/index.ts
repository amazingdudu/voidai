import type OpenAI from 'openai';

export interface ModelConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  description: string;
}

export interface Config {
  DEFAULT_MODEL: string;
  SYSTEM_PROMPT: string;
  MODELS: Record<string, ModelConfig>;
  [key: string]: any;
}

export interface AIClient extends OpenAI {
  modelConfig: ModelConfig;
  modelId: string;
}

export interface CommandOptions {
  stream?: boolean;
  model?: string | null;
}

export interface ConfigCommandOptions {
  key?: string;
  value?: string;
}

export interface ModelCommandOptions {
  id?: boolean;
  modelId?: string;
  field?: string;
  value?: string;
}
