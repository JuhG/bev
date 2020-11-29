import Link from 'next/link'
import useSWR from 'swr'
import { List, LocalStorageDatabase } from '../database/database.service'
import { useRouter } from 'next/router'

const DbService = new LocalStorageDatabase()

const Row = ({ id, ts, open = 0, max = 0 }) => {
  return (
    <li className="flex items-center leading-none">
      <Link href={'/list/' + id}>
        <a
          className={`py-4 ml-4 flex-1 flex justify-between ${
            open ? '' : 'text-gray-300'
          }`}
        >
          <span>
            List {id} ({open}/{max})
          </span>
          <span>{new Date(ts).toLocaleDateString('hu')}</span>
        </a>
      </Link>
    </li>
  )
}

const Home = () => {
  const lsFetcher = (name: string, ...args: any[]) => DbService[name](...args)

  const router = useRouter()
  const { data } = useSWR(['getLists'], lsFetcher)

  return (
    <div className="mx-auto max-w-sm p-4">
      <nav className="flex items-baseline justify-center">
        <h1 className="text-xl font-medium mb-4">Lists</h1>
      </nav>

      <ul className="divide-y divide-pink-500">
        {!data
          ? null
          : data
              .filter((list: List) => list.open > 0)
              .map((list: List) => <Row key={list.id} {...list} />)}
      </ul>

      <button
        onClick={(e) => {
          e.preventDefault()
          const list = DbService.addList()
          router.push('/list/' + list.id)
        }}
        className="w-full rounded my-4 p-1 bg-pink-100 border-2 border-pink-300"
      >
        Add new list
      </button>

      <ul className="divide-y divide-pink-500">
        {!data
          ? null
          : data
              .filter((list: List) => list.open === 0)
              .map((list: List) => <Row key={list.id} {...list} />)}
      </ul>
    </div>
  )
}

export default Home
