import { Fragment } from 'react'
import ctl from '@netlify/classnames-template-literals'
import { Listbox, Transition } from '@headlessui/react'
import { IconChevronDown } from '@/components/ui/icons/Icons'
import { ServerCategory } from '@/graphql/hooks'
import { getCategoryIcon } from '@/hooks/getCategoryIcon'

const listboxClass = ctl(`
  relative
  w-full
  flex
  items-center
  pl-3
  pr-10
  text-left
  bg-white
  cursor-pointer
  focus:outline-none
  text-sm
  rounded
  border
  h-10
  dark:bg-gray-775
  dark:border-gray-850
  border
  rounded
  focus:outline-none
  transition
  px-4
  text-base
  text-primary
`)

const listboxOptionsClass = ctl(`
  scrollbar-dark
  absolute
  w-full
  py-1
  mt-1
  overflow-auto
  text-sm
  text-primary
  bg-white
  dark:bg-gray-800
  rounded-md
  shadow-lg
  max-h-60
  focus:outline-none
  space-y-0.5
`)

const listboxOptionClass = active =>
  ctl(`
  ${active ? 'dark:bg-gray-775' : ''}
  cursor-pointer
  select-none
  relative
  focus:outline-none
`)

export default function CategorySelect({ category, setCategory }) {
  const categories = Object.values(ServerCategory)
  const CategoryIcon = getCategoryIcon(category)
  return (
    <div className="min-w-full relative z-50">
      <Listbox value={category} onChange={setCategory}>
        {({ open }) => (
          <>
            <div className="relative">
              <Listbox.Button className={listboxClass}>
                {category ? (
                  <>
                    <CategoryIcon className="w-5 h-5 text-secondary" />
                    <span className="block truncate pl-3">{category}</span>
                  </>
                ) : (
                  <span className="block truncate text-tertiary">Category</span>
                )}
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <IconChevronDown
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options static className={listboxOptionsClass}>
                  {categories.map(category => (
                    <Listbox.Option
                      key={category}
                      className={({ active }) => listboxOptionClass(active)}
                      value={category}
                    >
                      {({ selected }) => (
                        <div
                          className={`flex items-center h-10 pl-3 pr-3 ${
                            selected ? 'dark:bg-gray-775' : ''
                          }`}
                        >
                          {(() => {
                            const Icon = getCategoryIcon(category)
                            return <Icon className="w-5 h-5 text-secondary" />
                          })()}
                          <span className={`block truncate pl-2`}>
                            {category}
                          </span>
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}