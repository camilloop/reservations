import { Task } from '../schemas';

export type CreateTask = Omit<Task, 'id' | 'status' | 'createdAt'>;
