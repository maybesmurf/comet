import create from 'zustand'

export const useStore = create((set, get) => ({
  friendsPage: 'Online',
  setFriendsPage: friendsPage => set({ friendsPage }),
  inboxPage: 'Unread',
  setInboxPage: inboxPage => set({ inboxPage }),
  postsSort: 'Hot',
  setPostsSort: postsSort => set({ postsSort }),
  postsTime: 'Day',
  setPostsTime: postsTime => set({ postsTime }),
  commentsSort: 'Top',
  setCommentsSort: commentsSort => set({ commentsSort }),
  liveMode: false,
  setLiveMode: liveMode => set({ liveMode }),

  // Right Sidebar Toggles
  showFolders: true,
  setShowFolders: showFolders => set({ showFolders }),
  showUsers: true,
  setShowUsers: showUsers => set({ showUsers }),

  serverPages: {},
  setServerPage: (serverId, page) =>
    set({ serverPages: { ...get().serverPages, [serverId]: page } }),
  homePage: null,
  setHomePage: page => set({ homePage: page }),

  replyingCommentId: null,
  setReplyingCommentId: commentId => set({ replyingCommentId: commentId }),

  canGoBack: false,
  setCanGoBack: canGoBack => set({ canGoBack }),

  exploreSort: 'Top',
  setExploreSort: exploreSort => set({ exploreSort }),
  exploreCategory: null,
  setExploreCategory: exploreCategory => set({ exploreCategory }),

  dialogUserId: null,
  setDialogUserId: userId =>
    set({ dialogUserId: userId, userDialogOpen: !!userId }),
  userDialogOpen: false,
  setUserDialogOpen: open => set({ userDialogOpen: open }),

  folderSort: 'Added',
  setFolderSort: sort => set({ folderSort: sort }),

  updateAvailable: false,
  setUpdateAvailable: updateAvailable => set({ updateAvailable }),

  loginDialog: false,
  setLoginDialog: open => set({ loginDialog: open }),

  createAccount: false,
  setCreateAccount: createAccount => set({ createAccount })
}))