import { Test, TestingModule } from '@nestjs/testing';
import { BookedRoomsController } from './booked_rooms.controller';
import { BookedRoomsService } from './booked_rooms.service';

describe('BookedRoomsController', () => {
  let controller: BookedRoomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookedRoomsController],
      providers: [BookedRoomsService],
    }).compile();

    controller = module.get<BookedRoomsController>(BookedRoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
