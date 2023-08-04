import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {AppRootStateType} from 'app/store'
import {
    FilterValuesType,
    TodolistDomainType,
    todolistsActions,
    todolistsThunk
} from './todolists-reducer'
import {TasksStateType, tasksThunk} from './tasks-reducer'
import {TaskStatuses} from 'api/todolists-api'
import {Grid, Paper} from '@mui/material'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'common/hooks/useAppDispatch';

type PropsType = {
    demo?: boolean
}
export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn)

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        dispatch(todolistsThunk.fetchTodolists(null))
    }, [])

    const removeTask = useCallback(function (id: string, todolistId: string) {
        dispatch(tasksThunk.removeTask({taskId: id, todolistId}))
    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        dispatch(tasksThunk.addTask({title, todolistId}))
    }, [])

    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        dispatch(tasksThunk.updateTask({taskId: id, todolistId, domainModel: {status}}))
    }, [])

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        dispatch(tasksThunk.updateTask({taskId: id, todolistId, domainModel: {title: newTitle}}))
    }, [])

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        dispatch(todolistsActions.changeTodolistFilter({id: todolistId, filter: value}))
    }, [])

    const removeTodolist = useCallback(function (id: string) {
        dispatch(todolistsThunk.removeTodolist({todolistId: id}))
    }, [])

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        dispatch(todolistsThunk.changeTodolistTitle({id, title}))
    }, [])

    const addTodolist = useCallback((title: string) => {
        dispatch(todolistsThunk.addTodolist({title}))
    }, [dispatch])

    if (!isLoggedIn) {
        return <Navigate to={"/login"}/>
    }
    return <>
        <Grid container style={{padding: '20px'}}>
            <AddItemForm addItem={addTodolist}/>
        </Grid>
        <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '10px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })
            }
        </Grid>
    </>
}
