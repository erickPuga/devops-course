import { validateEmail } from './utils.js';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result).toBe(true);
  });

  it('should return false for email without @', () => {
    const result = validateEmail('invalidemail');
    expect(result).toBe(false);
  });

  it('should return false for empty string', () => {
    const result = validateEmail('');
    expect(result).toBe(false);
  });

  it('should return false for email without domain', () => {
    const result = validateEmail('user@');
    expect(result).toBe(false);
  });
});
