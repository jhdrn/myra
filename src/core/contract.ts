/// <reference path="contract-global.d.ts" />

export type Map<T> = myra.Map<T>

/**
 * Component types
 */
export interface ComponentArgs<S, A> extends myra.ComponentArgs<S, A> { }
export interface ComponentContext<S> extends myra.ComponentContext<S> { }
export type InitializeComponent = myra.InitializeComponent

/**
 * Update/Dispatch types
 */
export interface Result<S> extends myra.Result<S> { }
export interface Update<S, A> extends myra.Update<S, A> { }
export interface UpdateAny extends Update<any, any> { }
export type Dispatch = <S, A>(fn: Update<S, A>, ...args: any[]) => void
export interface Task extends myra.Task { }

/**
 * View types
 */
export interface View<S> extends myra.View<S> { }

export interface ListenerWithEventOptions extends myra.ListenerWithEventOptions { }
export type ElementEventAttributeArguments = Update<any, any> | Task | ListenerWithEventOptions
export interface NodeDescriptorBase extends myra.NodeDescriptorBase { }
export interface TextNodeDescriptor extends myra.TextNodeDescriptor { }
export interface ElementNodeDescriptor extends myra.ElementNodeDescriptor { }
export interface ComponentNodeDescriptor extends myra.ComponentNodeDescriptor { }
export interface NothingNodeDescriptor extends myra.NothingNodeDescriptor { }
export type NodeDescriptor = TextNodeDescriptor | ElementNodeDescriptor | ComponentNodeDescriptor | NothingNodeDescriptor

export type FormValidator = myra.FormValidator
export type FieldValidator = myra.FieldValidator
export type FormValidationResult = myra.FormValidationResult
export type FieldValidationResult = myra.FieldValidationResult

export interface GlobalAttributes extends myra.GlobalAttributes { }
export interface AAttributes extends myra.AAttributes { }
export interface AreaAttributes extends myra.AreaAttributes { }
export interface AudioAttributes extends myra.AudioAttributes { }
export interface ButtonAttributes extends myra.ButtonAttributes { }
export interface CanvasAttributes extends myra.CanvasAttributes { }
export interface ColAttributes extends myra.ColAttributes { }
export interface ColGroupAttributes extends myra.ColGroupAttributes { }
export interface DelAttributes extends myra.DelAttributes { }
export interface DetailsAttributes extends myra.DetailsAttributes { }
export interface EmbedAttributes extends myra.EmbedAttributes { }
export interface FieldsetAttributes extends myra.FieldsetAttributes { }
export interface FormAttributes extends myra.FormAttributes { }
export interface IframeAttributes extends myra.IframeAttributes { }
export interface ImgAttributes extends myra.ImgAttributes { }
export interface InputAttributes extends myra.InputAttributes { }
export interface InsAttributes extends myra.InsAttributes { }
export interface LabelAttributes extends myra.LabelAttributes { }
export interface LiAttributes extends myra.LiAttributes { }
export interface MapAttributes extends myra.MapAttributes { }
export interface MeterAttributes extends myra.MeterAttributes { }
export interface ObjectAttributes extends myra.ObjectAttributes { }
export interface OptgroupAttributes extends myra.OptgroupAttributes { }
export interface OptionAttributes extends myra.OptionAttributes { }
export interface ParamAttributes extends myra.ParamAttributes { }
export interface ProgressAttributes extends myra.ProgressAttributes { }
export interface QAttributes extends myra.QAttributes { }
export interface SelectAttributes extends myra.SelectAttributes { }
export interface SourceAttributes extends myra.SourceAttributes { }
export interface TdAttributes extends myra.TdAttributes { }
export interface TextareaAttributes extends myra.TextareaAttributes { }
export interface ThAttributes extends myra.ThAttributes { }
export interface TimeAttributes extends myra.TimeAttributes { }
export interface TrackAttributes extends myra.TrackAttributes { }
export interface VideoAttributes extends myra.VideoAttributes { }