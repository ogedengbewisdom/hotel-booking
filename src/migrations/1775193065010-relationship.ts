import { MigrationInterface, QueryRunner } from "typeorm";

export class Relationship1775193065010 implements MigrationInterface {
    name = 'Relationship1775193065010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hotel" ADD CONSTRAINT "FK_b2c21c02a5a601a0d41d7bfa392" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hotel" DROP CONSTRAINT "FK_b2c21c02a5a601a0d41d7bfa392"`);
    }

}
