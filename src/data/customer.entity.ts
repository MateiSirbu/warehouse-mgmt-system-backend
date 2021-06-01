import { Entity, SerializedPrimaryKey, PrimaryKey, OneToOne, ManyToOne, wrap } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { Company } from "./company.entity";
import { User } from "./user.entity";

@Entity()
export class Customer {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @ManyToOne(() => Company)
    company!: Company;

    @OneToOne(() => User, user => user.customer, { eager: true })
    user!: User;

    public constructor(init?: Partial<Customer>) {
        Object.assign(this, init);
    }
}