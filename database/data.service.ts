export class Suggestion {
  private now: number
  constructor(private DB: any, now = 0) {
    this.now = now || new Date().getTime()
  }

  lists() {
    return this.DB.List.all().filter((list) => {
      return this.now - list.ts < 60 * 60 * 24 * 31 * 6 // ~6 months
    })
  }

  items() {
    const listIds = this.lists().map((list) => list.id)

    return this.DB.Item.all()
      .filter((item) => listIds.includes(item.list_id))
      .map((item) => {
        item.list = this.lists().find((list) => list.id === item.list_id)
        return item
      })
  }

  groupedItems() {
    return this.items().reduce((sum, item) => {
      if (!sum.find((current) => current.name === item.name)) {
        sum.push({
          name: item.name,
          entries: [],
        })
      }

      sum.find((current) => current.name === item.name).entries.push(item)
      return sum
    }, [])
  }

  itemNames() {
    return this.groupedItems().map((item) => item.name)
  }

  recent() {
    return this.groupedItems()
      .filter((item) => item.entries.length > 1)
      .filter((item) => {
        const timeStamps = item.entries
          .map((entry) => entry.list.ts)
          .sort((a, b) => a - b)

        const avgs = timeStamps.reduce((avgs, ts, i, array) => {
          if (i < array.length - 1) {
            avgs.push({
              prev: ts,
            })
          }

          if (i > 0) {
            avgs[i - 1] = {
              ...avgs[i - 1],
              next: ts,
              avg: ts - avgs[i - 1].prev,
            }
          }

          return avgs
        }, [])

        const average =
          avgs.reduce((avg, item) => avg + item.avg, 0) / avgs.length
        const age = this.now - timeStamps[timeStamps.length - 1]

        return age > average
      })
  }

  recentNames() {
    return this.recent().map((item) => item.name)
  }
}
