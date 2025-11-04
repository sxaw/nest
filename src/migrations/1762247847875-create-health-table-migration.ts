import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHealthTableMigration1762247847875 implements MigrationInterface {
    name = 'CreateHealthTableMigration1762247847875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."health_data_points_metric_type_enum" AS ENUM(
                'HEART_RATE',
                'STEPS',
                'SLEEP',
                'WEIGHT',
                'BLOOD_OXYGEN',
                'TEMPERATURE',
                'NUTRITION',
                'EXERCISE',
                'BLOOD_PRESSURE',
                'BLOOD_GLUCOSE',
                'HYDRATION',
                'MINDFULNESS',
                'RESPIRATORY_RATE',
                'BODY_FAT',
                'HEIGHT',
                'DISTANCE',
                'CALORIES',
                'ACTIVE_MINUTES',
                'STRESS_LEVEL'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "health_data_points" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "metric_type" "public"."health_data_points_metric_type_enum" NOT NULL,
                "value_numeric" numeric(10, 4),
                "value_json" jsonb,
                "unit" character varying(50),
                "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "received_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "device_info" jsonb,
                "source_app" character varying(100),
                "user_id" uuid,
                "metadata" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8eace452966921ea74f6310dbda" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb84db5dff65f388cbf2da8c77" ON "health_data_points" ("user_id", "recorded_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8f2ba7f914a68d231d58aea1fe" ON "health_data_points" ("metric_type", "recorded_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8f2ba7f914a68d231d58aea1fe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb84db5dff65f388cbf2da8c77"
        `);
        await queryRunner.query(`
            DROP TABLE "health_data_points"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."health_data_points_metric_type_enum"
        `);
    }

}
