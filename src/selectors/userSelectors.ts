import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual } from 'react-redux';
import { RootState, UsersState, User, ID, } from '../types/types';

const selectUsersState: (state: RootState) => UsersState = (state: RootState) => state.users;

export const selectUsers: (state: RootState) => User[] = (state: RootState) => selectUsersState(state).users;

const memoizeOptions = {
    resultEqualityCheck: shallowEqual,
};

export const selectUsersSet = createSelector(
    [selectUsers],
    (users: User[]) => users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<ID, User>),
    { memoizeOptions }
);
