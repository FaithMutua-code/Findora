import { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthData {
  token?: string | null
  user?: AuthUser | null
}

interface AuthContextType {
  authData: AuthData | null
  setAuthData: (data: AuthData | null) => void
  login: (data: AuthData) => void
  logout: () => void
  isLoading: boolean  
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)  // ← start true

  // Load token from storage on app start
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('authData')
        if (stored) {
          setAuthData(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Failed to load auth:', e)
      } finally {
        setIsLoading(false)  
      }
    }
    loadAuth()
  }, [])

  const login = async (data: AuthData) => {
    setAuthData(data)
    await AsyncStorage.setItem('authData', JSON.stringify(data))
  }

  const logout = async () => {
    setAuthData(null)
    await AsyncStorage.removeItem('authData')
  }

  return (
    <AuthContext.Provider value={{ authData, setAuthData, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}