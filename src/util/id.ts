import { InternalServerErrorException } from '@nestjs/common';

const criteriaDate = new Date('2025-01-01T00:00:00.000Z').getTime() / 100;

export function createId(): number {
  const now = Date.now() / 100;

  if (now < criteriaDate) {
    throw new InternalServerErrorException('Invalid date');
  }

  const timePart = now - criteriaDate;
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return parseInt(`${timePart}${randomPart}`);
}
