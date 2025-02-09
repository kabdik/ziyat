import { Entity } from './entity.base';

export interface Mapper<DomainEntity extends Entity<any>, DbRecord, UI = any> {
    toPersistence?(entity: DomainEntity): DbRecord;
    toDomain(record: DbRecord): DomainEntity;
    toUi(entity: DomainEntity, params?: unknown): UI;
}
