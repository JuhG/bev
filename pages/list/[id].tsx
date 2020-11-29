import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { Item, LocalStorageDatabase } from '../../database/database.service'
import { AnimateSharedLayout, motion } from 'framer-motion'
import { Suggestion } from '../../database/data.service'

const DbService = new LocalStorageDatabase()
const lsFetcher = (name: string, ...args: any[]) => DbService[name](...args)
const suggest = new Suggestion(DbService)

const Row = ({ id, text, checked = false, mutate }) => {
  return (
    <motion.li layout className="flex items-center leading-none">
      <input
        id={`row-${id}`}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          DbService.updateItem({
            id,
            checked: e.target.checked,
          })
          mutate()
        }}
      />
      <label
        htmlFor={`row-${id}`}
        className={`py-3 ml-4 flex-1 ${checked ? 'text-gray-300' : ''}`}
      >
        {text}
      </label>
      <button
        onClick={() => {
          DbService.removeItem(id)
          mutate()
        }}
        className="text-red-300 hover:text-red-500 rounded w-5 h-5 bg-gray-200 flex items-center justify-center"
      >
        x
      </button>
    </motion.li>
  )
}

const ListPage = () => {
  const [text, setText] = useState('')
  const router = useRouter()
  const id = router.query.id
  const idNumber = parseInt(String(id), 10)

  const { data, mutate } = useSWR(['getItemsForList', idNumber], lsFetcher)

  return (
    <div>
      <Head>
        <title>Bev</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto max-w-sm p-4">
        <nav className="flex items-baseline justify-between">
          <Link href="/">
            <a className="w-14 p-1">&#xab; back</a>
          </Link>
          <h1 className="text-xl font-medium mb-4">List {id}</h1>
          <p className="w-14"></p>
        </nav>

        <ul className="divide-y divide-pink-500">
          {!data
            ? null
            : data.map((item: Item) => (
                <Row
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  checked={item.checked}
                  mutate={mutate}
                />
              ))}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault()

            DbService.addItem({
              text,
              list_id: idNumber,
            })

            mutate()
            setText('')
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            type="text"
            placeholder="Add new item"
            className="w-full mt-4 px-2 py-1 border-2 border-gray-300 rounded"
          />
        </form>
        <h2 className="text-lg mt-4 pb-1 border-b border-pink-300">
          Suggestions
        </h2>
        <ul>
          {suggest
            .itemTexts()
            .filter((text: string) => !texts.includes(text))
            .map((text: string) => (
              <li key={text} className="my-2">
                <button
                  onClick={() => {
                    DbService.addItem({
                      text: text,
                      list_id: idNumber,
                    })
                    mutate()
                  }}
                  className="p-2"
                >
                  + {text}
                </button>
              </li>
            ))}
        </ul>

        <hr />

        <ul>
          {suggest
            .recentTexts()
            .filter((text: string) => !texts.includes(text))
            .map((text: string) => (
              <li key={text} className="my-2">
                <button
                  onClick={() => {
                    DbService.addItem({
                      text: text,
                      list_id: idNumber,
                    })
                    mutate()
                  }}
                  className="p-2"
                >
                  + {text}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default ListPage
