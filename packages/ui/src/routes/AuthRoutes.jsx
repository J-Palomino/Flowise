import { lazy } from 'react'

// project imports
import MinimalLayout from '../layout/MinimalLayout'
import Loadable from '../ui-component/loading/Loadable'
import RedirectToLogin from './RedirectToLogin'

// login and register routing
const Login = Loadable(lazy(() => import('../views/auth/Login')))
const Register = Loadable(lazy(() => import('../views/auth/Register')))

// ==============================|| AUTH ROUTING ||============================== //

const AuthRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/',
            element: <RedirectToLogin />
        },
        {
            path: '/login',
            element: <Login />
        },
        {
            path: '/register',
            element: <Register />
        }
    ]
}

export default AuthRoutes