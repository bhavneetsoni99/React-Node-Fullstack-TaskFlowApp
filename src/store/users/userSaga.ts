import { call, put, takeLatest } from 'redux-saga/effects';
import { userTriggerActions } from './userActions';
import { userActions } from './userReducer';
import { api } from '../../api/api';
import type { User } from '../../types/types';

interface FetchUsersResponse {
  users: User[];
}

function* fetchUsersSaga(): Generator {
  try {
    yield put(userActions.fetchUsersStarted());
    const response = (yield call(api.fetchUsers)) as FetchUsersResponse;
    yield put(userActions.fetchUsersSuccess({ users: response.users }));
  } catch (error) {
    yield put(userActions.fetchUsersFailure());
  }
}

export function* userSagas(): Generator {
  yield takeLatest(userTriggerActions.fetchUsersTrigger.type, fetchUsersSaga);
}
