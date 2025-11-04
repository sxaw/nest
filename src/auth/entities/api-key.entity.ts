import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  keyHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date;

  @Column({ default: 0 })
  usageCount: number;

  @Column('text', { array: true, nullable: true })
  permissions: string[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
}
