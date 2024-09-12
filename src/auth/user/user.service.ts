import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    const insertResult = await this.userRepository.insert(user);

    const insertedAnyDocument = insertResult.identifiers.length > 0;
    
    if (insertedAnyDocument) {
      const userIndentifier = insertResult.identifiers[0]
      const isUserPersisted = userIndentifier.id === user.id;

      if(isUserPersisted) {
        return user
      }
    }

    throw new BadRequestException('could not create user.')
  }

  async findOneBy(filters: Partial<User>): Promise<User> {
    return this.userRepository.findOneBy(filters);
  }
}
