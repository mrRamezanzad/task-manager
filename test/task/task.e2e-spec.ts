import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TaskService } from 'src/task/task.service'; 
import Task from 'src/task/entity/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto'; 
import { User } from 'src/auth/entity/user.entity';
import supertest, { agent as supertestAgent} from 'supertest';
import { AppModule } from 'src/app.module';
import TestAgent from 'supertest/lib/agent';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let taskService: TaskService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;
  let accessToken: string;
  let agent : TestAgent<supertest.Test>
  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    taskService = moduleFixture.get<TaskService>(TaskService);
    taskRepository = moduleFixture.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    // prepare supertest agent to pass credentials
    agent = supertestAgent(app.getHttpServer())

    const { body } = await agent.post('/auth/developer')
    
    accessToken = body.access_token;
    agent.set('Authorization', `Bearer ${accessToken}`)

    user = await userRepository.findOneBy({ email: 'admin' });
  });

  beforeEach(async () => {
    await taskRepository.clear();
  });

  it('should create a task', async () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Test Task',
      description: 'This is a test task',
    };

    const response = await agent.post('/tasks')
      .send(createTaskDto)
      .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('userId');

      const {
        id,
        title,
        description,
        completed,
        createdAt,
        updatedAt,
        userId
      } = response.body;
      expect(id).toEqual(expect.any(String));
      expect(title).toEqual(createTaskDto.title);
      expect(description).toEqual(createTaskDto.description);
      expect(completed).toBeFalsy();
      expect(createdAt).toEqual(expect.any(String));
      expect(updatedAt).toEqual(expect.any(String));
      expect(userId).toEqual(expect.any(String));
  });

  it('should find all tasks', async () => {
    await taskService.create({ title: 'Test Task 1', description: 'Task 1', userId: user.id });
    await taskService.create({ title: 'Test Task 2', description: 'Task 2', userId: user.id });

    const response = await agent.get('/tasks').expect(200);

    expect(response.body.items.length).toEqual(2);
  });

  it('should find all filtered tasks by selected pagination', async () => {
    const tasksLength = 30;
    const page = 1;
    const limit = 10;
    let tasks: Task[] = []

    for (let index = 0; index < tasksLength; index++) {
      tasks.push(
        await taskService.create({ title: 'Test Task ' + index, description: 'Task ' + index, userId: user.id })
      );
    }

    const response = await agent.get('/tasks').expect(200);

    expect(response.body.items).toBeDefined();

    const { items } = response.body;
    expect(items.length).toEqual(limit);

    for (let index = 0; index < limit; index++) {
      const expectedTask = tasks[index];
      const responseTask: Task = items[index];

      expect(responseTask.id).toEqual(expectedTask.id);
      expect(responseTask.title).toEqual(expectedTask.title);
      expect(responseTask.description).toEqual(expectedTask.description);
      expect(responseTask.completed).toEqual(expectedTask.completed);
      expect(responseTask.userId).toEqual(expectedTask.userId);
    }
    
    expect(response.body.meta).toBeDefined();

    const {
      totalItems,
      itemCount,
      itemsPerPage,
      totalPages,
      currentPage
    } = response.body.meta;

    expect(totalItems).toEqual(tasksLength);
    expect(itemCount).toEqual(limit);
    expect(itemsPerPage).toEqual(limit);
    expect(totalPages).toBeGreaterThan(0);
    expect(currentPage).toEqual(page);
  });

  it('should find one filtered task', async () => {
    const tasksLength = 10;
    const page = 1;
    const limit = 10;

    let tasks: Task[] = [];
    for (let index = 0; index < tasksLength; index++) {
      tasks.push(await taskService.create({ title: 'Test Task ' + index, description: 'Task ' + index, userId: user.id }));
    }

    const selectedTaskIndex = 1;
    const selectedTask = tasks[selectedTaskIndex];

    const response = await agent.get(`/tasks?title=${selectedTask.title}`).expect(200);

    // console.debug(response.body)
    expect(response.body.meta).toBeDefined();

    const {
      totalItems,
      itemCount,
      itemsPerPage,
      totalPages,
      currentPage
    } = response.body.meta;

    expect(totalItems).toEqual(1);
    expect(itemCount).toEqual(1);
    expect(itemsPerPage).toEqual(limit);
    expect(totalPages).toBeGreaterThan(0);
    expect(currentPage).toEqual(page);
  });

  it('should find a task by ID', async () => {
    const createdTask = await taskService.create({ title: 'Test Task', description: 'This is a test task', userId: user.id });

    const response = await agent.get(`/tasks/${createdTask.id}`).expect(200);

    expect(response.body).toEqual({
      ...createdTask,
      createdAt: createdTask.createdAt.toISOString(),
      updatedAt: createdTask.updatedAt.toISOString(),
    });
  });

  it('should update a task', async () => {
    const createdTask = await taskService.create({ title: 'Test Task', description: 'This is a test task', userId: user.id });

    const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };

    const response = await agent.patch(`/tasks/${createdTask.id}`).send(updateTaskDto).expect(200);

    expect(response.body.affected).toBeDefined();
    expect(response.body.affected).toBeGreaterThan(0);
  });

  it('should delete a task', async () => {
    const createdTask = await taskService.create({ title: 'Test Task', description: 'This is a test task', userId: user.id });

    const response = await agent.delete(`/tasks/${createdTask.id}`).expect(200);

    expect(response.body.affected).toBeDefined();
    expect(response.body.affected).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.close();
  });
});
