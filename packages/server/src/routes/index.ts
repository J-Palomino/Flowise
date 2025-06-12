import express from 'express'
import apikeyRouter from './apikey'
import assistantsRouter from './assistants'
import attachmentsRouter from './attachments'
import authRouter from './auth'
import chatMessageRouter from './chat-messages'
import chatflowsRouter from './chatflows'
import chatflowsStreamingRouter from './chatflows-streaming'
import chatflowsUploadsRouter from './chatflows-uploads'
import componentsCredentialsRouter from './components-credentials'
import componentsCredentialsIconRouter from './components-credentials-icon'
import credentialsRouter from './credentials'
import documentStoreRouter from './documentstore'
import exportImportRouter from './export-import'
import feedbackRouter from './feedback'
import fetchLinksRouter from './fetch-links'
import flowConfigRouter from './flow-config'
import getUploadFileRouter from './get-upload-file'
import getUploadPathRouter from './get-upload-path'
import internalChatmessagesRouter from './internal-chat-messages'
import internalPredictionRouter from './internal-predictions'
import leadsRouter from './leads'
import loadPromptRouter from './load-prompts'
import marketplacesRouter from './marketplaces'
import nodeConfigRouter from './node-configs'
import nodeCustomFunctionRouter from './node-custom-functions'
import nodeIconRouter from './node-icons'
import nodeLoadMethodRouter from './node-load-methods'
import nodesRouter from './nodes'
import openaiAssistantsRouter from './openai-assistants'
import openaiAssistantsFileRouter from './openai-assistants-files'
import openaiAssistantsVectorStoreRouter from './openai-assistants-vector-store'
import openaiRealtimeRouter from './openai-realtime'
import pingRouter from './ping'
import predictionRouter from './predictions'
import promptListsRouter from './prompts-lists'
import publicChatbotRouter from './public-chatbots'
import publicChatflowsRouter from './public-chatflows'
import publicExecutionsRouter from './public-executions'
import statsRouter from './stats'
import toolsRouter from './tools'
import triggerRouter from './trigger.route'
import upsertHistoryRouter from './upsert-history'
import variablesRouter from './variables'
import vectorRouter from './vectors'
import verifyRouter from './verify'
import versionRouter from './versions'
import nvidiaNimRouter from './nvidia-nim'
import executionsRouter from './executions'
import validationRouter from './validation'
import agentflowv2GeneratorRouter from './agentflowv2-generator'
import { authenticate } from '../middleware/authMiddleware'

const router = express.Router()

router.use('/ping', pingRouter)
router.use('/auth', authRouter)
router.use('/apikey', authenticate, apikeyRouter)
router.use('/assistants', authenticate, assistantsRouter)
router.use('/attachments', authenticate, attachmentsRouter)
router.use('/chatflows', authenticate, chatflowsRouter)
router.use('/chatflows-streaming', authenticate, chatflowsStreamingRouter)
router.use('/chatmessage', authenticate, chatMessageRouter)
router.use('/components-credentials', authenticate, componentsCredentialsRouter)
router.use('/components-credentials-icon', authenticate, componentsCredentialsIconRouter)
router.use('/chatflows-uploads', authenticate, chatflowsUploadsRouter)
router.use('/credentials', authenticate, credentialsRouter)
router.use('/document-store', authenticate, documentStoreRouter)
router.use('/export-import', authenticate, exportImportRouter)
router.use('/feedback', authenticate, feedbackRouter)
router.use('/fetch-links', authenticate, fetchLinksRouter)
router.use('/flow-config', authenticate, flowConfigRouter)
router.use('/internal-chatmessage', authenticate, internalChatmessagesRouter)
router.use('/internal-prediction', authenticate, internalPredictionRouter)
router.use('/get-upload-file', authenticate, getUploadFileRouter)
router.use('/get-upload-path', authenticate, getUploadPathRouter)
router.use('/leads', authenticate, leadsRouter)
router.use('/load-prompt', authenticate, loadPromptRouter)
router.use('/marketplaces', authenticate, marketplacesRouter)
router.use('/node-config', authenticate, nodeConfigRouter)
router.use('/node-custom-function', authenticate, nodeCustomFunctionRouter)
router.use('/node-icon', authenticate, nodeIconRouter)
router.use('/node-load-method', authenticate, nodeLoadMethodRouter)
router.use('/nodes', authenticate, nodesRouter)
router.use('/openai-assistants', authenticate, openaiAssistantsRouter)
router.use('/openai-assistants-file', authenticate, openaiAssistantsFileRouter)
router.use('/openai-assistants-vector-store', authenticate, openaiAssistantsVectorStoreRouter)
router.use('/openai-realtime', authenticate, openaiRealtimeRouter)
router.use('/prediction', authenticate, predictionRouter)
router.use('/prompts-list', authenticate, promptListsRouter)
router.use('/public-chatbotConfig', publicChatbotRouter) // Public routes don't need authentication
router.use('/public-chatflows', publicChatflowsRouter) // Public routes don't need authentication
router.use('/public-executions', publicExecutionsRouter) // Public routes don't need authentication
router.use('/stats', authenticate, statsRouter)
router.use('/tools', authenticate, toolsRouter)
router.use('/triggers', authenticate, triggerRouter)
router.use('/variables', authenticate, variablesRouter)
router.use('/vector', authenticate, vectorRouter)
router.use('/verify', verifyRouter) // Verify route doesn't need authentication
router.use('/version', versionRouter) // Version route doesn't need authentication
router.use('/upsert-history', authenticate, upsertHistoryRouter)
router.use('/nvidia-nim', authenticate, nvidiaNimRouter)
router.use('/executions', authenticate, executionsRouter)
router.use('/validation', authenticate, validationRouter)
router.use('/agentflowv2-generator', authenticate, agentflowv2GeneratorRouter)

export default router
