export type List = {
  id: number
  ts: number
  store?: string
  max?: number
  open?: number
}

export type Item = {
  id: number
  list_id: number
  text: string
  checked?: boolean
  list?: List
}

export interface DatabaseInterface {
  getLists(): List[]
  addList(): List
  getItemsForList(listId: number): Item[]
  addItem(item: Omit<Item, 'id'>): Item
  removeItem(itemId: number): boolean
  updateItem(item: Partial<Item>): Item
}

abstract class BaseDatabase implements DatabaseInterface {
  abstract get(key: string): any
  abstract set(key: string, value: any): void

  getLists() {
    return this.get('lists')
      .map((list: List) => {
        const items = this.get('items').filter(
          (i: Item) => i.list_id === list.id
        )
        list.max = items.length
        list.open = items.filter((i: Item) => !i.checked).length
        return list
      })
      .sort((a: List, b: List) => {
        if (a.open && b.open) return a.id - b.id
        if (!a.open && !b.open) return a.id - b.id
        if (!a.open) return -1
        return 1
      })
  }

  getId(array: []) {
    if (!array.length) return 1
    return Math.max(...array.map((i: List) => i.id)) + 1
  }

  addList() {
    const lists = this.get('lists')

    const newList = {
      id: this.getId(lists),
      ts: new Date().getTime(),
    }
    this.set('lists', [...lists, newList])

    return newList
  }

  getItemsForList(listId: number) {
    const list = this.getLists().find((list: List) => list.id === listId)

    if (!list) {
      throw new Error('List could not be found')
    }

    return this.get('items')
      .filter((item: Item) => item.list_id === list.id)
      .sort((a: Item, b: Item) => {
        if (a.checked === b.checked) return a.id - b.id
        return a.checked ? -1 : 1
      })
      .map((item: Item) => {
        item.list = list
        return item
      })
  }

  addItem(item: Omit<Item, 'id'>) {
    const items = this.get('items')

    item.text = item.text.trim()

    const newItem = {
      ...item,
      id: this.getId(items),
    }
    items.push(newItem)
    this.set('items', items)

    return newItem
  }

  removeItem(id: number) {
    const items = this.get('items').filter((i: Item) => i.id !== id)
    this.set('items', items)
    return true
  }

  updateItem(item: Partial<Item>) {
    const oldItem = this.get('items').find((i: Item) => i.id === item.id)
    if (!oldItem) {
      throw new Error('Item could not be found')
    }

    const newItem = {
      ...oldItem,
      ...item,
    }
    const items = this.get('items').map((i: Item) => {
      if (i.id === newItem.id) {
        return newItem
      }

      return i
    })
    this.set('items', items)

    return newItem
  }
}

export class InMemoryDatabase extends BaseDatabase {
  constructor(private DB: any) {
    super()
  }

  get(key: string) {
    return this.DB[key]
  }

  set(key: string, value: any) {
    this.DB[key] = value
  }
}

export class LocalStorageDatabase extends BaseDatabase {
  get(key: string) {
    if (typeof localStorage === 'undefined') return []
    const value = localStorage.getItem(key)
    if (!value) return []
    return JSON.parse(value)
  }

  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
