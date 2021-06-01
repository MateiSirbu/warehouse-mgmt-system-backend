import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne, OneToMany, Cascade, Collection, wrap, LoadStrategy } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { CartItem } from "./cartitem.entity";
import { Customer } from "./customer.entity";
import { Employee } from "./employee.entity";

@Entity()
export class User {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    firstName!: string;

    @Property()
    lastName!: string;

    @Property()
    email!: string;

    @Property()
    hash!: string;

    @Property()
    salt!: string;

    @OneToOne(() => Customer, customer => customer.user, { owner: true, eager: true })
    customer!: Customer;

    @OneToOne(() => Employee, employee => employee.user, { owner: true, eager: true })
    employee!: Employee;

    @OneToMany(() => CartItem, cartItem => cartItem.user, { eager: true })
    cartItems = new Collection<CartItem>(this);

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}