import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class AddTriggerEntities1738090872626 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Trigger table
        await queryRunner.createTable(
            new Table({
                name: 'trigger',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'name',
                        type: 'varchar'
                    },
                    {
                        name: 'type',
                        type: 'varchar'
                    },
                    {
                        name: 'config',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'tenantId',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'chatflowId',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'createdDate',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedDate',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP'
                    }
                ]
            }),
            true
        )

        // Create TriggerEvent table
        await queryRunner.createTable(
            new Table({
                name: 'trigger_event',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'triggerId',
                        type: 'varchar'
                    },
                    {
                        name: 'payload',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'result',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'error',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'createdDate',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP'
                    }
                ]
            }),
            true
        )

        // Add foreign key from Trigger to ChatFlow
        await queryRunner.createForeignKey(
            'trigger',
            new TableForeignKey({
                columnNames: ['chatflowId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'chat_flow',
                onDelete: 'CASCADE'
            })
        )

        // Add foreign key from TriggerEvent to Trigger
        await queryRunner.createForeignKey(
            'trigger_event',
            new TableForeignKey({
                columnNames: ['triggerId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'trigger',
                onDelete: 'CASCADE'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const triggerEventTable = await queryRunner.getTable('trigger_event')
        const triggerEventForeignKey = triggerEventTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('triggerId') !== -1
        )
        if (triggerEventForeignKey) {
            await queryRunner.dropForeignKey('trigger_event', triggerEventForeignKey)
        }

        const triggerTable = await queryRunner.getTable('trigger')
        const triggerForeignKey = triggerTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('chatflowId') !== -1
        )
        if (triggerForeignKey) {
            await queryRunner.dropForeignKey('trigger', triggerForeignKey)
        }

        // Drop tables
        await queryRunner.dropTable('trigger_event')
        await queryRunner.dropTable('trigger')
    }
}