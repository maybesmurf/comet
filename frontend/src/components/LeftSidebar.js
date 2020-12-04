import { FiBell, FiLogIn, FiSearch } from 'react-icons/fi'
import { SiDiscord, SiPatreon, SiGithub, SiTwitter } from 'react-icons/si'
import { CgInfinity } from 'react-icons/cg'
import { BiHomeAlt } from 'react-icons/bi'
import NavLink from './NavLink'
import Logo from '@/components/Logo'
import { usePlanets } from '@/lib/usePlanets'
import Tippy from '@tippyjs/react'
import Image from 'next/image'
import React, { useState } from 'react'
import { Scrollbar } from 'react-scrollbars-custom'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useCurrentUser } from '@/lib/useCurrentUser'
import TelescopeIcon from '@/TelescopeIcon'

const link =
  'cursor-pointer relative text-xs font-medium dark:hover:bg-gray-900 hover:bg-gray-200 px-6 h-10 flex items-center hover:text-blue-500 dark:hover:text-blue-500 text-tertiary transition'

function LeftSidebar({ sidebarOpen, setSidebarOpen }) {
  const currentUser = useCurrentUser().data

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 0.75
            }}
            exit={{
              opacity: 0
            }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={() => setSidebarOpen(false)}
            className={`z-20 fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-gray-900`}
          />
        )}
      </AnimatePresence>
      <nav
        className={`w-nav fixed z-30 flex flex-col overflow-y-auto bg-white dark:bg-gray-800 shadow-lg min-h-full h-full transform transition ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <Scrollbar>
          <div className="mx-5 pt-3 pb-3 mb-2 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center">
            <NavLink href="/" className="ml-1.5 mr-auto">
              <Logo className="w-32 dark:text-gray-200 text-black" />
            </NavLink>
            <NavLink
              href="/notifications"
              className="ml-4 hover:scale-125 transform   text-tertiary rounded-full hover:bg-gray-700 transition w-9 h-9 p-2"
            >
              <FiBell className="w-5 h-5" />
            </NavLink>
          </div>
          <div className="text-gray-500">
            <NavLink href="/" className={`${link} navitem-active`}>
              <BiHomeAlt className="w-5 h-5" />
              <span className="ml-6">Home</span>
            </NavLink>
            <NavLink href="/universe" className={link}>
              <CgInfinity className="w-5 h-5" />
              <span className="ml-6">Universe</span>
            </NavLink>
            <NavLink href="/explore" className={link}>
              <TelescopeIcon className="w-5 h-5" />
              <span className="ml-6">Explore Planets</span>
            </NavLink>
          </div>

          <TopPlanets />
        </Scrollbar>
      </nav>
    </>
  )
}

const colors = [
  'hover:text-red-500 dark:hover:text-red-500',
  'hover:text-amber-500 dark:hover:text-amber-500',
  'hover:text-green-500 dark:hover:text-green-500',
  'hover:text-blue-500 dark:hover:text-blue-500',
  'hover:text-purple-500 dark:hover:text-purple-500',
  'hover:text-pink-500 dark:hover:text-pink-500'
]

const planetClass =
  'cursor-pointer relative text-xs font-medium dark:hover:bg-gray-900 hover:bg-gray-200 px-6 h-8 flex items-center text-gray-600 dark:text-gray-400 transition'

function TopPlanets() {
  const currentUser = useCurrentUser().data

  const { isLoading, isError, data, error } = usePlanets({
    sort: 'TOP',
    pageSize: 50,
    joined: !!currentUser
  })

  if (isLoading || isError) return null

  return (
    <div className="py-3 h-full">
      <div className="mx-5 px-3 border-b dark:border-gray-700 relative mb-3">
        <div className="h-8 absolute left-0 top-0 bottom-0 inline-flex items-center ml-1.5">
          <FiSearch size={16} className="text-disabled" />
        </div>

        <input
          type="text"
          placeholder="Search planets"
          className="w-full h-8 text-xs bg-transparent border-none font-medium focus:ring-0 pl-6 pr-3"
        />
      </div>

      {data.map((planet, index) => (
        <NavLink
          className={`${planetClass} ${colors[index % colors.length]}`}
          key={planet.id}
          href={`/planet/${planet.name}`}
        >
          {planet.avatarURL ? (
            <Image
              width={20}
              height={20}
              src={planet.avatarURL}
              className="w-5 h-5 rounded-full"
              alt={planet.name}
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
          )}

          <span className="ml-3">{planet.name}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default LeftSidebar
