/// <reference path="contract-global.d.ts" />

export type Map<T> = myra.Map<T>

/**
 * Component types
 */
export type ComponentSpec<TState, TProps> = myra.ComponentSpec<TState, TProps>
export interface ComponentFactory<TState, TProps> extends myra.ComponentFactory<TState, TProps> { }

/**
 * View types
 */
export interface View<TState, TProps> extends myra.View<TState, TProps> { }

export type UpdateState<TState> = myra.UpdateState<TState>
export type Evolve<TState> = myra.Evolve<TState>

export type EventListener<T extends Event, E extends Element> = myra.EventListener<T, E>

export interface VNodeBase extends myra.VNodeBase { }
export interface TextVNode extends myra.TextVNode { }
export interface ElementVNode<T extends Element> extends myra.ElementVNode<T> { }
export interface ComponentVNode<TState, TProps> extends myra.ComponentVNode<TState, TProps> { }
export interface NothingVNode extends myra.NothingVNode { }
export type VNode = myra.VNode

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