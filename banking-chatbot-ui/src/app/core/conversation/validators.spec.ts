import {
  required,
  email,
  phone,
  numeric,
  positive,
  nonNegative,
  oneOf,
  optional,
  integer,
  positiveInteger
} from './validators';

describe('Validators', () => {
  describe('required', () => {
    it('should validate non-empty strings', () => {
      const validator = required(2, 10);
      expect(validator('test').valid).toBe(true);
      expect(validator('ab').valid).toBe(true);
    });

    it('should reject empty strings', () => {
      const validator = required();
      expect(validator('').valid).toBe(false);
      expect(validator('   ').valid).toBe(false);
      expect(validator(null).valid).toBe(false);
    });

    it('should enforce min and max length', () => {
      const validator = required(3, 5);
      expect(validator('ab').valid).toBe(false);
      expect(validator('abc').valid).toBe(true);
      expect(validator('abcde').valid).toBe(true);
      expect(validator('abcdef').valid).toBe(false);
    });
  });

  describe('email', () => {
    it('should validate correct email addresses', () => {
      const validator = email();
      expect(validator('test@example.com').valid).toBe(true);
      expect(validator('user.name@domain.co.uk').valid).toBe(true);
      expect(validator('user+tag@example.com').valid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const validator = email();
      expect(validator('notanemail').valid).toBe(false);
      expect(validator('missing@domain').valid).toBe(false);
      expect(validator('@example.com').valid).toBe(false);
      expect(validator('user@').valid).toBe(false);
    });
  });

  describe('phone', () => {
    it('should validate phone numbers with formatting', () => {
      const validator = phone();
      expect(validator('555-1234').valid).toBe(true);
      expect(validator('(555) 123-4567').valid).toBe(true);
      expect(validator('+1 555 123 4567').valid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const validator = phone();
      expect(validator('abc').valid).toBe(false);
      expect(validator('123').valid).toBe(false); // Too short
      expect(validator('1'.repeat(31)).valid).toBe(false); // Too long
    });
  });

  describe('numeric', () => {
    it('should validate numbers', () => {
      const validator = numeric();
      expect(validator('123').valid).toBe(true);
      expect(validator('123.45').valid).toBe(true);
      expect(validator('-10').valid).toBe(true);
      expect(validator(0).valid).toBe(true);
    });

    it('should reject non-numeric values', () => {
      const validator = numeric();
      expect(validator('abc').valid).toBe(false);
      expect(validator('12abc').valid).toBe(false);
      expect(validator('').valid).toBe(false);
    });
  });

  describe('positive', () => {
    it('should validate positive numbers', () => {
      const validator = positive();
      expect(validator('123').valid).toBe(true);
      expect(validator('0.01').valid).toBe(true);
    });

    it('should reject zero and negative numbers', () => {
      const validator = positive();
      expect(validator('0').valid).toBe(false);
      expect(validator('-1').valid).toBe(false);
    });
  });

  describe('nonNegative', () => {
    it('should validate zero and positive numbers', () => {
      const validator = nonNegative();
      expect(validator('0').valid).toBe(true);
      expect(validator('123').valid).toBe(true);
    });

    it('should reject negative numbers', () => {
      const validator = nonNegative();
      expect(validator('-1').valid).toBe(false);
    });
  });

  describe('oneOf', () => {
    it('should validate values in the allowed list', () => {
      const validator = oneOf(['A', 'B', 'C']);
      expect(validator('A').valid).toBe(true);
      expect(validator('B').valid).toBe(true);
      expect(validator('C').valid).toBe(true);
    });

    it('should reject values not in the allowed list', () => {
      const validator = oneOf(['A', 'B', 'C']);
      expect(validator('D').valid).toBe(false);
      expect(validator('').valid).toBe(false);
    });
  });

  describe('optional', () => {
    it('should accept "skip" and empty values', () => {
      const validator = optional();
      expect(validator('skip').valid).toBe(true);
      expect(validator('SKIP').valid).toBe(true);
      expect(validator('').valid).toBe(true);
      expect(validator(null).valid).toBe(true);
    });

    it('should validate non-empty values', () => {
      const validator = optional(3, 10);
      expect(validator('test').valid).toBe(true);
      expect(validator('ab').valid).toBe(false); // Too short
    });
  });

  describe('integer', () => {
    it('should validate whole numbers', () => {
      const validator = integer();
      expect(validator('123').valid).toBe(true);
      expect(validator('-10').valid).toBe(true);
      expect(validator(0).valid).toBe(true);
    });

    it('should reject decimal numbers', () => {
      const validator = integer();
      expect(validator('123.45').valid).toBe(false);
    });
  });

  describe('positiveInteger', () => {
    it('should validate positive whole numbers', () => {
      const validator = positiveInteger();
      expect(validator('123').valid).toBe(true);
      expect(validator(5).valid).toBe(true);
    });

    it('should reject zero, negative, and decimal numbers', () => {
      const validator = positiveInteger();
      expect(validator('0').valid).toBe(false);
      expect(validator('-5').valid).toBe(false);
      expect(validator('12.5').valid).toBe(false);
    });
  });
});
