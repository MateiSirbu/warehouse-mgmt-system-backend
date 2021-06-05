import { Cascade, Collection, OneToMany } from "@mikro-orm/core";
import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne, wrap, ManyToOne } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { COLine } from "./coline.entity";
import { Customer } from "./customer.entity";

export enum OrderStatus {
    Placed,
    Cancelled,
    Processing,
    Closed
}

@Entity()
export class CustomerOrder {

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @ManyToOne(() => Customer)
    customer!: Customer;

    @OneToMany(() => COLine, coLine => coLine.order, { eager: true, cascade: [Cascade.ALL] })
    lines = new Collection<COLine>(this);

    @Property()
    status!: OrderStatus

    public constructor(init?: Partial<CustomerOrder>) {
        Object.assign(this, init);
    }
}