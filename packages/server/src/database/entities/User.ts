import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    email: string

    @Column({ nullable: true })
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({ default: false })
    isAdmin: boolean

    @Column({ default: true })
    isActive: boolean

    @Column({ nullable: true })
    lastLogin: Date

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
}