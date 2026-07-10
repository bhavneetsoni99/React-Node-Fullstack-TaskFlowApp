import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { taskTriggerActions } from './taskActions';
import { taskActions } from './taskReducer';
import { api } from '../../api/api';
import type { Task } from '../../types/types';
import { notify } from '../../components/NotificationManager';

interface FetchTasksResponse {
  tasks: Task[];
}

interface TaskResponse {
  task: Task;
}


function* fetchTasksSaga(): Generator {
  try {
    yield put(taskActions.fetchTasksStarted());
    const response = (yield call(api.fetchTasks)) as FetchTasksResponse;
    yield put(taskActions.fetchTasksSuccess({ tasks: response.tasks }));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch tasks';
    yield put(taskActions.fetchTasksFailure({ error: errorMsg }));
    notify.error('Data Load Error', errorMsg);
  }
}

function* createTaskSaga(action: ReturnType<typeof taskTriggerActions.createTaskTrigger>): Generator {
  try {
    yield put(taskActions.createTaskStarted());
    const response = (yield call(api.createTask, action.payload.task)) as TaskResponse;
    yield put(taskActions.createTaskSuccess({ task: response.task }));
    notify.success('Task created successfully!');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create task';
    notify.error('Creation Failed', `We could not save your task: ${errorMsg}`);
  }
}

function* updateTaskSaga(action: ReturnType<typeof taskTriggerActions.updateTaskTrigger>): Generator {
  try {
    const response = (yield call(api.updateTask, action.payload.id, action.payload.updates)) as TaskResponse;
    yield put(taskActions.updateTaskSuccess({ task: response.task }));
    notify.success('Task updated successfully!');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update task';
    notify.error('Could not update task', errorMsg);
  }
}

function* deleteTaskSaga(action: ReturnType<typeof taskTriggerActions.deleteTaskTrigger>): Generator {
  try {
    yield call(api.deleteTask, action.payload.id);
    yield put(taskActions.deleteTaskSuccess({ id: action.payload.id }));
    notify.success('Task deleted');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to delete task';
    notify.error(`Delete failed`, errorMsg);
  }
}

function* bulkUpdateTaskSaga(action: ReturnType<typeof taskTriggerActions.bulkUpdateTrigger>): Generator {
  try {
    const response = (yield call(api.bulkUpdateTasks, action.payload.updates)) as FetchTasksResponse;
    yield put(taskActions.bulkUpdateSuccess({ updates: response.tasks }));
    notify.success('Selected tasks updated');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update task';
    notify.error('Could not update task', errorMsg);
  }
}

function* bulkDeleteSaga(action: ReturnType<typeof taskTriggerActions.bulkDeleteTrigger>): Generator {
  try {
    yield call(api.bulkDeleteTasks, action.payload.ids);
    yield put(taskActions.bulkDeleteSuccess({ ids: action.payload.ids }));
    notify.success('Selected tasks removed');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to bulk delete tasks';
    notify.error('Bulk Deletion Failed', `An error occurred while wiping multiple tasks: ${errorMsg}`);
  }
}

export function* taskSagas(): Generator {
  yield all([
    takeLatest(taskTriggerActions.fetchTasksTrigger.type, fetchTasksSaga),
    takeEvery(taskTriggerActions.createTaskTrigger.type, createTaskSaga),
    takeEvery(taskTriggerActions.updateTaskTrigger.type, updateTaskSaga),
    takeEvery(taskTriggerActions.deleteTaskTrigger.type, deleteTaskSaga),
    takeEvery(taskTriggerActions.bulkDeleteTrigger.type, bulkDeleteSaga),
    takeEvery(taskTriggerActions.bulkUpdateTrigger.type, bulkUpdateTaskSaga),
  ]);
}
