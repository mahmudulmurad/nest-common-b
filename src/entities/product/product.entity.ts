import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { BaseEntity } from '../base/base.entity';

@Entity()
export class Product extends BaseEntity {
  @Column({
    name: 'product_name',
    nullable: false,
  })
  productName: string;

  @Column({
    name: 'category_Id',
    nullable: false,
  })
  categoryId: number;

  @Column({
    name: 'category_name',
    nullable: false,
  })
  categoryName: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'price',
  })
  price: number;

  @Column({
    name: 'status',
    nullable: false,
    default: true,
  })
  status: boolean;

  @Column({
    name: 'product_image',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  productImage: string;

  @ManyToOne(() => User, (user) => user.products)
  user: User;
}
