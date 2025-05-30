import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class UserCredits {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    userId: string

    @Column({ default: 0 })
    credits: number

    @Column({ nullable: true })
    plan: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
}