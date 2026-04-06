import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeedBackColumn1775482398818 implements MigrationInterface {
    name = 'AddFeedBackColumn1775482398818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ADD "feedback" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "feedback"`);
    }

}
