import { Test } from '@nestjs/testing';
import { AppService } from '@app/sight/app.service';

// Codecov 테스트를 위한 테스트 코드입니다.
describe('AppService', () => {
  let appService: AppService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    appService = module.get(AppService);
  });

  describe('add', () => {
    test('1과 1을 더하면 2가 반환되어야 한다', () => {
      const result = appService.add(1, 1);
      expect(result).toEqual(2);
    });
  });
});
