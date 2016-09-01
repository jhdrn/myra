/// <reference path="contract-global.d.ts" />

export type Map<T> = myra.core.contract.Map<T>

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

export type FormValidator = myra.core.contract.FormValidator
export type FieldValidator = myra.core.contract.FieldValidator
export type FormValidationResult = myra.core.contract.FormValidationResult
export type FieldValidationResult = myra.core.contract.FieldValidationResult

export interface GlobalAttributes extends myra.core.contract.GlobalAttributes {}
export interface AAttributes extends myra.core.contract.AAttributes {}
export interface AreaAttributes extends myra.core.contract.AreaAttributes {}
export interface AudioAttributes extends myra.core.contract.AudioAttributes {}
export interface ButtonAttributes extends myra.core.contract.ButtonAttributes {}
export interface CanvasAttributes extends myra.core.contract.CanvasAttributes {}
export interface ColAttributes extends myra.core.contract.ColAttributes {}
export interface ColGroupAttributes extends myra.core.contract.ColGroupAttributes {}
export interface DelAttributes extends myra.core.contract.DelAttributes {}
export interface DetailsAttributes extends myra.core.contract.DetailsAttributes {}
export interface EmbedAttributes extends myra.core.contract.EmbedAttributes {}
export interface FieldsetAttributes extends myra.core.contract.FieldsetAttributes {}
export interface FormAttributes extends myra.core.contract.FormAttributes {}
export interface IframeAttributes extends myra.core.contract.IframeAttributes {}
export interface ImgAttributes extends myra.core.contract.ImgAttributes {}
export interface InputAttributes extends myra.core.contract.InputAttributes {}
export interface InsAttributes extends myra.core.contract.InsAttributes {}
export interface LabelAttributes extends myra.core.contract.LabelAttributes {}
export interface LiAttributes extends myra.core.contract.LiAttributes {}
export interface MapAttributes extends myra.core.contract.MapAttributes {}
export interface MeterAttributes extends myra.core.contract.MeterAttributes {}
export interface ObjectAttributes extends myra.core.contract.ObjectAttributes {}
export interface OptgroupAttributes extends myra.core.contract.OptgroupAttributes {}
export interface OptionAttributes extends myra.core.contract.OptionAttributes {}
export interface ParamAttributes extends myra.core.contract.ParamAttributes {}
export interface ProgressAttributes extends myra.core.contract.ProgressAttributes {}
export interface QAttributes extends myra.core.contract.QAttributes {}
export interface SelectAttributes extends myra.core.contract.SelectAttributes {}
export interface SourceAttributes extends myra.core.contract.SourceAttributes {}
export interface TdAttributes extends myra.core.contract.TdAttributes {}
export interface TextareaAttributes extends myra.core.contract.TextareaAttributes {}
export interface ThAttributes extends myra.core.contract.ThAttributes {}
export interface TimeAttributes extends myra.core.contract.TimeAttributes {}
export interface TrackAttributes extends myra.core.contract.TrackAttributes {}
export interface VideoAttributes extends myra.core.contract.VideoAttributes {}