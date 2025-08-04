import { Entity, Column, Unique, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Product } from '../product/product.entity';
import { Notification } from '../notification/notification.entity';
import { BaseEntity } from '../base/base.entity';

@Unique(['username'])
@Entity()
export class User extends BaseEntity {
  @Column({
    name: 'username',
    nullable: false,
  })
  username: string;

  @Column({
    name: 'password',
    nullable: false,
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    name: 'profile_picture',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profilePicture: string;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToOne(() => Notification, (notification) => notification.user)
  notification: Notification;
}
