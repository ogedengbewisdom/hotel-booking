import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TransformParamsPipe implements PipeTransform {
  transform(value: string) {
    if (!value) return null;

    const val = parseInt(value, 10);

    if (isNaN(val)) throw new BadRequestException('Invalid parameter');

    return val;
  }
}
