import { Entity } from "@/core/domain/entity.base";

interface Props {
    email: string;
    password: string;
    name: string;
}

export class UserEntity extends Entity<Props> {
    static create(props: Props) {
        return new UserEntity({ props })
    }
}  