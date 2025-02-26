import { Entity } from "@/core/domain/entity.base";

interface Props {
    name: string;
    description: string;
    country: string;
    rating: number;
}
export class UniversityEntity extends Entity<Props> {
    static create(props: Props) {
        return new UniversityEntity({ props })
    }
}