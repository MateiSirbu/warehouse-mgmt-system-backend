import { Entity, SerializedPrimaryKey, PrimaryKey, OneToOne, ManyToOne, wrap, Collection, OneToMany, Cascade } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { Company } from "./company.entity";
import { CustomerOrder } from "./customerorder.entity";
import { User } from "./user.entity";

@Entity()
export class Customer {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @ManyToOne(() => Company)
    company!: Company;

    @OneToOne({ entity: () => User, mappedBy: user => user.customer, eager: true })
    user!: User;

    @OneToMany(() => CustomerOrder, customerOrder => customerOrder.customer, { eager: true, cascade: [Cascade.ALL] })
    orders = new Collection<CustomerOrder>(this);

    public constructor(init?: Partial<Customer>) {
        Object.assign(this, init);
    }
}