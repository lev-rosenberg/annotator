// Create the Redux store
import { configureStore } from '@reduxjs/toolkit';
import annotateSlice from './annotatorSlice';

//fill this out later when i need to add manage stage :)

const store = configureStore({
  reducer: {
    tasks: annotateSlice,
  },
});

export default store;