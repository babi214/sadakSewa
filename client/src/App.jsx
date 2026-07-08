import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              background: '#1F2429',
              color: '#EFF0EC',
              fontSize: '14px',
              borderLeft: '3px solid #2D708C',
            },
            success: {
              iconTheme: { primary: '#207A46', secondary: '#EFF0EC' },
              style: { borderLeftColor: '#207A46' },
            },
            error: {
              iconTheme: { primary: '#C62828', secondary: '#EFF0EC' },
              style: { borderLeftColor: '#C62828' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
