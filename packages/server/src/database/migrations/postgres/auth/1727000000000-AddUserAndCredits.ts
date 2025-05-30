import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class AddUserAndCredits1727000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create User table
        await queryRunner.createTable(
            new Table({
                name: 'user',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true
                    },
                    {
                        name: 'firstName',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'lastName',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'isAdmin',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'lastLogin',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'createdDate',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedDate',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Create UserCredits table
        await queryRunner.createTable(
            new Table({
                name: 'user_credits',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'userId',
                        type: 'uuid'
                    },
                    {
                        name: 'credits',
                        type: 'int',
                        default: 0
                    },
                    {
                        name: 'plan',
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: 'createdDate',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedDate',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        )

        // Add foreign key
        await queryRunner.createForeignKey(
            'user_credits',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'user',
                onDelete: 'CASCADE'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const userCreditsTable = await queryRunner.getTable('user_credits')
        const foreignKey = userCreditsTable?.foreignKeys.find((fk) => fk.columnNames.indexOf('userId') !== -1)
        if (foreignKey) {
            await queryRunner.dropForeignKey('user_credits', foreignKey)
        }

        // Drop tables
        await queryRunner.dropTable('user_credits')
        await queryRunner.dropTable('user')
    }
}