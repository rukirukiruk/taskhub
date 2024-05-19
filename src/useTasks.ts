import { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface TaskCache {
  lastFetchTimestamp: number;
  tasks: Task[];
}

export const useTaskManagement = () => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const CACHE_LIFESPAN_MS = 5 * 60 * 1000;
  const taskCache: TaskCache = {
    lastFetchTimestamp: 0,
    tasks: [],
  };

  const TASK_API_URL = process.env.REACT_APP_API_ENDPOINT || '';

  const retrieveTasksFromAPI = async () => {
    const currentTime = new Date().getTime();

    if (currentTime - taskCache.lastFetchTimestamp < CACHE_LIFESPAN_MS && taskCache.tasks.length > 0) {
      setTaskList(taskCache.tasks);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get<Task[]>(`${TASK_API_URL}/tasks`);
      setTaskList(response.data);
      taskCache.tasks = response.data;
      taskCache.lastFetchTimestamp = currentTime;
    } catch (error) {
      setFetchError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const persistTaskToAPI = async (task: Task) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      if (task.id) {
        await axios.put(`${TASK_API_URL}/tasks/${task.id}`, task);
      } else {
        await axios.post(`${TASK_API_URL}/tasks`, task);
      }
      taskCache.lastFetchTimestamp = 0;
      await retrieveTasksFromAPI();
    } catch (error) {
      setFetchError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTaskById = async (taskId: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await axios.delete(`${TASK_API_URL}/tasks/${taskId}`);
      taskCache.lastFetchTimestamp = 0;
      await retrieveTasksFromAPI();
    } catch (error) {
      setFetchError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    retrieveTasksFromAPI();
  }, []);

  function extractErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message;
    }
    return error?.message || "An unexpected error occurred";
  }

  return { tasks: taskList, loading: isLoading, error: fetchError, fetchTasks: retrieveTasksFromAPI, saveTask: persistTaskToAPI, deleteTask: deleteTaskById };
};