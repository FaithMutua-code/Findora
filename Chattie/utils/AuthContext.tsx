import { createContext, useState } from 'react'

interface AuthData {
  token?: string | null
}

interface AuthContextType {
  authData: AuthData | null
  setAuthData: (data: AuthData | null) => void
   logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [authData, setAuthData] = useState<AuthData | null>(null)
      const logout = () => {
    setAuthData(null);
  };
    return(
        <AuthContext.Provider value={{authData, setAuthData, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
