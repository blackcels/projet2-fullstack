import 'jest-preset-angular/setup-jest';

// Configure Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTruthy(): R;
      toBeFalsy(): R;
      toEqual(expected: any): R;
      toBe(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}