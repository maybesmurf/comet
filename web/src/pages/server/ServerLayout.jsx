import React from 'react'
import ServerSidebar from '@/pages/server/ServerSidebar'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'
import ServerPostsPage from '@/pages/server/ServerPostsPage'
import PlanetPostPage from '@/pages/post/PostPage'
import ChannelPage from '@/pages/channel/ChannelPage'
import PlanetFolderPage from '@/pages/folder/PlanetFolderPage'

export default function ServerLayout() {
  const { serverId } = useParams()

  return (
    <>
      <ServerSidebar />
      <Switch>
        <Route path="/server/:serverId" exact>
          <Redirect to={`/server/${serverId}/posts`} />
        </Route>
        <Route path="/server/:serverId/posts" exact>
          <ServerPostsPage />
        </Route>
        <Route path="/server/:serverId/posts/:postId">
          <PlanetPostPage />
        </Route>
        <Route path="/server/:serverId/channel/:channelId">
          <ChannelPage />
        </Route>
        <Route path="/server/:serverId/folder/:folderId">
          <PlanetFolderPage />
        </Route>
      </Switch>
    </>
  )
}