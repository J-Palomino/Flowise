import { DataSource, Repository } from 'typeorm'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { getDataSource } from '../../DataSource'
import { Trigger } from '../../database/entities/Trigger'
import { TriggerEvent } from '../../database/entities/TriggerEvent'
import { ICommonObject } from '../../Interface'
import logger from '../../utils/logger'
import * as cron from 'node-cron'
import { TriggerService } from './TriggerService'

import { EventEmitter } from 'events';

// Base interface for all scheduled tasks we manage
interface IScheduledTaskItem extends EventEmitter {
    stop: () => void;
    start: () => void;
    getStatus?: () => string; // Remains optional
    // now: () => Date; // Removed to allow cron.ScheduledTask compatibility
    _isCustomTask?: true; // Discriminant for our custom tasks
}

// Interface for our custom timeout tasks
interface CustomScheduledTask extends IScheduledTaskItem {
    type: 'timeout'; // Discriminant property for type of custom task
    _isCustomTask: true; // Make this non-optional to identify it
    getStatus: () => string; // Override to be non-optional
}

class TimeoutTask extends EventEmitter implements CustomScheduledTask {
    public readonly _isCustomTask: true = true; // Implement unique discriminant property
    public readonly type = 'timeout' as const;
    private timeoutId: NodeJS.Timeout;
    private triggerId: string;
    private triggerName: string;
    private status: string = 'scheduled';
    // _isCustomTask is initialized above
    constructor(timeoutId: NodeJS.Timeout, triggerId: string, triggerName: string) {
        super();
        this.timeoutId = timeoutId;
        this.triggerId = triggerId;
        this.triggerName = triggerName;
    }
    stop() {
        clearTimeout(this.timeoutId);
        this.status = 'stopped';
    }
    start() {/* no-op for one-time */}
    getStatus() {
        return this.status;
    }
    // Minimal stubs for compatibility
    now() { return new Date(); }
}

export class TriggerSchedulerService {
    private dataSource: DataSource
    private triggerRepository: Repository<Trigger>
    private triggerService: TriggerService
    private cronJobs: Map<string, IScheduledTaskItem> = new Map()
    private isInitialized = false

    constructor() {
        // Don't initialize in constructor - will be called explicitly from server
    }

    async initialize(): Promise<void> {
        try {
            // Wait for DataSource to be initialized
            const dataSource = getDataSource()
            
            // Check if DataSource is initialized
            if (!dataSource.isInitialized) {
                logger.info('DataSource not initialized yet, waiting for initialization...')
                // Wait for DataSource to be initialized
                await new Promise(resolve => setTimeout(resolve, 2000))
                return this.initialize() // Try again
            }
            
            this.dataSource = dataSource
            this.triggerRepository = this.dataSource.getRepository(Trigger)
            this.triggerService = new TriggerService(this.dataSource)
            this.isInitialized = true
            await this.loadActiveTriggers()
            logger.info('Trigger scheduler service initialized')
        } catch (error) {
            logger.error('Error initializing trigger scheduler service:', error)
            // Try again after a delay
            logger.info('Retrying trigger scheduler initialization in 5 seconds...')
            await new Promise(resolve => setTimeout(resolve, 5000))
            return this.initialize()
        }
    }

    async loadActiveTriggers(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize()
            return // initialize() will call loadActiveTriggers() again
        }
        
        try {
            // Verify that the repository is available
            if (!this.triggerRepository) {
                logger.error('Trigger repository is not available')
                return
            }
            
            // Check if the table exists by trying to count records
            try {
                await this.triggerRepository.count()
            } catch (countError) {
                logger.error('Error accessing trigger table:', countError)
                logger.info('Waiting for database migrations to complete...')
                await new Promise(resolve => setTimeout(resolve, 5000))
                return this.loadActiveTriggers()
            }
            
            const activeTriggers = await this.triggerRepository.find({
                where: { isActive: true }
            })
            
            // Clear existing cron jobs
            for (const [, job] of this.cronJobs) {
                job.stop()
            }
            this.cronJobs.clear()
            
            // Schedule active triggers
            for (const trigger of activeTriggers) {
                await this.scheduleTrigger(trigger)
            }
            
            logger.info(`Loaded ${activeTriggers.length} active triggers`)
        } catch (error) {
            logger.error('Error loading active triggers:', error)
            // Wait and try again
            await new Promise(resolve => setTimeout(resolve, 5000))
            return this.loadActiveTriggers()
        }
    }

    async scheduleTrigger(trigger: Trigger) {
        if (!trigger.isActive) return

        try {
            const config = typeof trigger.config === 'string' ? JSON.parse(trigger.config) : trigger.config

            // Handle both 'calendar' and 'schedule' trigger types with the same logic
            if (trigger.type === 'calendar' || trigger.type === 'schedule') {
                // Handle calendar/schedule-based triggers
                if (config.schedule === 'once') {
                    // One-time scheduled event
                    let triggerDate: Date;
                    
                    // Handle different date/time formats
                    if (config.dateTime) {
                        // If dateTime is provided as a single field
                        triggerDate = new Date(config.dateTime);
                    } else if (config.date) {
                        // If date and time are separate fields
                        triggerDate = new Date(config.date);
                        if (config.time) {
                            const [hours, minutes] = config.time.split(':').map(Number);
                            triggerDate.setHours(hours, minutes, 0, 0);
                        }
                    } else {
                        logger.error(`Trigger ${trigger.id} (${trigger.name}) has no valid date configuration`);
                        return;
                    }

                    // If the date is in the past, don't schedule
                    if (triggerDate.getTime() < Date.now()) {
                        logger.warn(`Trigger ${trigger.id} (${trigger.name}) has a past date and won't be scheduled`);
                        return;
                    }

                    // Schedule one-time job
                    const delay = triggerDate.getTime() - Date.now();
                    const timeoutId = setTimeout(() => {
                        this.triggerService.executeTrigger(trigger.id);
                        // Remove from active triggers after execution
                        this.cronJobs.delete(trigger.id);
                    }, delay);

                    // Store the timeout ID as a cron job for consistency
                    logger.info(`Creating timeout task for trigger ${trigger.id} (${trigger.name})`);
                    const taskObject = new TimeoutTask(timeoutId, trigger.id, trigger.name);
                    if (!(taskObject instanceof TimeoutTask)) {
                        logger.error(`[FATAL] Attempted to assign a non-TimeoutTask for one-time trigger ${trigger.id}`);
                        throw new Error('Invalid task object for one-time trigger');
                    }
                    this.cronJobs.set(trigger.id, taskObject);

                    logger.info(`Scheduled one-time trigger ${trigger.id} (${trigger.name}) for ${triggerDate.toISOString()}`);
                } else if (config.schedule === 'recurring') {
                    // Use provided cron expression if available
                    let cronExpression: string;
                    
                    if (config.cronExpression) {
                        cronExpression = config.cronExpression;
                    } else {
                        // Recurring event using cron
                        cronExpression = '* * * * *'; // Default: every minute

                        // Convert repeat pattern to cron expression
                        switch (config.repeat) {
                            case 'hourly':
                                cronExpression = `0 * * * *`; // Every hour at minute 0
                                break;
                            case 'daily':
                                if (config.time) {
                                    const [hours, minutes] = config.time.split(':').map(Number);
                                    cronExpression = `${minutes} ${hours} * * *`; // Every day at specified time
                                } else {
                                    cronExpression = '0 0 * * *'; // Every day at midnight
                                }
                                break;
                            case 'weekly':
                                if (config.dayOfWeek !== undefined) {
                                    if (config.time) {
                                        const [hours, minutes] = config.time.split(':').map(Number);
                                        cronExpression = `${minutes} ${hours} * * ${config.dayOfWeek}`; // Every week on specified day at specified time
                                    } else {
                                        cronExpression = `0 0 * * ${config.dayOfWeek}`; // Every week on specified day at midnight
                                    }
                                } else {
                                    cronExpression = '0 0 * * 1'; // Every Monday at midnight
                                }
                                break;
                            case 'monthly':
                                if (config.dayOfMonth !== undefined) {
                                    if (config.time) {
                                        const [hours, minutes] = config.time.split(':').map(Number);
                                        cronExpression = `${minutes} ${hours} ${config.dayOfMonth} * *`; // Every month on specified day at specified time
                                    } else {
                                        cronExpression = `0 0 ${config.dayOfMonth} * *`; // Every month on specified day at midnight
                                    }
                                } else {
                                    cronExpression = '0 0 1 * *'; // Every 1st of month at midnight
                                }
                                break;
                        }
                    }

                    // Schedule recurring job
                    const job = cron.schedule(cronExpression, () => {
                        this.triggerService.executeTrigger(trigger.id);
                    });

                    if (typeof job !== 'object' || typeof job.stop !== 'function' || typeof job.start !== 'function') {
                        logger.error(`[FATAL] Attempted to assign a non-cron.ScheduledTask for recurring trigger ${trigger.id}`);
                        throw new Error('Invalid cron job object for recurring trigger');
                    }
                    this.cronJobs.set(trigger.id, job);
                    logger.info(`Scheduled recurring trigger ${trigger.id} (${trigger.name}) with cron: ${cronExpression}`);
                }
            } else if (trigger.type === 'webhook' || trigger.type === 'composio') {
                // Webhook and Composio triggers are executed on demand, not scheduled
                logger.info(`Registered ${trigger.type} trigger ${trigger.id} (${trigger.name})`)
            }
        } catch (error) {
            logger.error(`[TOP-LEVEL ERROR] scheduleTrigger failed for trigger ${trigger?.id} (${trigger?.name}):`, error);
            if (error instanceof TypeError) {
                logger.error('[TypeError details]', error.message);
            } else if (error instanceof Error) {
                logger.error('[Error details]', error.stack);
            } else {
                logger.error('[Unknown error type]', error);
            }
        }
    }

    private getTaskType(task: IScheduledTaskItem): 'cron' | 'timeout' {
        if (task._isCustomTask === true) {
            // It's our custom TimeoutTask
            return 'timeout';
        }
        // Otherwise, by elimination (and structural compatibility with IScheduledTaskItem),
        // it should be a cron.ScheduledTask.
        // We rely on cron.ScheduledTask instances also fulfilling the IScheduledTaskItem contract.
        return 'cron';
    }

    public stopAndRemoveJob(triggerId: string): boolean {
        const job = this.cronJobs.get(triggerId);
        if (job) {
            job.stop();
            this.cronJobs.delete(triggerId);
            logger.info(`Stopped and removed job for trigger ${triggerId}`);
            return true;
        }
        logger.warn(`Job for trigger ${triggerId} not found for stopping.`);
        return false;
    }

    public getJobDetails(triggerId: string): { status: string, type: string } | undefined {
        const job = this.cronJobs.get(triggerId);
        if (job) {
            const taskType = this.getTaskType(job);
            let status: string;

            if (taskType === 'timeout') {
                status = (job as CustomScheduledTask).getStatus();
            } else { // taskType === 'cron'
                // cron.ScheduledTask doesn't have a getStatus().
                // If it's in our map, we consider it 'active'.
                status = 'active'; 
            }
            return {
                status: status,
                type: taskType
            };
        }
        return undefined;
    }

    async handleWebhookTrigger(triggerId: string, payload: ICommonObject = {}) {
        try {
            // Get the trigger to check its type
            const trigger = await this.triggerRepository.findOne({
                where: { id: triggerId }
            })
            
            if (!trigger) {
                throw new Error(`Trigger ${triggerId} not found`)
            }
            
            // Log the webhook event
            logger.info(`Received webhook event for trigger ${triggerId} (${trigger.name}) of type ${trigger.type}`)
            
            // Execute the trigger regardless of type (webhook or composio)
            return await this.triggerService.executeTrigger(triggerId, payload)
        } catch (error) {
            logger.error(`Error handling webhook trigger ${triggerId}:`, error)
            throw error
        }
    }

    async refreshTrigger(triggerId: string) {
        try {
            const trigger = await this.triggerRepository.findOne({
                where: { id: triggerId }
            })

            if (!trigger) {
                throw new Error(`Trigger ${triggerId} not found`)
            }

            // Stop existing job if any
            const existingJob = this.cronJobs.get(triggerId)
            if (existingJob) {
                existingJob.stop()
                this.cronJobs.delete(triggerId)
            }

            // Schedule if active
            if (trigger.isActive) {
                await this.scheduleTrigger(trigger)
            }

            logger.info(`Trigger ${triggerId} refreshed`)
        } catch (error) {
            logger.error(`Error refreshing trigger ${triggerId}:`, error)
            throw error
        }
    }
}

// Singleton instance
export const triggerSchedulerService = new TriggerSchedulerService()