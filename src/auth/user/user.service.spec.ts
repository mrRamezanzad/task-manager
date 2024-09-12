import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { BadRequestException } from '@nestjs/common';
import { mockUser } from '../__mocks__/user.mock';
import { mockUserRepository } from '../__mocks__/user.repository.mock';
import { randomUUID } from 'crypto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createUserDto = { email: 'test@test.com' }; // Example user data
      const user = mockUser({ email: 'test@test.com' }); // Example user data
      const insertResult: InsertResult = {
        identifiers: [{ id: user.id }],
        generatedMaps: [],
        raw: []
     };

      jest.spyOn(userRepository, 'create').mockReturnValue(user);
      jest.spyOn(userRepository, 'insert').mockResolvedValue(insertResult);

      const result = await service.create(createUserDto);

      expect(result).toEqual(user);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.insert).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException if user is not persisted', async () => {
      const createUserDto = { email: 'test@test.com' }; // Example user data
      const user = mockUser(createUserDto);
      const insertResult = { identifiers: [] }; // Simulating failure

      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.insert.mockResolvedValue(insertResult);

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createUserDto)).rejects.toThrow('could not create user.');
    });
  });

  describe('findOneBy', () => {
    it('should return a user if found', async () => {
      const user = mockUser({ email: 'test@test.com' }); // Example user data
      const filters = { id: user.id };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

      const result = await service.findOneBy(filters);

      expect(result).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith(filters);
    });

    it('should return undefined if user is not found', async () => {
      const filters = { id: randomUUID() };

      mockUserRepository.findOneBy.mockResolvedValue(undefined);

      const result = await service.findOneBy(filters);

      expect(result).toBeUndefined();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith(filters);
    });
  });
});