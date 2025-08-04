import { Entity, Column, VersionColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class BaseEntity {
  @Column({
    name: 'id',
    nullable: false,
  })
  @PrimaryColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    nullable: true,
  })
  createAt: Date | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date | null;
}
