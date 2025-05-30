import { BaseMessage, AIMessage, AIMessageChunk, isBaseMessage, ChatMessage, MessageContentComplex } from '@langchain/core/messages'
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import { BaseChatModel, type BaseChatModelParams } from '@langchain/core/language_models/chat_models'
import { ChatGeneration, ChatGenerationChunk, ChatResult } from '@langchain/core/outputs'
import { ToolCallChunk } from '@langchain/core/messages/tool'
import { NewTokenIndices } from '@langchain/core/callbacks/base'
import {
    EnhancedGenerateContentResponse,
    Content,
    Part,
    Tool,
    GenerativeModel,
    GoogleGenerativeAI as GenerativeAI
} from '@google/generative-ai'
import type {
    FunctionCallPart,
    FunctionResponsePart,
    SafetySetting,
    UsageMetadata,
    FunctionDeclarationsTool as GoogleGenerativeAIFunctionDeclarationsTool,
    GenerateContentRequest
} from '@google/generative-ai'
import { ICommonObject, IMultiModalOption, IVisionChatModal } from '../../../src'
import { StructuredToolInterface } from '@langchain/core/tools'
import { isStructuredTool } from '@langchain/core/utils/function_calling'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { BaseLanguageModelCallOptions } from '@langchain/core/language_models/base'
import type GoogleAICacheManager from '../../../nodes/cache/GoogleGenerativeAIContextCache/FlowiseGoogleAICacheManager'

const DEFAULT_IMAGE_MAX_TOKEN = 8192
const DEFAULT_IMAGE_MODEL = 'gemini-1.5-flash-latest'

interface TokenUsage {
    completionTokens?: number
    promptTokens?: number
    totalTokens?: number
}

interface GoogleGenerativeAIChatCallOptions extends BaseLanguageModelCallOptions {
    tools?: StructuredToolInterface[] | GoogleGenerativeAIFunctionDeclarationsTool[]
    /**
     * Whether or not to include usage data, like token counts
     * in the streamed response chunks.
     * @default true
     */
    streamUsage?: boolean
}

export interface GoogleGenerativeAIChatInput extends BaseChatModelParams, Pick<GoogleGenerativeAIChatCallOptions, 'streamUsage'> {
    modelName?: string
    model?: string
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
    stopSequences?: string[]
    safetySettings?: SafetySetting[]
    apiKey?: string
    apiVersion?: string
    baseUrl?: string
    streaming?: boolean
}

class LangchainChatGoogleGenerativeAI
    extends BaseChatModel<GoogleGenerativeAIChatCallOptions, AIMessageChunk>
    implements GoogleGenerativeAIChatInput
{
    modelName = 'gemini-pro'

    temperature?: number

    maxOutputTokens?: number

    topP?: number

    topK?: number

    stopSequences: string[] = []

    safetySettings?: SafetySetting[]

    apiKey?: string

    baseUrl?: string

    streaming = false

    streamUsage = true

    private client!: GenerativeModel // Assert definite assignment

    private contextCache?: GoogleAICacheManager

    get _isMultimodalModel() {
        return this.modelName.includes('vision') || this.modelName.startsWith('gemini-1.5')
    }

    constructor(fields?: GoogleGenerativeAIChatInput) {
        super(fields ?? {})

        this.modelName = fields?.model?.replace(/^models\//, '') ?? fields?.modelName?.replace(/^models\//, '') ?? 'gemini-pro'

        this.maxOutputTokens = fields?.maxOutputTokens ?? this.maxOutputTokens

        if (this.maxOutputTokens && this.maxOutputTokens < 0) {
            throw new Error('`maxOutputTokens` must be a positive integer')
        }

        this.temperature = fields?.temperature ?? this.temperature
        if (this.temperature && (this.temperature < 0 || this.temperature > 1)) {
            throw new Error('`temperature` must be in the range of [0.0,1.0]')
        }

        this.topP = fields?.topP ?? this.topP
        if (this.topP && this.topP < 0) {
            throw new Error('`topP` must be a positive integer')
        }

        if (this.topP && this.topP > 1) {
            throw new Error('`topP` must be below 1.')
        }

        this.topK = fields?.topK ?? this.topK
        if (this.topK && this.topK < 0) {
            throw new Error('`topK` must be a positive integer')
        }

        this.stopSequences = fields?.stopSequences ?? this.stopSequences

        this.apiKey = fields?.apiKey ?? process.env['GOOGLE_API_KEY']
        if (!this.apiKey) {
            throw new Error(
                'Please set an API key for Google GenerativeAI ' +
                    'in the environment variable GOOGLE_API_KEY ' +
                    'or in the `apiKey` field of the ' +
                    'ChatGoogleGenerativeAI constructor'
            )
        }

        this.safetySettings = fields?.safetySettings ?? this.safetySettings
        if (this.safetySettings && this.safetySettings.length > 0) {
            const safetySettingsSet = new Set(this.safetySettings.map((s) => s.category))
            if (safetySettingsSet.size !== this.safetySettings.length) {
                throw new Error('The categories in `safetySettings` array must be unique')
            }
        }

        this.streaming = fields?.streaming ?? this.streaming

        this.streamUsage = fields?.streamUsage ?? this.streamUsage

        this.getClient()
    }

    async getClient(prompt?: Content[], tools?: Tool[]) {
        this.client = new GenerativeAI(this.apiKey ?? '').getGenerativeModel(
            {
                model: this.modelName,
                tools,
                safetySettings: this.safetySettings as SafetySetting[],
                generationConfig: {
                    candidateCount: 1,
                    stopSequences: this.stopSequences,
                    maxOutputTokens: this.maxOutputTokens,
                    temperature: this.temperature,
                    topP: this.topP,
                    topK: this.topK
                }
            },
            {
                baseUrl: this.baseUrl
            }
        )
        if (this.contextCache) {
            const cachedContent = await this.contextCache.lookup({
                contents: prompt ? [{ ...prompt[0], parts: prompt[0].parts.slice(0, 1) }] : [],
                model: this.modelName,
                tools
            })
            this.client.cachedContent = cachedContent as any
        }
    }

    _combineLLMOutput() {
        return []
    }

    _llmType() {
        return 'googlegenerativeai'
    }

    override bindTools(tools: (StructuredToolInterface | Record<string, unknown>)[], kwargs?: Partial<ICommonObject>) {
        //@ts-ignore
        return this.bind({ tools: convertToGeminiTools(tools), ...kwargs })
    }

    invocationParams(options?: this['ParsedCallOptions']): Omit<GenerateContentRequest, 'contents'> {
        const tools = options?.tools as GoogleGenerativeAIFunctionDeclarationsTool[] | StructuredToolInterface[] | undefined
        if (Array.isArray(tools) && !tools.some((t: any) => !('lc_namespace' in t))) {
            return {
                tools: convertToGeminiTools(options?.tools as StructuredToolInterface[]) as any
            }
        }
        return {
            tools: options?.tools as GoogleGenerativeAIFunctionDeclarationsTool[] | undefined
        }
    }

    convertFunctionResponse(prompts: Content[], _unused?: any) {
        // Gemini requires that the parts array must not be empty, so we populate it with a dummy value
        // if the actual function response is empty.
        return prompts.map((item) => {
            if (item.role === 'function') {
                if (item.parts.length === 0) {
                    return {
                        ...item,
                        parts: [{ text: 'This is a dummy response for an empty function call.' }]
                    }
                }
            }
            return item
        })
    }

    setContextCache(contextCache: GoogleAICacheManager): void {
        this.contextCache = contextCache
    }

    async getNumTokens(prompt: BaseMessage[]) {
        const contents = await this._formatMessagesToGoogleContent(prompt)
        const res = await this.client.countTokens({ contents })
        return res.totalTokens
    }

    protected async _generateNonStreaming(
        prompt: Content[],
        options: this['ParsedCallOptions'],
        _runManager?: CallbackManagerForLLMRun
    ): Promise<ChatResult> {
        const request = this.invocationParams(options)
        await this.getClient(prompt, request.tools)
        const res = await this.client.generateContent({
            contents: this.convertFunctionResponse(prompt),
            ...request
        })

        const generationResult = convertResponseToChatResult(res.response, {
            usageMetadata: this.streamUsage ? res.response.usageMetadata : undefined
        })

        if (this.contextCache && res.response.candidates && res.response.candidates.length > 0) {
            await this.contextCache.update({
                prompt: this.convertFunctionResponse(prompt),
                response: res.response.candidates[0],
                model: this.modelName,
                tools: request.tools
            })
        }
        return generationResult
    }

    async _generate(
        messages: BaseMessage[],
        options: this['ParsedCallOptions'],
        runManager?: CallbackManagerForLLMRun
    ): Promise<ChatResult> {
        const prompt = await this._formatMessagesToGoogleContent(messages)
        if (this.streaming) {
            const stream = this._streamResponseChunks(messages, options, runManager)
            let finalChunk: ChatGenerationChunk | undefined
            for await (const chunk of stream) {
                if (finalChunk === undefined) {
                    finalChunk = chunk
                } else {
                    finalChunk = finalChunk.concat(chunk)
                }
            }
            if (finalChunk === undefined) {
                throw new Error('No chunks returned from stream.')
            }
            return {
                generations: finalChunk.message.content ? [finalChunk] : [],
                llmOutput: {
                    estimatedTokenUsage: (finalChunk.message as AIMessageChunk).usage_metadata
                }
            }
        }
        return this._generateNonStreaming(prompt, options, runManager)
    }

    async *_streamResponseChunks(
        messages: BaseMessage[],
        options: this['ParsedCallOptions'],
        runManager?: CallbackManagerForLLMRun
    ): AsyncGenerator<ChatGenerationChunk> {
        const prompt = await this._formatMessagesToGoogleContent(messages)
        const request = this.invocationParams(options)
        await this.getClient(prompt, request.tools)
        const stream = await this.client.generateContentStream({
            contents: this.convertFunctionResponse(prompt),
            ...request
        })

        let usageMetadata: UsageMetadata | undefined
        let index = 0
        for await (const response of stream.stream) {
            if (!response.candidates || response.candidates.length === 0) {
                continue
            }
            if (this.streamUsage && response.usageMetadata) {
                usageMetadata = response.usageMetadata
            }
            const chunk = convertResponseContentToChatGenerationChunk(response, { usageMetadata, index })
            if (!chunk) {
                continue
            }
            index += 1
            yield chunk
            void runManager?.handleLLMNewToken(chunk.text ?? '', undefined, undefined, undefined, undefined, {
                chunk
            })
        }
        if (this.contextCache && stream.stream && stream.response) {
            const finalResponse = await stream.response
            if (finalResponse.candidates && finalResponse.candidates.length > 0) {
                await this.contextCache.update({
                    prompt: this.convertFunctionResponse(prompt),
                    response: finalResponse.candidates[0],
                    model: this.modelName,
                    tools: request.tools
                })
            }
        }
    }

    protected async _formatMessagesToGoogleContent(messages: BaseMessage[]): Promise<Content[]> {
        const { image } = this.multiModalOption
        const allowImageUploads = image && image.allowImageUploads

        const prompt = messages.map(messageToContent)
        if (allowImageUploads && this._isMultimodalModel) {
            for (let i = 0; i < messages.length; i += 1) {
                const message = messages[i]
                if (message.additional_kwargs && message.additional_kwargs.files) {
                    const imageParts: Part[] = []
                    const files = message.additional_kwargs.files as string[]
                    for (const file of files) {
                        const { mimeType, Base64 } = getBase64FromDataUri(file)
                        imageParts.push({ inlineData: { data: Base64, mimeType } })
                    }
                    prompt[i].parts.push(...imageParts);
                }
            }
        }
        return prompt
    }

    public multiModalOption: IMultiModalOption = {}
}

export class ChatGoogleGenerativeAI extends LangchainChatGoogleGenerativeAI implements IVisionChatModal {
    configuredModel: string
    configuredMaxToken?: number
    id: string

    constructor(id: string, fields?: GoogleGenerativeAIChatInput) {
        super(fields)
        this.id = id
        this.configuredModel = fields?.modelName ?? ''
        this.configuredMaxToken = fields?.maxOutputTokens
    }

    revertToOriginalModel(): void {
        this.modelName = this.configuredModel
        this.maxOutputTokens = this.configuredMaxToken
    }

    setMultiModalOption(multiModalOption: IMultiModalOption): void {
        this.multiModalOption = multiModalOption
    }

    setVisionModel(): void {
        if (this.modelName !== DEFAULT_IMAGE_MODEL) {
            this.modelName = DEFAULT_IMAGE_MODEL
            this.maxOutputTokens = DEFAULT_IMAGE_MAX_TOKEN
        }
    }
}

function messageContentMedia(content: MessageContentComplex): Part {
    // When this function is called, 'content.type' is 'image_url'.
    // The 'content' object should conform to a structure like:
    // { type: "image_url"; image_url: string | { url: string; detail?: "auto" | "low" | "high" } }
    // We need to access 'image_url' instead of 'data'.

    // Perform a type assertion to access image_url safely.
    // This assumes MessageContentComplex includes a variant for image_url like described above.
    const imageUrlContent = content as { type: 'image_url'; image_url: string | { url: string } };

    let imageUrlString: string;
    if (typeof imageUrlContent.image_url === 'string') {
        imageUrlString = imageUrlContent.image_url;
    } else if (typeof imageUrlContent.image_url === 'object' && typeof imageUrlContent.image_url.url === 'string') {
        imageUrlString = imageUrlContent.image_url.url;
    } else {
        throw new Error('Invalid image_url format in message content. Expected string or { url: string }.');
    }

    const { mimeType, Base64 } = getBase64FromDataUri(imageUrlString);
    return {
        inlineData: {
            mimeType,
            data: Base64
        }
    };
}

function getMessageAuthor(message: BaseMessage) {
    const type = message._getType()
    if (type === 'human') return 'user'
    if (type === 'ai') return 'model'
    if (type === 'system') return 'user'
    if (type === 'function') return 'function'
    if (type === 'tool') return 'function'
    throw new Error(`Unknown message type: ${type}`)
}

function convertAuthorToRole(author: string) {
    switch (author) {
        case 'user':
        case 'system': // System messages are currently passed as user messages
            return 'user'
        case 'model':
        case 'ai':
            return 'model'
        case 'function':
        case 'tool':
            return 'function'
        default:
            throw new Error(`Unknown author: ${author}`)
    }
}

function messageToContent(message: BaseMessage): Content {
    if (!isBaseMessage(message)) {
        throw new Error('Expected a BaseMessage')
    }
    const author = getMessageAuthor(message)
    const role = convertAuthorToRole(author)
    let parts: Part[] = [] // Initialize parts as an empty array

    if (typeof message.content === 'string') {
        parts.push({ text: message.content })
    } else {
        for (const content of message.content) {
            if (content.type === 'text') {
                parts.push({ text: content.text })
            } else if (content.type === 'image_url') {
                parts.push(messageContentMedia(content))
            } else {
                throw new Error(`Unsupported content type: ${content.type}`)
            }
        }
    }

    if (message._getType() === 'ai') {
        const toolcalls: Array<{ name: string; args: Record<string, any>; id?: string; type?: string }> = (message as any).tool_calls
        if (toolcalls && toolcalls.length > 0) {
            parts = toolcalls.map<FunctionCallPart>((toolcall: { name: string; args: Record<string, any> }) => ({
                functionCall: {
                    name: toolcall.name,
                    args: toolcall.args
                }
            }))
        }
    }

    if (message._getType() === 'tool') {
        const toolFields = message as ChatMessage & { tool_call_id: string }
        parts = [
            {
                functionResponse: {
                    name: toolFields.name ?? toolFields.additional_kwargs.name, // Langchain tool message has name in additional_kwargs
                    response: {
                        name: toolFields.name ?? toolFields.additional_kwargs.name,
                        content: message.content
                    }
                }
            } as FunctionResponsePart
        ]
    }
    return { role, parts }
}

function getBase64FromDataUri(dataUri: string): { mimeType: string; Base64: string } {
    const parts = dataUri.split(',')
    if (parts.length < 2) {
        throw new Error('Invalid data URI')
    }
    const mimeType = parts[0].substring(parts[0].indexOf(':') + 1, parts[0].indexOf(';'))
    const Base64 = parts[1]
    return { mimeType, Base64 }
}

function convertResponseToChatResult(
    response: EnhancedGenerateContentResponse,
    extra: {
        usageMetadata?: UsageMetadata | undefined
    }
): ChatResult {
    if (!response || !response.candidates || response.candidates.length === 0) {
        return {
            generations: [],
            llmOutput: {
                estimatedTokenUsage: response.usageMetadata
            }
        }
    }

    const functionCalls = response.functionCalls()
    const [candidate] = response.candidates
    const { content, ...generationInfo } = candidate
    const text = content?.parts[0]?.text ?? ''

    const generation: ChatGeneration = {
        text,
        message: new AIMessage({
            content: text,
            tool_calls: functionCalls,
            additional_kwargs: {
                ...generationInfo
            },
            usage_metadata: extra?.usageMetadata as any
        }),
        generationInfo
    }

    return {
        generations: [generation]
    }
}

function convertResponseContentToChatGenerationChunk(
    response: EnhancedGenerateContentResponse,
    extra: {
        usageMetadata?: UsageMetadata | undefined
        index: number
    }
): ChatGenerationChunk | null {
    if (!response || !response.candidates || response.candidates.length === 0) {
        return null
    }
    const functionCalls = response.functionCalls()
    const [candidate] = response.candidates
    const { content, ...generationInfo } = candidate
    const text = content?.parts?.[0]?.text ?? ''

    const toolCallChunks: ToolCallChunk[] = []
    if (functionCalls) {
        toolCallChunks.push(
            ...functionCalls.map((fc) => ({
                ...fc,
                args: JSON.stringify(fc.args),
                index: extra.index
            }))
        )
    }
    return new ChatGenerationChunk({
        text,
        message: new AIMessageChunk({
            content: text,
            name: !content ? undefined : content.role,
            tool_call_chunks: toolCallChunks,
            // Each chunk can have unique "generationInfo", and merging strategy is unclear,
            // so leave blank for now.
            additional_kwargs: {},
            usage_metadata: extra.usageMetadata as any
        }),
        generationInfo
    })
}

function zodToGeminiParameters(zodObj: any) {
    // Gemini doesn't accept either the $schema or additionalProperties
    // attributes, so we need to explicitly remove them.
    const jsonSchema: any = zodToJsonSchema(zodObj)
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { $schema, additionalProperties, ...rest } = jsonSchema

    // Ensure all properties have type specified
    if (rest.properties) {
        Object.keys(rest.properties).forEach((key) => {
            const prop = rest.properties[key]

            // Handle enum types
            if (prop.enum?.length) {
                rest.properties[key] = {
                    type: 'string',
                    format: 'enum',
                    enum: prop.enum
                }
            }
            // Handle missing type
            else if (!prop.type && !prop.oneOf && !prop.anyOf && !prop.allOf) {
                // Infer type from other properties
                if (prop.minimum !== undefined || prop.maximum !== undefined) {
                    prop.type = 'number'
                } else if (prop.format === 'date-time') {
                    prop.type = 'string'
                } else if (prop.items) {
                    prop.type = 'array'
                } else if (prop.properties) {
                    prop.type = 'object'
                } else {
                    // Default to string if type can't be inferred
                    prop.type = 'string'
                }
            }
        })
    }

    return rest
}

function convertToGeminiTools(structuredTools: (StructuredToolInterface | Record<string, unknown>)[]) {
    return [
        {
            functionDeclarations: structuredTools.map((structuredTool) => {
                if (isStructuredTool(structuredTool)) {
                    const jsonSchema = zodToGeminiParameters(structuredTool.schema)
                    return {
                        name: structuredTool.name,
                        description: structuredTool.description,
                        parameters: jsonSchema
                    }
                }
                return structuredTool
            })
        }
    ]
}
