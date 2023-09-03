(() => {
  const testNow = new Date(2023, 0, 1, 0, 0, 0, 0);

  jest.useFakeTimers();
  jest.setSystemTime(testNow);
})();
