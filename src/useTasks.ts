import { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface TaskCache {
  lastFetch: number;
  data: Task[];
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache settings
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const cache: TaskCache = {
    lastFetch: 0,
    data: [],
  };

  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || '';

  const fetchTasks = async () => {
    const now = new Date().getTime();

    if (now - cache.lastFetch < CACHE_DURATION && cache.data.length > 0) {
      setTasks(cache.data);
      return; // Return cached data if it is still fresh
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Task[]>(`${API_ENDPOINT}/tasks`);
      setTasks(response.data);
      cache.data = response.data; // Update cache
      cache.lastFetch = now; // Update cache timestamp
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async (task: Task) => {
    setLoading(true);
    setError(null);
    try {
      if (task.id) {
        await axios.put(`${API_ENDPOINT}/tasks/${task.id}`, task);
      } else {
        await axios.post(`${API_ENDPOINT}/tasks`, task);
      }
      cache.lastFetch = 0; // Invalidate cache
      await fetchTasks(); // Refetch tasks to update cache
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_ENDPOINT}/tasks/${taskId}`);
      cache.lastFetch = 0; // Invalidate cache
      await fetchTasks(); // Refetch tasks to update cache
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  function getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message;
    }
    return error?.message || "An unknown error occurred";
  }

  return { tasks, loading, error, fetchTasks, saveTask, deleteTask };
};