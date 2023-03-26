import type * as types from '../types'
import KeyValueStore from './key-value-store'

export default new KeyValueStore<types.MetadataJson>('gameMetadataJson')
