export type PaginatedQueryParams = {
    limit: number;
    page: number;
    offset: number;
    orderBy: OrderBy;
};

export type OrderBy = { field: string | true; param: 'asc' | 'desc' };

export class Paginated<T> {
    readonly count: number;
    readonly limit: number;
    readonly page: number;
    readonly data: readonly T[];

    constructor(props: Paginated<T>) {
        this.count = props.count;
        this.limit = props.limit;
        this.page = props.page;
        this.data = props.data;
    }
}

export interface IRepository<Entity> {
    create(entity: Entity): Promise<Entity>;
    update(entity: Entity): Promise<void>;
    findById(id: string): Promise<Entity | null>;
    findAll(): Promise<Entity[]>;
    findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Entity>>;
    delete(entity: Entity): Promise<boolean>;

    transaction<T>(handler: () => Promise<T>): Promise<T>;
}