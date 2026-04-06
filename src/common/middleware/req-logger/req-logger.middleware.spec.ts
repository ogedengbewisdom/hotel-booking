import { ReqLoggerMiddleware } from './req-logger.middleware';

describe('ReqLoggerMiddleware', () => {
  it('should be defined', () => {
    expect(new ReqLoggerMiddleware()).toBeDefined();
  });
});
