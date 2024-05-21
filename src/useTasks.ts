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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const CACHE_LIFESPAN_MS = 5 * 60 * 1000; // 5 minutes
  const taskCache: TaskCache = {
    lastFetchTimestamp: 0,
    tasks: [],
  };

  const TASK_API_URL = process.env.REACT_APP_API_ENDPOINT || '';

  const fetchTasks = async () => {
    const currentTime = new Date().getTime();

    if (currentTime - taskCache.lastFetchTimestamp < CACHE_LIFESPAN_MS && taskCache.tasks.length > 0) {
      setTasks(taskCache.tasks);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Task[]>(`${TASK_API_URL}/tasks`);
      setTasks(data);
      taskCache.tasks = data;
      taskCache.lastFetchTimestamp = currentTime;
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrAddTask = async (task: Task) => {
    setIsLoading(true);
    setError(null);
    try {
      const endPoint = task.id ? `${TASK_API_URL}/tasks/${task.id}` : `${TASK_API_URL}/tasks`;
      const method = task.id ? axios.put : axios.post;

      await method(endPoint, task);
      taskCache.lastFetchTimestamp = 0;
      await fetchTasks();
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const removeTaskById = async (taskId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${TASK_API_URL}/tasks/${taskId}`);
      taskCache.lastFetchTimestamp = 0;
      await fetchTasks();
    } catch (error) {
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  function formatErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message;
    }
    return error?.message || "An unexpected error occurred";
  }

  return { tasks, loading: isLoading, error, fetchTasks, saveTask: updateOrAddTask, deleteTask: removeTaskById };
};