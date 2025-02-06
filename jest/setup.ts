import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isBetween);
