/// <reference path="contract-global.d.ts" />

export type Map<T> = myra.Map<T>

/**
 * Component types
 */
export interface ComponentSpec<S, A> extends myra.ComponentSpec<S, A> { }
export interface ComponentContext<S> extends myra.ComponentContext<S> { }
export type ComponentFactory<T> = myra.ComponentFactory<T>

export type Effect = myra.Effect
export interface Result<S> extends myra.Result<S> { }
export interface Update<S, A> extends myra.Update<S, A> { }
export interface UpdateAny extends Update<any, any> { }
export type Apply = <S, A>(fn: Update<S, A>, ...args: any[]) => void

/**
 * View types
 */
export interface ViewContext<S> extends myra.ViewContext<S> { }
export interface View<S> extends myra.View<S> { }

export type EventListener<T extends Event, E extends Element> = myra.EventListener<T, E>

export interface DescriptorBase extends myra.DescriptorBase { }
export interface TextDescriptor extends myra.TextDescriptor { }
export interface ElementDescriptor<T extends Element> extends myra.ElementDescriptor<T> { }
export interface ComponentDescriptor<T> extends myra.ComponentDescriptor<T> { }
export interface NothingDescriptor extends myra.NothingDescriptor { }
export type NodeDescriptor = myra.NodeDescriptor

export interface GlobalAttributes<T extends HTMLElement> extends myra.GlobalAttributes<T> { }
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