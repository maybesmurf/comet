import UserFoldersSidebar from '@/pages/me/feed/UserFoldersSidebar'
import Posts from '@/components/post/Posts'
import { useParams } from 'react-router-dom'
import { useStore } from '@/hooks/useStore'
import { useSetHomePage } from '@/hooks/useSetHomePage'
import Page from '@/components/ui/page/Page'
import FolderInfoCard from '@/components/folder/FolderInfoCard'
import FolderHeader from '@/components/folder/FolderHeader'
import { useFolderQuery } from '@/graphql/hooks'

export default function UserFolderPage() {
  const { folderId } = useParams()
  const showFolders = useStore(s => s.showFolders)

  const [{ data }] = useFolderQuery({ variables: { folderId } })
  const folder = data?.getFolder

  useSetHomePage(`folder/${folderId}`)

  return (
    <Page
      rightSidebar={<UserFoldersSidebar show={showFolders} />}
      header={<FolderHeader folder={folder} />}
    >
      <Posts
        showServerName
        folderId={folderId}
        header={<FolderInfoCard folder={folder} />}
      />
    </Page>
  )
}
