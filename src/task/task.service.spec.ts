import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import Task from './entity/task.entity';
import { UserService } from 'src/auth/user/user.service';
import { Repository } from 'typeorm';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import FilterTaskDto from './dto/filter-task.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { mockTaskRepository } from './__mocks__/task.repository.mock';
import { mockTask } from './__mocks__/task.mock';
import { mockUserService } from 'src/auth/__mocks__/user.service.mock';
import { mockUser } from 'src/auth/__mocks__/user.mock';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a task', async () => {
      const user = mockUser({email: 'test@test.com'})

      const rawTask = { userId: user.id, title: 'Test Task', description: 'Task description', completed: false };

      const createdTask = mockTask(rawTask);

      jest.spyOn(userService, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(taskRepository, 'create').mockReturnValue(createdTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(createdTask);

      const result = await service.create(rawTask);

      expect(userService.findOneBy).toHaveBeenCalledWith({ id: rawTask.userId });
      expect(taskRepository.create).toHaveBeenCalledWith({ ...rawTask, user });
      expect(taskRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result).toEqual(createdTask); 
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const query: FilterTaskDto = { page: 1, limit: 10, title: 'Test' };
      const paginationOptions: IPaginationOptions = { page: 1, limit: 10 };
      const filters = { where: { title: 'Test' } };
      const paginationResult: Pagination<Task> = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
        links: {
          first: '',
          last: '',
          previous: '',
          next: '',
        },
      };

      jest.spyOn(service, 'paginate').mockResolvedValue(paginationResult);

      const result = await service.findAll(query);

      expect(service.paginate).toHaveBeenCalledWith(paginationOptions, filters);
      expect(result).toEqual(paginationResult);
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      const task = mockTask({ title: 'Test Task' });
      
      jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task);
      
      const result = await service.findById(task.id);
      
      expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: task.id });
      expect(result).toEqual(task);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      
      const task  = mockTask();
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const updateResult: UpdateResult = { generatedMaps: [], raw: [], affected: 1 };

      jest.spyOn(taskRepository, 'update').mockResolvedValue(updateResult);

      const result = await service.update(task.id, updateTaskDto);

      expect(taskRepository.update).toHaveBeenCalledWith({ id: task.id }, updateTaskDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const task = mockTask();
      const deleteResult: DeleteResult = { raw: {}, affected: 1 };

      jest.spyOn(taskRepository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.delete(task.id);

      expect(taskRepository.delete).toHaveBeenCalledWith({ id: task.id });
      expect(result).toEqual(deleteResult);
    });
  });
});
