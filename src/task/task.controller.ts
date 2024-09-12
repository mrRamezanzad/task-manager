import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import Task from './entity/task.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User as UserEntity } from 'src/auth/entity/user.entity';
import { UUID } from 'crypto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiTags('Tasks')
@ApiSecurity('bearer')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() createTaskDto :CreateTaskDto, @User() user: UserEntity): Promise<Task> {
    return this.taskService.create({ ...createTaskDto, userId: user.id });
  }

  @Get(':id')
  findOne(@Param('id') id: UUID): Promise<Task> {
    return this.taskService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: UUID,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<UpdateResult> {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: UUID): Promise<DeleteResult> {
    return this.taskService.delete(id);
  }
}
