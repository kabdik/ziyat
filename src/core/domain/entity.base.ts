export type CreateEntityProps<T> = {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    props: T;
};

export interface BaseEntityProps {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

export abstract class Entity<EntityProps> {
    protected id: number;
    protected props: EntityProps;
    protected readonly createdAt: Date;
    protected updatedAt: Date;

    constructor({
        id,
        createdAt,
        updatedAt,
        props,
    }: CreateEntityProps<EntityProps>) {
        const now = new Date();
        this.id = id;
        this.createdAt = createdAt || now;
        this.updatedAt = updatedAt || now;

        this.props = props;
    }

    public getId() {
        return this.id;
    }

    public update(props: Partial<EntityProps>) {
        this.props = {
            ...this.props,
            ...props,
        };
    }

    /**
     * Returns entity properties.
     * @return {*}  {Props & EntityProps}
     * @memberof Entity
     */
    public getProps(): EntityProps & BaseEntityProps {
        const propsCopy = {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            ...this.props,
        };
        return Object.freeze(propsCopy);
    }

    static isEntity(entity: unknown): entity is Entity<unknown> {
        return entity instanceof Entity;
    }

    public equals(object?: Entity<EntityProps>): boolean {
        if (object === null || object === undefined) {
            return false;
        }

        if (this === object) {
            return true;
        }

        if (!Entity.isEntity(object)) {
            return false;
        }

        return this.id === object.id;
    }
}
