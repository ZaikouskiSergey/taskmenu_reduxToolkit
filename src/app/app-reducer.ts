import {Dispatch} from 'redux'
import {authAPI} from 'api/todolists-api'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {authActions} from "features/Login/auth-reducer";
import {AppThunk} from "app/store";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as string | null,
    isInitialized: false
}
export type AppInitialStateType = typeof initialState

const slice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
            state.error = action.payload.error
        },
        setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
        setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
            state.isInitialized = action.payload.isInitialized
        }
    },
})

export const initializeAppTC = (): AppThunk => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(authActions.setIsLoggedIn({isLoggedIn: true}));
        } else {

        }
        dispatch(appActions.setAppInitialized({isInitialized: true}));
    })
}

export const appActions = slice.actions
export const appReducer = slice.reducer
