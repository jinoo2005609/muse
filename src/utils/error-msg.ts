export default (error?: string | Error): string => {
  let str = '알 수 없는 오류';

  if (error) {
    if (typeof error === 'string') {
      str = `🚫 : ${error}`;
    } else if (error instanceof Error) {
      str = `🚫 : ${error.message}`;
    }
  }

  return str;
};
