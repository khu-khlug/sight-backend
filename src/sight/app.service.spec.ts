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

    test('11과 11을 더하면 22가 반환되어야 한다', () => {
      const result = appService.add(11, 11);
      expect(result).toEqual(22);
    });
  });

  // describe('subtract', () => {
  //   test('2에서 1을 빼면 1이 반환되어야 한다', () => {
  //     const result = appService.subtract(2, 1);
  //     expect(result).toEqual(1);
  //   });
  // });
});
