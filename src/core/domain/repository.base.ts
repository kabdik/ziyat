import { Entity as EntityBase } from './entity.base';
import {
    Paginated,
    PaginatedQueryParams,
    IRepository,
} from './repository.interface';

interface IDBService {
    $transaction<T>(handler: () => Promise<T>): Promise<T>;
}

export abstract class RepositoryBase<Entity extends EntityBase<unknown>>
    implements IRepository<Entity> {
    protected constructor(protected readonly db: IDBService) { }

    abstract create(entity: Entity): Promise<Entity>;

    abstract update(entity: Entity): Promise<void>;

    abstract delete(entity: Entity): Promise<boolean>;

    abstract findById(id: string): Promise<Entity | null>;

    abstract findAll(): Promise<Entity[]>;

    abstract findAllPaginated(
        params: PaginatedQueryParams,
    ): Promise<Paginated<Entity>>;

    async transaction<T>(handler: () => Promise<T>): Promise<T> {
        return this.db.$transaction(handler);
    }
}
