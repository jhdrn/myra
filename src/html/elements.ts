import * as c from '../core/contract'
import { element } from './index'

type Element<A extends c.GlobalAttributes> = (attributesOrNode?: A | c.NodeDescriptor[] | c.NodeDescriptor | string, ...children: (c.NodeDescriptor | string)[]) => c.ElementNodeDescriptor

/**
 * Creates an element descriptor
 */
export const el = (tagName: string, attributesOrNode?: c.GlobalAttributes | c.NodeDescriptor[] | c.NodeDescriptor | string, ...children: (c.NodeDescriptor | string)[]): c.ElementNodeDescriptor => 
    element(tagName)(attributesOrNode, ...children)
    
export const a = element('a') as Element<c.AAttributes>
export const attr = element('attr')
export const address = element('address')
export const area = element('area') as Element<c.AreaAttributes>
export const article = element('article')
export const aside = element('aside')
export const audio = element('audio') as Element<c.AudioAttributes>

export const b = element('b')
export const bdi = element('bdi')
export const bdo = element('bdo')
export const blockquote = element('blockquote')
export const br = element('br')
export const button = element('button') as Element<c.ButtonAttributes>

export const canvas = element('canvas') as Element<c.CanvasAttributes>
export const caption = element('caption')
export const cite = element('cite')
export const code = element('code')
export const col = element('col') as Element<c.ColAttributes>
export const colgroup = element('colgroup') as Element<c.ColGroupAttributes>

export const data = element('data')
export const datalist = element('datalist')
export const dd = element('dd')
export const del = element('del') as Element<c.DelAttributes>
export const details = element('details') as Element<c.DetailsAttributes>
export const dfn = element('dfn')
export const div = element('div')
export const dl = element('dl')
export const dt = element('dt')

export const em = element('em')
export const embed = element('embed') as Element<c.EmbedAttributes>

export const fieldset = element('fieldset') as Element<c.FieldsetAttributes>
export const figcaption = element('figcaption')
export const figure = element('figure')
export const footer = element('footer')
export const form = element('form') as Element<c.FormAttributes>

export const h1 = element('h1')
export const h2 = element('h2')
export const h3 = element('h3')
export const h4 = element('h4')
export const h5 = element('h5')
export const h6 = element('h6')
export const header = element('header')
export const hr = element('hr')

export const i = element('i')
export const iframe = element('iframe') as Element<c.IframeAttributes>
export const img = element('img') as Element<c.ImgAttributes>
export const input = element('input') as Element<c.InputAttributes>
export const ins = element('ins') as Element<c.InsAttributes>

export const kbd = element('kbd')

export const label = element('label') as Element<c.LabelAttributes>
export const legend = element('legend')
export const li = element('li') as Element<c.LiAttributes>

export const main = element('main')
export const map = element('map') as Element<c.MapAttributes>
export const mark = element('mark')
export const meter = element('meter') as Element<c.MeterAttributes>

export const nav = element('nav')

export const object = element('object') as Element<c.ObjectAttributes>
export const ol = element('ol')
export const optgroup = element('optgroup') as Element<c.OptgroupAttributes>
export const option = element('option') as Element<c.OptionAttributes>
export const output = element('output')

export const p = element('p')
export const param = element('param') as Element<c.ParamAttributes>
export const pre = element('pre')
export const progress = element('progress') as Element<c.ProgressAttributes>

export const q = element('q') as Element<c.QAttributes>

export const rp = element('rp')
export const rt = element('rt')
export const ruby = element('ruby')

export const s = element('s')
export const samp = element('samp')
export const section = element('section')
export const select = element('select') as Element<c.SelectAttributes>
export const small = element('small')
export const source = element('source') as Element<c.SourceAttributes>
export const span = element('span')
export const strong = element('strong')
export const sub = element('sub')
export const summary = element('summary')
export const sup = element('sup')

export const table = element('table')
export const tbody = element('tbody')
export const td = element('td') as Element<c.TdAttributes>
export const textarea = element('textarea') as Element<c.TextareaAttributes>
export const tfoot = element('tfoot')
export const th = element('th') as Element<c.ThAttributes>
export const thead = element('thead')
export const time = element('time') as Element<c.TimeAttributes>
export const tr = element('tr')
export const track = element('track') as Element<c.TrackAttributes>

export const u = element('u')
export const ul = element('ul')

export const video = element('video') as Element<c.VideoAttributes>

export const wbr = element('wbr')