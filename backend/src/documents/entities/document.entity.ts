import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('documents') // This names the table "documents" in SQLite
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ type: 'text' })
  content: string; // We will extract and save the raw text of the file here

  @CreateDateColumn()
  createdAt: Date;
}
