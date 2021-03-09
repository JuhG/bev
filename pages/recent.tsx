import { useEffect } from 'react'
import { LocalStorageDatabase } from '../database/database.service'

const DbService = new LocalStorageDatabase()

const Recent = () => {
  useEffect(() => {
    const openLists = DbService.getLists().filter((list) => list.open > 0)
    openLists.sort((a, b) => (a.id < b.id ? 1 : -1))
    window.location.assign(`/list/${openLists[0].id}`)
  })

  return null
}

export default Recent
