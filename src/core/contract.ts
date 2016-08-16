/// <reference path="contract-global.d.ts" />

/**
 * Component types
 */
export interface ComponentArgs<M, A> extends myra.core.contract.ComponentArgs<M, A> {}
export interface Component extends myra.core.contract.Component {}
export interface ComponentInstance<T> extends myra.core.contract.ComponentInstance<T> {}
export interface ComponentContext<M, T> extends myra.core.contract.ComponentContext<M, T> {}

/**
 * Update/Dispatch types
 */
export interface Update<M, A> extends myra.core.contract.Update<M, A> {}
export interface UpdateAny extends Update<any, any> { }
export type Dispatch = <M, A>(fn: Update<M, A>, ...args: any[]) => void
export interface Task extends myra.core.contract.Task {}

/**
 * View types
 */
export interface View<M> extends myra.core.contract.View<M> {}

export interface ListenerWithEventOptions extends myra.core.contract.ListenerWithEventOptions {}
export type ElementEventAttributeArguments = Update<any, any> | Task | ListenerWithEventOptions
export interface NodeDescriptorBase extends myra.core.contract.NodeDescriptorBase {}
export interface TextNodeDescriptor extends myra.core.contract.TextNodeDescriptor {}
export interface ElementNodeDescriptor extends myra.core.contract.ElementNodeDescriptor {}
export interface ComponentNodeDescriptor extends myra.core.contract.ComponentNodeDescriptor {}
export interface NothingNodeDescriptor extends myra.core.contract.NothingNodeDescriptor {}
export type NodeDescriptor = TextNodeDescriptor | ElementNodeDescriptor | ComponentNodeDescriptor | NothingNodeDescriptor
export interface GlobalAttributes extends myra.core.contract.GlobalAttributes {}
export interface AAttributes extends myra.core.contract.AAttributes {}