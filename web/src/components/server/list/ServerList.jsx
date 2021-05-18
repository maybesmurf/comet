import { IconExplore, IconHome } from '@/components/ui/icons/Icons'
import ServerAvatar from '@/components/server/ServerAvatar'
import { matchPath, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ServerListItem from '@/components/server/list/ServerListItem'
import { useStore } from '@/hooks/useStore'
import { getOS } from '@/utils/getOS'
import ContextMenuTrigger from '@/components/ui/context/ContextMenuTrigger'
import { ContextMenuType } from '@/types/ContextMenuType'
import { useHasServerPermissions } from '@/hooks/useHasServerPermissions'
import {
  ServerPermission,
  usePublicServersQuery,
  ChannelType
} from '@/graphql/hooks'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import CreateServerButton from '@/components/server/create/CreateServerButton'

export default function ServerList() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const homePage = useStore(s => s.homePage)
  const homeActive = pathname !== '/explore' && !pathname.startsWith('/+')
  const exploreActive = pathname.startsWith('/explore')
  const isMac = getOS() === 'Mac OS' && window.electron
  const [currentUser] = useCurrentUser()

  const { data: publicServersData } = usePublicServersQuery({
    variables: { featured: true }
  })
  const servers = currentUser
    ? currentUser.servers
    : publicServersData?.publicServers ?? []

  return (
    <>
      <div
        className={`flex flex-col items-center min-w-[4.5rem] w-18 bg-white dark:bg-gray-900 overflow-y-auto scrollbar-none`}
      >
        {isMac && <div className="h-5" />}
        <div className="h-full flex flex-col items-center w-full divide-y dark:divide-gray-800 divide-gray-200">
          <div className="space-y-2 flex flex-col items-center py-2">
            <ServerListItem
              name={t('home')}
              to={`${homePage ? `/${homePage}` : '/'}`}
              active={homeActive}
              className={`${
                homeActive
                  ? 'bg-blue-600'
                  : 'dark:bg-gray-800 bg-gray-200 hover:bg-blue-600 dark:hover:bg-blue-600'
              }`}
            >
              <IconHome
                className={`w-5 h-5 group-hover:text-white transition ${
                  homeActive ? 'text-white' : 'text-blue-500'
                }`}
              />
            </ServerListItem>

            <ServerListItem
              name={t('explore.title')}
              to="/explore"
              active={exploreActive}
              className={
                exploreActive
                  ? 'bg-green-600'
                  : 'dark:bg-gray-800 bg-gray-200 hover:bg-green-600 dark:hover:bg-green-600'
              }
            >
              <IconExplore
                className={`w-5 h-5 group-hover:text-white transition ${
                  exploreActive ? 'text-white' : 'text-green-500'
                }`}
              />
            </ServerListItem>

            {!!currentUser && <CreateServerButton />}
          </div>

          {!!servers && servers.length > 0 && (
            <div className="space-y-2 flex flex-col items-center py-2">
              {servers.map(server => (
                <ServerListServer server={server} key={server.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ServerListServer({ server }) {
  const { pathname } = useLocation()
  const matched = matchPath(pathname, { path: '/:server' })
  const serverName = matched?.params?.server?.substring(1)
  const serverPages = useStore(s => s.serverPages)
  const [canViewPrivateChannels] = useHasServerPermissions({
    server,
    permissions: [ServerPermission.PrivateChannels]
  })
  const unread = !!(server.channels ?? [])
    .filter(channel =>
      channel.type === ChannelType.Private ? canViewPrivateChannels : true
    )
    .find(c => c.isUnread)
  const active = serverName === server.name

  return (
    <ContextMenuTrigger
      className="h-12"
      data={{ type: ContextMenuType.Server, server }}
    >
      <ServerListItem
        to={`/+${server.name}${
          serverPages[server.id] ? `/${serverPages[server.id]}` : ''
        }`}
        name={server.displayName}
        active={active}
        unread={unread}
      >
        <ServerAvatar
          server={server}
          size={12}
          className={`bg-gray-200 h-12 w-12 dark:bg-gray-800 group-hover:rounded-2xl transition-all ${
            active ? 'rounded-2xl' : 'rounded-3xl'
          }`}
        />
      </ServerListItem>
    </ContextMenuTrigger>
  )
}