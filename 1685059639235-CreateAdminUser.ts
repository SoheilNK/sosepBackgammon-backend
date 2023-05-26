import { MigrationInterface, QueryRunner } from "typeorm"
import { User } from "./src/entity/User";
import { AppDataSource } from "./src/data-source";
import * as bcrypt from "bcryptjs";

export class CreateAdminUser1685059639235 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userRepository = AppDataSource.getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail({ where: { username: 'admin' } });
        } catch (error) {
            // Hash the password
            const hashedPassword = await bcrypt.hashSync('admin', 8);
            await AppDataSource.manager.save(
                AppDataSource.manager.create(User, {
                    username: "admin",
                    password: hashedPassword,
                    role: "ADMIN"
                })
            )
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
