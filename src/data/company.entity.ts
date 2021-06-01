import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToMany, Collection, Cascade, wrap } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { Customer } from "./customer.entity";

@Entity()
export class Company {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    name!: string;

    @Property()
    address!: string;

    @OneToMany(() => Customer, customer => customer.company, { eager: true, cascade: [Cascade.ALL] })
    representatives = new Collection<Customer>(this);

    public constructor(init?: Partial<Company>) {
        Object.assign(this, init);
    }
}