import { createContext, useState } from 'react'

interface AuthData {
  token?: string | null
}

interface AuthContextType {
  authData: AuthData | null
  setAuthData: (data: AuthData | null) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [authData, setAuthData] = useState<AuthData | null>(null)
    return(
        <AuthContext.Provider value={{authData, setAuthData}}>
            {children}
        </AuthContext.Provider>
    )
}
