import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: 'admin' | 'student'
  avatar: string | null
  isVerified: boolean
}

export type ViewType =
  | 'home'
  | 'about'
  | 'courses'
  | 'course-detail'
  | 'faculty'
  | 'gallery'
  | 'reviews'
  | 'contact'
  | 'login'
  | 'register'
  | 'profile'
  | 'student-dashboard'
  | 'student-course'
  | 'admin-dashboard'
  | 'admin-courses'
  | 'admin-course-edit'
  | 'admin-students'
  | 'admin-reviews'
  | 'admin-gallery'
  | 'admin-faculty'
  | 'admin-payments'
  | 'admin-live'
  | 'admin-notifications'
  | 'admin-content'
  | 'admin-slides'
  | 'live-teacher'
  | 'live-student'
  | 'live-classes'
  | 'resource-library'

interface AppState {
  view: ViewType
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  selectedCourseId: string | null
  selectedVideoId: string | null
  selectedLiveSessionId: string | null
  notificationCount: number
  adminTab: string | null
  setView: (view: ViewType) => void
  setUser: (user: User | null, token: string | null) => void
  logout: () => void
  setSelectedCourseId: (id: string | null) => void
  setSelectedVideoId: (id: string | null) => void
  setSelectedLiveSessionId: (id: string | null) => void
  setNotificationCount: (count: number) => void
  initialize: () => Promise<void>
}

async function fetchUser(token: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.user
  } catch {
    return null
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'home',
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      selectedCourseId: null,
      selectedVideoId: null,
      selectedLiveSessionId: null,
      notificationCount: 0,
      adminTab: null,

      setView: (view) => {
        set({ view })
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },

      setUser: (user, token) => {
        const isAdmin = user?.role === 'admin'
        set({
          user,
          token,
          isAuthenticated: !!user,
          isAdmin,
        })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ft_token')
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          notificationCount: 0,
          selectedCourseId: null,
          selectedVideoId: null,
          selectedLiveSessionId: null,
          adminTab: null,
          view: 'home',
        })
      },

      setSelectedCourseId: (id) => set({ selectedCourseId: id }),
      setSelectedVideoId: (id) => set({ selectedVideoId: id }),
      setSelectedLiveSessionId: (id) => set({ selectedLiveSessionId: id }),
      setNotificationCount: (count) => set({ notificationCount: count }),
      setAdminTab: (tab) => set({ adminTab: tab }),

      initialize: async () => {
        const state = get()
        const token = state.token || (typeof window !== 'undefined' ? localStorage.getItem('ft_token') : null)
        if (!token) return

        const user = await fetchUser(token)
        if (user) {
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
          })
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
          })
          if (typeof window !== 'undefined') {
            localStorage.removeItem('ft_token')
          }
        }
      },
    }),
    {
      name: 'future-toppers-store',
      partialize: (state) => ({
        token: state.token,
        selectedLiveSessionId: state.selectedLiveSessionId,
      }),
      skipHydration: true,
    }
  )
)

// Hydrate the store on the client side only (after mount)
if (typeof window !== 'undefined') {
  useAppStore.persist.rehydrate()
}

// ═══════════════════════════════════════════════════════════
// OPTIMIZED SELECTORS — Use these to prevent unnecessary re-renders
// Only subscribe to the specific state slices each component needs
// ═══════════════════════════════════════════════════════════

/** Subscribe only to the current view — used by router components */
export const useView = () => useAppStore(useShallow((s) => s.view))

/** Subscribe to auth state — used by protected components */
export const useAuth = () => useAppStore(useShallow((s) => ({
  isAuthenticated: s.isAuthenticated,
  isAdmin: s.isAdmin,
  user: s.user,
})))

/** Subscribe to current user only */
export const useUser = () => useAppStore(useShallow((s) => s.user))

/** Subscribe to selected course */
export const useSelectedCourse = () => useAppStore(useShallow((s) => s.selectedCourseId))

/** Subscribe to selected video */
export const useSelectedVideo = () => useAppStore(useShallow((s) => s.selectedVideoId))

/** Subscribe to live session */
export const useSelectedLiveSession = () => useAppStore(useShallow((s) => s.selectedLiveSessionId))

/** Subscribe to notification count */
export const useNotificationCount = () => useAppStore(useShallow((s) => s.notificationCount))

/** Subscribe to store actions only (no state re-renders) */
export const useAppActions = () => useAppStore(useShallow((s) => ({
  setView: s.setView,
  setUser: s.setUser,
  logout: s.logout,
  setSelectedCourseId: s.setSelectedCourseId,
  setSelectedVideoId: s.setSelectedVideoId,
  setSelectedLiveSessionId: s.setSelectedLiveSessionId,
  setNotificationCount: s.setNotificationCount,
  initialize: s.initialize,
})))
