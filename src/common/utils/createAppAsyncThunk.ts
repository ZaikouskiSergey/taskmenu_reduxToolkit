import {createAsyncThunk} from "@reduxjs/toolkit";
import {AppDispatch, AppRootStateType} from "app/store";

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
    state: AppRootStateType
    rejectValue: null
    dispatch: AppDispatch
}>()