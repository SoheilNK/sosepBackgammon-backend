import { MigrationInterface, QueryRunner } from "typeorm"
import { User } from "./src/entity/User";
import { AppDataSource } from "./src/data-source";


export class CreateAdminUser1684977083279 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userRepository = AppDataSource.getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail({ where: { username: 'admin' } });
        } catch (error) {
            user = await userRepository.save({
                username: 'admin',
                hashPassword: 'admin',
                firstName: 'admin',
                lastName: 'admin',
                age: 0,
                role: 'ADMIN'
            })
            await userRepository.save(user);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
