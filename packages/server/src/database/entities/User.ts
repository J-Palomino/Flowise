/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { ChatFlow } from './ChatFlow'
import { Credential } from './Credential'
import { Tool } from './Tool'
import { Assistant } from './Assistant'
import { Variable } from './Variable'
import { DocumentStore } from './DocumentStore'
import { ApiKey } from './ApiKey'
import { Trigger } from './Trigger'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    email: string

    @Column({ nullable: true })
    name: string

    @Column({ default: false })
    isAdmin: boolean

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Column({ type: 'timestamp' })
    @UpdateDateColumn()
    updatedDate: Date

    // Relationships
    @OneToMany(() => ChatFlow, chatflow => chatflow.user)
    chatflows: ChatFlow[]

    @OneToMany(() => Credential, credential => credential.user)
    credentials: Credential[]

    @OneToMany(() => Tool, tool => tool.user)
    tools: Tool[]

    @OneToMany(() => Assistant, assistant => assistant.user)
    assistants: Assistant[]

    @OneToMany(() => Variable, variable => variable.user)
    variables: Variable[]

    @OneToMany(() => DocumentStore, documentStore => documentStore.user)
    documentStores: DocumentStore[]

    @OneToMany(() => ApiKey, apiKey => apiKey.user)
    apiKeys: ApiKey[]

    @OneToMany(() => Trigger, trigger => trigger.user)
    triggers: Trigger[]
}