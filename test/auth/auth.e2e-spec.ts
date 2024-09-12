import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User))
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/developer (POST) - should return access token in developer mode', async () => {
    process.env.NODE_ENV = 'develop'; // Set environment variable for the test
    const response = await request(app.getHttpServer())
      .post('/auth/developer')
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('/auth/developer (POST) - should throw UnauthorizedException if not in developer mode', async () => {
    process.env.NODE_ENV = 'production'; // Set environment variable for the test

    const response = await request(app.getHttpServer())
      .post('/auth/developer')
      .expect(401);

    expect(response.body.message).toBe('set developer mode on first.');
  });

  it('/auth/register (POST) - should register a new user', async () => {
    const authDto: AuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    await userRepository.delete({ email: authDto.email });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(authDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(authDto.email);
  });

  it('/auth/register (POST) - should throw UnauthorizedException if email is already registered', async () => {
    const authDto: AuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };


    const user = await userRepository.findOneBy({ email: authDto.email });
    if (!user) {
      await userRepository.insert(authDto);
    }

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(authDto)
      .expect(401);

    expect(response.body.message).toBe('This email is unavailable.');
  });

  it('/auth/login (POST) - should return access token for valid credentials', async () => {
    const authDto: AuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authDto)
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - should throw UnauthorizedException for wrong email', async () => {
    const authDto: AuthDto = {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authDto)
      .expect(401);

    expect(response.body.message).toBe('user not found.');
  });


  it('/auth/login (POST) - should throw UnauthorizedException for wrong password', async () => {
    const authDto: AuthDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authDto)
      .expect(401);

    expect(response.body.message).toBe('Invalid credentials');
  });
});
