import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status "up"', () => {
      const result = appController.healthCheck();
      
      expect(result.status).toBeDefined();
      expect(result).toHaveProperty('status');

      const { status } = result
      expect(status).toEqual("up");
    });
  });
});
