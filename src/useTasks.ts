import { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || '';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Task[]>(`${API_ENDPOINT}/tasks`);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  const saveTask = async (task: Task) => {
    setLoading(true);
    try {
      if (task.id) {
        await axios.put(`${API_ENDPOINT}/tasks/${task.id}`, task);
      } else {
        await axios.post(`${API_ENDPOINT}/tasks`, task);
      }
      await fetchTasks();
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    setLoading(true);
    try {
      await axios.delete(`${API_ENDPOINT}/tasks/${taskId}`);
      await fetchTasks();
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, error, fetchTasks, saveTask, deleteTask };
};