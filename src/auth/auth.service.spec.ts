import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { User } from './entity/user.entity';
import { mockUserService } from './__mocks__/user.service.mock';
import { mockJwtService } from './__mocks__/jwt.service.mock';
import { mockUser } from './__mocks__/user.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const authDto: AuthDto = { email: 'test@example.com', password: 'password' };

      jest.spyOn(userService, 'findOneBy').mockResolvedValue(null); // Email is available
      
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      
      const user = mockUser({
        email: authDto.email,
        password: hashedPassword,
      });
      jest.spyOn(userService,'create').mockResolvedValue(user);

      const result = await authService.register(authDto);

      expect(result).toEqual(user);
      expect(userService.findOneBy).toHaveBeenCalledWith({ email: authDto.email });
      expect(userService.create).toHaveBeenCalledWith({
        email: authDto.email,
        password: hashedPassword,
      });
    });

    it('should throw UnauthorizedException if email is unavailable', async () => {
      const authDto: AuthDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(userService, 'findOneBy').mockResolvedValue({} as User); // Email is not available

      await expect(authService.register(authDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOneBy).toHaveBeenCalledWith({ email: authDto.email });
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const authDto: AuthDto = { email: 'test@test.com', password: 'password' };
      const user: User = mockUser({ email: authDto.email });

      jest.spyOn(userService, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      const result = await authService.login(authDto);

      expect(result).toEqual({ access_token: 'jwtToken' });
      expect(jest.spyOn(userService, 'findOneBy')).toHaveBeenCalledWith({ email: authDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(authDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const authDto: AuthDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(userService, 'findOneBy').mockResolvedValue(null); // User not found

      await expect(authService.login(authDto)).rejects.toThrow(UnauthorizedException);
      expect(jest.spyOn(userService, 'findOneBy')).toHaveBeenCalledWith({ email: authDto.email });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const authDto: AuthDto = { email: 'test@example.com', password: 'password' };
      const user: User = mockUser({ email: authDto.email, password: 'hashedpassowrd' });
      jest.spyOn(userService, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); // Password is incorrect

      await expect(authService.login(authDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOneBy).toHaveBeenCalledWith({ email: authDto.email });
    });
  });

  describe('onModuleInit', () => {
    it('should create a developer user if in developer mode and user does not exist', async () => {
      process.env.NODE_ENV = 'develop';
      const developerUser = mockUser({ email: 'admin', password: 'admin' });
      
      jest.spyOn(userService, 'findOneBy').mockResolvedValue(null); // Developer user does not exist
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      await authService.onModuleInit();

      expect(userService.create).toHaveBeenCalledWith({
        email: developerUser.email,
        password: 'hashedPassword',
      });
    });

    it('should not create a developer user if already exists', async () => {
      process.env.NODE_ENV = 'develop';
      const developerUser = mockUser({ email: 'admin', password: 'admin' });
      
      jest.spyOn(userService, 'findOneBy').mockResolvedValue(developerUser); // Developer user exists

      await authService.onModuleInit();

      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should not create a developer user if not in developer mode', async () => {
      process.env.NODE_ENV = 'production';

      await authService.onModuleInit();

      expect(userService.create).not.toHaveBeenCalled();
    });
  });
});
