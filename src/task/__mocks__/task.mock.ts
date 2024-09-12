import { randomUUID } from 'crypto';
import Task from '../entity/task.entity';

export function mockTask (rawTask?: Partial<Task>) {
  const task = new Task();
  Object.assign(task, rawTask);
  task.id = randomUUID();
  
  return task;
}