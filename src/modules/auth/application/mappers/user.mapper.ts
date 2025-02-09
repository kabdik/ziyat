import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

import { Mapper } from "@/core/domain/mapper.interface";
import { UserEntity } from "@/modules/user/domain/user.entity";

@Injectable()
export class UserMapper implements Mapper<UserEntity, User> {
    toDomain(record: User): UserEntity {
        return new UserEntity({
            id: record.id,
            props: {
                name: record.name,
                email: record.email,
                password: record.password,
            },
        });
    }

    toPersistence(entity: UserEntity): User {
        const props = entity.getProps();

        return {
            id: props.id,
            name: props.name,
            email: props.email,
            password: props.password
        };
    }

    toUi(entity: UserEntity) {
        const props = entity.getProps()
        return {
            id: props.id,
            email: props.email,
            name: props.name
        }
    }
}