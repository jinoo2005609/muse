import ora from 'ora';
import {prisma} from '../utils/db.js';

(async () => {
  const spinner = ora('키 값 캐시를 비우는 중...').start();

  await prisma.keyValueCache.deleteMany({});

  spinner.succeed('키 값 캐시가 비워졌습니다.');
})();
