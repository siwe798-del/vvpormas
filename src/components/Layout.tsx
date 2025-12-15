import React, { useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    // Prevenir backspace fuera de inputs
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && 
          e.target instanceof HTMLInputElement === false && 
          e.target instanceof HTMLTextAreaElement === false) {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return <>{children}</>
}

export default Layout

