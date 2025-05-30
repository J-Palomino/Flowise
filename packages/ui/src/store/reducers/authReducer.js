import { LOGIN, LOGOUT, UPDATE_CREDITS } from '../actions'

// Initial state
const initialState = {
    isLoggedIn: localStorage.getItem('authToken') ? true : false,
    user: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    credits: localStorage.getItem('userCredits') ? parseInt(localStorage.getItem('userCredits')) : 0,
    plan: localStorage.getItem('userPlan') || 'free'
}

// ==============================|| AUTH REDUCER ||============================== //

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                isLoggedIn: true,
                user: action.payload.user,
                credits: action.payload.credits,
                plan: action.payload.plan
            }
        case LOGOUT:
            // Clear localStorage
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userInfo')
            localStorage.removeItem('userCredits')
            localStorage.removeItem('userPlan')
            
            return {
                ...state,
                isLoggedIn: false,
                user: null,
                credits: 0,
                plan: 'free'
            }
        case UPDATE_CREDITS:
            // Update localStorage
            localStorage.setItem('userCredits', action.payload.credits)
            if (action.payload.plan) {
                localStorage.setItem('userPlan', action.payload.plan)
            }
            
            return {
                ...state,
                credits: action.payload.credits,
                plan: action.payload.plan || state.plan
            }
        default:
            return state
    }
}

export default authReducer