import { Test, TestingModule } from '@nestjs/testing';
import { BookedRoomsService } from './booked_rooms.service';

describe('BookedRoomsService', () => {
  let service: BookedRoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookedRoomsService],
    }).compile();

    service = module.get<BookedRoomsService>(BookedRoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
