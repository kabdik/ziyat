import { University } from "@prisma/client";

import { Mapper } from "@/core/domain/mapper.interface";

import { UniversityEntity } from "../domain/university.entity";

export class UniversityMapper implements Mapper<UniversityEntity, University> {
    toPersistence?(entity: UniversityEntity): University {
        const props = entity.getProps()
        return {
            id: props.id,
            name: props.name,
            country: props.country,
            description: props.description,
            rating: props.rating,
            websiteUrl: props.websiteUrl || null,
            createdAt: props.createdAt,
            modifiedAt: props.updatedAt,
        };
    }

    toDomain(record: University): UniversityEntity {
        return new UniversityEntity({
            id: record.id,
            props: {
                name: record.name,
                country: record.country,
                description: record.description,
                rating: record.rating,
                websiteUrl: record.websiteUrl || undefined
            }
        })
    }

    toUi(entity: UniversityEntity) {
        const props = entity.getProps()
        return {
            id: props.id,
            name: props.name,
            description: props.description,
            rating: props.rating,
            country: props.country,
            websiteUrl: props.websiteUrl
        }
    }

}