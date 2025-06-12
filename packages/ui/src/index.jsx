import React from 'react'
import App from '@/App'
import { store } from '@/store'
import { createRoot } from 'react-dom/client'
import { setupAxiosInterceptors } from '@/utils/axiosSetup'
import { ClerkProvider } from '@clerk/clerk-react'

// style + assets
import '@/assets/scss/style.scss'

// Set up axios interceptors for authentication
setupAxiosInterceptors()

// third party
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import ConfirmContextProvider from '@/store/context/ConfirmContextProvider'
import { ReactFlowContext } from '@/store/context/ReactFlowContext'

// Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    <React.StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <Provider store={store}>
                <BrowserRouter>
                    <SnackbarProvider>
                        <ConfirmContextProvider>
                            <ReactFlowContext>
                                <App />
                            </ReactFlowContext>
                        </ConfirmContextProvider>
                    </SnackbarProvider>
                </BrowserRouter>
            </Provider>
        </ClerkProvider>
    </React.StrictMode>
)
