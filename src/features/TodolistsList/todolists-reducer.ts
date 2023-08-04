import {TaskStatuses, todolistsAPI, TodolistType} from 'api/todolists-api'
import {AppThunk} from 'app/store';
import {appActions, RequestStatusType} from "app/app-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {handleServerNetworkError} from "common/utils/handleServerNetworkError";
import {createAppAsyncThunk, handleServerAppError} from "common/utils";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: "todolists",
    initialState,
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const todo = state.find(td => td.id === action.payload.id)
            if (todo) todo.filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            const todo = state.find(td => td.id === action.payload.id)
            if (todo) todo.entityStatus = action.payload.entityStatus
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex(td => td.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action)=>{
                const index = state.findIndex(td => td.id === action.payload.id)
                if (index !== -1) state[index].title = action.payload.title
            })
    }
})

// thunks

const fetchTodolists = createAppAsyncThunk<
    { todolists: TodolistType[] }, null
>('todolists/fetchTodolists', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        const res = await todolistsAPI.getTodolists()
        dispatch(appActions.setAppStatus({status: "succeeded"}))
        return {todolists: res.data}
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const removeTodolist = createAppAsyncThunk<{ id: string }, {
    todolistId: string
}>('todolists/removeTodolist', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: "loading"}))
        dispatch(todolistsActions.changeTodolistEntityStatus({id: arg.todolistId, entityStatus: "loading"}))
        const res = await todolistsAPI.deleteTodolist(arg.todolistId)
        if (res.data.resultCode === TaskStatuses.New) {
            dispatch(appActions.setAppStatus({status: "succeeded"}))
            return {id: arg.todolistId}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const addTodolist = createAppAsyncThunk<
    { todolist: TodolistType },
    { title: string }
>('todolists/addTodolist', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: "loading"}))
        const res = await todolistsAPI.createTodolist(arg.title)
        if (res.data.resultCode === TaskStatuses.New) {
            dispatch(appActions.setAppStatus({status: "succeeded"}))
            return {todolist: res.data.data.item}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const changeTodolistTitle = createAppAsyncThunk<{
    id: string,
    title: string
}, {
    id: string,
    title: string
}>('todolists/changeTodolistTitle', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI

    try {
        const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
        if (res.data.resultCode === TaskStatuses.New) {
            dispatch(appActions.setAppStatus({status: "succeeded"}))
            return {id: arg.id, title: arg.title}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

// export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//     return (dispatch) => {
//         todolistsAPI.updateTodolist(id, title)
//             .then((res) => {
//                 dispatch(todolistsActions.changeTodolistTitle({id, title}))
//             })
//     }
// }
export const todolistsActions = slice.actions
export const todolistsReducer = slice.reducer
export const todolistsThunk = {fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle}

// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
