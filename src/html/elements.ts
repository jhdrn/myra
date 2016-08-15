import * as c from '../core/contract'
import { element } from './index'


/**
 * Creates an element descriptor
 */
export const el = (tagName: string, attributesOrNode?: c.ElementAttributeMap | c.NodeDescriptor[] | c.NodeDescriptor, ...children: c.NodeDescriptor[]): c.ElementNodeDescriptor => 
    element(tagName)(attributesOrNode, ...children)

/**
 * Non-semantic elements
 */
export const div = element('div')
export const span = element('span')

/**
 * Headings, paragraphs, lists, etc
 */
export const h1 = element('h1')
export const h2 = element('h2')
export const h3 = element('h3')
export const h4 = element('h4')
export const h5 = element('h5')

export const p = element('p')
export const blockquote = element('blockquote')
export const pre = element('pre')

export const ul = element('ul')
export const ol = element('ol')
export const li = element('li')
export const dl = element('dl')
export const dt = element('dt')
export const dd = element('dd')

/**
 * Text content elements
 */
export const a = element('a')
export const em = element('em')
export const strong = element('strong')
export const b = element('b')
export const i = element('i')
export const abbr = element('abbr')
export const acronym = element('acronym')
export const address = element('address')
export const ins = element('ins')
export const mark = element('mark')
export const u = element('u')
export const cite = element('cite')
export const code = element('code')
export const del = element('del')
export const dfn = element('dfn')
export const sub = element('sub')
export const sup = element('sup')
export const small = element('small')
export const samp = element('samp')
export const s = element('s')
export const q = element('q')

/**
 * Structural elements
 */
export const main = element('main')
export const header = element('header')
export const footer = element('footer')
export const nav = element('nav')
export const section = element('section')
export const article = element('article')
export const aside = element('aside')

/**
 * Table elements
 */
export const table = element('table')
export const thead = element('thead')
export const tbody = element('tbody')
export const tfoot = element('tfoot')
export const tr = element('tr')
export const th = element('th')
export const td = element('td')
export const col = element('col')
export const colgroup = element('colgroup')
export const caption = element('caption')

/**
 * Form elements
 */
export const form = element('form')
export const label = element('label')
export const input = element('input')
export const textarea = element('textarea')
export const button = element('button')
export const select = element('select')
export const optgroup = element('optgroup')
export const option = element('option')
export const fieldset = element('fieldset')
export const legend = element('legend')

export const br = element('br')
export const hr = element('hr')

export const canvas = element('canvas')
export const data = element('data')
export const datalist = element('datalist')
export const details = element('details')
export const summary = element('summary')

export const figure = element('figure')
export const figcaption = element('figcaption')
export const img = element('img')