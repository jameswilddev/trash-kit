import type * as pug from 'pug'
import ValueStore from './value-store'

export default new ValueStore<pug.compileTemplate>('enginePug')
