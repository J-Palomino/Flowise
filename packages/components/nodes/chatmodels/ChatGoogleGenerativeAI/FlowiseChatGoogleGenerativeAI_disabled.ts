// FlowiseChatGoogleGenerativeAI_disabled.ts
import { BaseChatModelParams } from '@langchain/core/language_models/chat_models';

// Minimal interface matching necessary fields used by ChatGoogleGenerativeAI_enabled.ts
// or to satisfy type constraints if this dummy class is passed around.
export interface GoogleGenerativeAIChatInput extends BaseChatModelParams {
    modelName?: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    // safetySettings?: SafetySetting[]; // Avoid SafetySetting type from @google/generative-ai
    apiKey?: string;
    apiVersion?: string;
    baseUrl?: string;
    streaming?: boolean;
}

export class ChatGoogleGenerativeAI {
    constructor(id: string, fields?: GoogleGenerativeAIChatInput) {
        // The 'id' parameter is accepted for signature compatibility but might not be used in the disabled version.
        // console.log('Google Generative AI Chat (Disabled): Initialized with id:', id, 'and fields:', fields);
        if (process.env.NODE_ENV !== 'test') {
            // console.warn(`[Feature Flag] ChatGoogleGenerativeAI (node ID: ${id}) is part of a disabled feature. Set ENABLE_GOOGLE_GENERATIVE_AI_CHAT=true to enable.`);
        }
    }

    public setMultiModalOption(multiModalOption: any): void {
        // Method used by ChatGoogleGenerativeAI_enabled.ts
    }

    public setContextCache(contextCache: any): void {
        // Method used by ChatGoogleGenerativeAI_enabled.ts
    }

    // Add any other methods that are called on an instance of ChatGoogleGenerativeAI
    // by ChatGoogleGenerativeAI_enabled.ts or by Flowise core (e.g. via getBaseClasses)
}
