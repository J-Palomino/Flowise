const ENABLE_GOOGLE_GENERATIVE_AI_CHAT = process.env.ENABLE_GOOGLE_GENERATIVE_AI_CHAT === 'true';

// Export the type/interface directly from the _enabled version as it's the comprehensive one.
// This ensures that consuming files get the correct type information.
export type { GoogleGenerativeAIChatInput } from './FlowiseChatGoogleGenerativeAI_enabled';

let ChatGoogleGenerativeAI: any;

if (ENABLE_GOOGLE_GENERATIVE_AI_CHAT) {
    const enabledModule = require('./FlowiseChatGoogleGenerativeAI_enabled');
    ChatGoogleGenerativeAI = enabledModule.ChatGoogleGenerativeAI;
} else {
    const disabledModule = require('./FlowiseChatGoogleGenerativeAI_disabled');
    ChatGoogleGenerativeAI = disabledModule.ChatGoogleGenerativeAI;
}

export { ChatGoogleGenerativeAI };
