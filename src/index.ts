export {
  createDefaultConfig,
  getAllConfig,
  getConfigValue,
  setConfigValue,
  getConfigPath,
  configExists,
  getModelConfig,
  getAllModels,
  getDefaultModel,
  setDefaultModel,
  addModel,
  removeModel,
  updateModel,
  createAIClient,
  validateModel,
  startChatSession,
} from './core/index.js';

export {
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
} from './commands/index.js';

export { displayWelcomeMessage, displayHelpMessage } from './ui/index.js';
