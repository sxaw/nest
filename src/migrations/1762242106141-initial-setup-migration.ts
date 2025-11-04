import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetupMigration1762242106141 implements MigrationInterface {
    name = 'InitialSetupMigration1762242106141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "api_keys" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "keyHash" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "expiresAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "lastUsedAt" TIMESTAMP WITH TIME ZONE,
                "usageCount" integer NOT NULL DEFAULT '0',
                "permissions" text array,
                "metadata" jsonb,
                CONSTRAINT "UQ_df3b25181df0b4b59bd93f16e10" UNIQUE ("keyHash"),
                CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "api_keys"
        `);
    }

}
