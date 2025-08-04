import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { BaseEntity } from '../base/base.entity';

@Entity()
export class Notification extends BaseEntity {
  @Column({
    nullable: false,
  })
  expoAppToken: string;

  @OneToOne(() => User, (user) => user.notification)
  @JoinColumn()
  user: User;
}
