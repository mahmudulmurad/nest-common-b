import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
import { BaseEntity } from '../base/base.entity';

@Entity()
export class ProductReview extends BaseEntity {
  @Column({
    name: 'content',
    nullable: false,
    type: 'longtext',
  })
  content: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
