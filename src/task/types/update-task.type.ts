import { Task } from '../schemas';

export type UpdateTask = Omit<Task, 'id' | 'createdAt'>;
