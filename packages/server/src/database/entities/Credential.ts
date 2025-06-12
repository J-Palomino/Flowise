/* eslint-disable */
import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { ICredential } from '../../Interface'
import { User } from './User'

@Entity()
export class Credential implements ICredential {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    credentialName: string

    @Column({ type: 'text' })
    encryptedData: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date

    // User relationship
    @ManyToOne(() => User, user => user.credentials, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User

    @Column({ nullable: true })
    userId: string
}
