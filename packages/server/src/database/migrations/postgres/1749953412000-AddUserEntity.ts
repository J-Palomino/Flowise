import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserEntity1749953412000 implements MigrationInterface {
    name = 'AddUserEntity1749953412000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create User table
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "name" character varying,
                "isAdmin" boolean NOT NULL DEFAULT false,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `)

        // Add userId column to ChatFlow table
        await queryRunner.query(`
            ALTER TABLE "chat_flow" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to ChatFlow table
        await queryRunner.query(`
            ALTER TABLE "chat_flow" 
            ADD CONSTRAINT "FK_chatflow_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to Credential table
        await queryRunner.query(`
            ALTER TABLE "credential" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to Credential table
        await queryRunner.query(`
            ALTER TABLE "credential" 
            ADD CONSTRAINT "FK_credential_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to Tool table
        await queryRunner.query(`
            ALTER TABLE "tool" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to Tool table
        await queryRunner.query(`
            ALTER TABLE "tool" 
            ADD CONSTRAINT "FK_tool_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to Assistant table
        await queryRunner.query(`
            ALTER TABLE "assistant" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to Assistant table
        await queryRunner.query(`
            ALTER TABLE "assistant" 
            ADD CONSTRAINT "FK_assistant_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to Variable table
        await queryRunner.query(`
            ALTER TABLE "variable" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to Variable table
        await queryRunner.query(`
            ALTER TABLE "variable" 
            ADD CONSTRAINT "FK_variable_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to DocumentStore table
        await queryRunner.query(`
            ALTER TABLE "document_store" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to DocumentStore table
        await queryRunner.query(`
            ALTER TABLE "document_store" 
            ADD CONSTRAINT "FK_documentstore_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to ApiKey table
        await queryRunner.query(`
            ALTER TABLE "api_key" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to ApiKey table
        await queryRunner.query(`
            ALTER TABLE "api_key" 
            ADD CONSTRAINT "FK_apikey_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Add userId column to Trigger table
        await queryRunner.query(`
            ALTER TABLE "trigger" 
            ADD COLUMN "userId" uuid
        `)

        // Add foreign key constraint to Trigger table
        await queryRunner.query(`
            ALTER TABLE "trigger" 
            ADD CONSTRAINT "FK_trigger_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE SET NULL
        `)

        // Create an admin user
        await queryRunner.query(`
            INSERT INTO "user" (id, email, name, "isAdmin")
            VALUES (uuid_generate_v4(), 'admin@example.com', 'Admin User', true)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "chat_flow" DROP CONSTRAINT "FK_chatflow_user"`)
        await queryRunner.query(`ALTER TABLE "credential" DROP CONSTRAINT "FK_credential_user"`)
        await queryRunner.query(`ALTER TABLE "tool" DROP CONSTRAINT "FK_tool_user"`)
        await queryRunner.query(`ALTER TABLE "assistant" DROP CONSTRAINT "FK_assistant_user"`)
        await queryRunner.query(`ALTER TABLE "variable" DROP CONSTRAINT "FK_variable_user"`)
        await queryRunner.query(`ALTER TABLE "document_store" DROP CONSTRAINT "FK_documentstore_user"`)
        await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_apikey_user"`)
        await queryRunner.query(`ALTER TABLE "trigger" DROP CONSTRAINT "FK_trigger_user"`)

        // Remove userId columns
        await queryRunner.query(`ALTER TABLE "chat_flow" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "credential" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "assistant" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "variable" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "document_store" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "userId"`)
        await queryRunner.query(`ALTER TABLE "trigger" DROP COLUMN "userId"`)

        // Drop User table
        await queryRunner.query(`DROP TABLE "user"`)
    }
}