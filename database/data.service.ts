import { DatabaseInterface } from './database.service'
import ms from 'ms'

export class Suggestion {
  private now: number
  constructor(private DB: DatabaseInterface, now = 0) {
    this.now = now || new Date().getTime()
  }

  lists() {
    return this.DB.getLists().filter((list) => {
      return this.now - list.ts < ms('12 weeks')
    })
  }

  items() {
    return this.lists()
      .map((list) => this.DB.getItemsForList(list.id))
      .flat()
  }

  groupedItems() {
    return this.items().reduce((sum, item) => {
      if (!sum.find((current) => current.text === item.text)) {
        sum.push({
          text: item.text,
          entries: [],
        })
      }

      sum.find((current) => current.text === item.text).entries.push(item)
      return sum
    }, [])
  }

  itemTexts() {
    return this.groupedItems().map((item) => item.text)
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

  recentTexts() {
    return this.recent().map((item) => item.text)
  }
}
