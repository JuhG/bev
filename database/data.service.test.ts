import { Suggestion } from './data.service'
import { InMemoryDatabase } from './database.service'

const base = 999999999
const week = 60 * 60 * 24 * 7

const DB = {
  lists: [
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
  items: [
    {
      id: 1,
      text: 'vaj',
      list_id: 1,
    },
    {
      id: 2,
      text: 'tojás',
      list_id: 1,
    },
    {
      id: 3,
      text: 'vaj',
      list_id: 2,
    },
    {
      id: 4,
      text: 'sajt',
      list_id: 2,
    },
  ],
}

let suggest: Suggestion

describe('', () => {
  beforeEach(() => {
    const DbService = new InMemoryDatabase(DB)
    suggest = new Suggestion(DbService, base + week + week) // it's exactly one week
  })

  it('shows suggestions', () => {
    expect(suggest.itemTexts()).toStrictEqual(['vaj', 'tojás', 'sajt'])
  })

  it('shows recent suggestions', () => {
    expect(suggest.recent()).toStrictEqual([])
  })
})

describe('', () => {
  beforeEach(() => {
    const DbService = new InMemoryDatabase(DB)
    suggest = new Suggestion(DbService, base + week + week + 1) // now it's over a week
  })

  it('shows suggestions', () => {
    expect(suggest.itemTexts()).toStrictEqual(['vaj', 'tojás', 'sajt'])
  })

  it('shows recent suggestions', () => {
    expect(suggest.recentTexts()).toStrictEqual(['vaj'])
  })
})
