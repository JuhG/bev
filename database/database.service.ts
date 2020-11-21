class Table {
  protected key: string
  constructor(protected service) {}

  all() {
    return this.service.data[this.key]
  }
}
class List extends Table {
  protected key = 'list'
}
class Item extends Table {
  protected key = 'item'
}

export class DatabaseService {
  public List: List
  public Item: Item

  constructor(protected data) {
    this.Item = new Item(this)
    this.List = new List(this)
  }
}
