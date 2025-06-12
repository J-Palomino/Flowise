import React from 'react'
import App from '@/App'
import { store } from '@/store'
import { createRoot } from 'react-dom/client'
import { setupAxiosInterceptors } from '@/utils/axiosSetup'

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
import { AuthProvider } from '@/store/context/AuthContext'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <SnackbarProvider>
                    <ConfirmContextProvider>
                        <ReactFlowContext>
                            <AuthProvider>
                                <App />
                            </AuthProvider>
                        </ReactFlowContext>
                    </ConfirmContextProvider>
                </SnackbarProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
