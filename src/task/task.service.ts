import { Injectable } from '@nestjs/common';
import Task from './entity/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindManyOptions, Repository, UpdateResult } from 'typeorm';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UUID } from 'crypto';
import { UserService } from 'src/auth/user/user.service';
import FilterTaskDto from './dto/filter-task.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly userService: UserService,
  ) { }

  async paginate(options: IPaginationOptions, filters: FindManyOptions<Task>): Promise<Pagination<Task>> {
    return paginate<Task>(this.taskRepository, options, filters);
  }

  async create(rawTask: Partial<Task>): Promise<Task> {
    const user = await this.userService.findOneBy({ id: rawTask.userId });

    const task = this.taskRepository.create({ ...rawTask, user });
    await this.taskRepository.save(task);

    delete task.user;
    return task;
  }

  findAll(query?: FilterTaskDto): Promise<Pagination<Task>> {
    const { page = 1, limit = 10 } = query;
    delete query.page;
    delete query.limit;

    return this.paginate({ page, limit }, { where: { ...query } });
  }

  findById(id: UUID): Promise<Task> {
    return this.taskRepository.findOneBy({ id });
  }

  update(id: UUID, updateTaskDto: UpdateTaskDto): Promise<UpdateResult> {
    return this.taskRepository.update({ id }, updateTaskDto);
  }

  delete(id: UUID): Promise<DeleteResult> {
    return this.taskRepository.delete({ id });
  }
}
