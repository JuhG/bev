import { Suggestion } from './data.service'
import { DatabaseService } from './database.service'

const base = 999999999
const week = 60 * 60 * 24 * 7

const DB = {
  list: [
    {
      id: 1,
      store: 'Spar',
      ts: base,
    },
    {
      id: 2,
      store: 'Penny',
      ts: base + week,
    },
  ],
  item: [
    {
      id: 1,
      name: 'vaj',
      list_id: 1,
    },
    {
      id: 2,
      name: 'tojás',
      list_id: 1,
    },
    {
      id: 3,
      name: 'vaj',
      list_id: 2,
    },
    {
      id: 4,
      name: 'sajt',
      list_id: 2,
    },
  ],
}

let suggest: Suggestion

describe('', () => {
  beforeEach(() => {
    const DbService = new DatabaseService(DB)
    suggest = new Suggestion(DbService, base + week + week) // it's exactly one week
  })

  it('shows suggestions', () => {
    expect(suggest.itemNames()).toStrictEqual(['vaj', 'tojás', 'sajt'])
  })

  it('shows recent suggestions', () => {
    expect(suggest.recent()).toStrictEqual([])
  })
})

describe('', () => {
  beforeEach(() => {
    const DbService = new DatabaseService(DB)
    suggest = new Suggestion(DbService, base + week + week + 1) // now it's over a week
  })

  it('shows suggestions', () => {
    expect(suggest.itemNames()).toStrictEqual(['vaj', 'tojás', 'sajt'])
  })

  it('shows recent suggestions', () => {
    expect(suggest.recentNames()).toStrictEqual(['vaj'])
  })
})
