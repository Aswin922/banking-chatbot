import { ValidatorFn, ValidationResult } from '../models/conversation-state.model';

/**
 * Shared validator library for conversation prompts
 */

export function required(min: number = 1, max: number = 1000): ValidatorFn {
  return (value: any): ValidationResult => {
    if (!value || typeof value !== 'string') {
      return { valid: false, message: 'This field is required.' };
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return { valid: false, message: 'This field cannot be empty.' };
    }

    if (trimmed.length < min) {
      return { valid: false, message: `This field must be at least ${min} characters.` };
    }

    if (trimmed.length > max) {
      return { valid: false, message: `This field cannot exceed ${max} characters.` };
    }

    return { valid: true };
  };
}

export function email(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (value: any): ValidationResult => {
    if (!value || typeof value !== 'string') {
      return { valid: false, message: 'Email is required.' };
    }

    const trimmed = value.trim();
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'That doesn\'t look like a valid email address. Please try again.' };
    }

    if (trimmed.length > 150) {
      return { valid: false, message: 'Email must not exceed 150 characters.' };
    }

    return { valid: true };
  };
}

export function phone(): ValidatorFn {
  const phoneRegex = /^[0-9\-\s\(\)\+]+$/;

  return (value: any): ValidationResult => {
    if (!value || typeof value !== 'string') {
      return { valid: false, message: 'Phone number is required.' };
    }

    const trimmed = value.trim();
    if (!phoneRegex.test(trimmed)) {
      return { valid: false, message: 'Phone number must contain only digits and formatting characters.' };
    }

    if (trimmed.length < 7 || trimmed.length > 30) {
      return { valid: false, message: 'Phone number must be between 7 and 30 characters.' };
    }

    return { valid: true };
  };
}

export function numeric(): ValidatorFn {
  return (value: any): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: 'This field is required.' };
    }

    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, message: 'Please enter a valid number.' };
    }

    return { valid: true };
  };
}

export function positive(): ValidatorFn {
  return (value: any): ValidationResult => {
    const numResult = numeric()(value);
    if (!numResult.valid) {
      return numResult;
    }

    const num = Number(value);
    if (num <= 0) {
      return { valid: false, message: 'Value must be greater than zero.' };
    }

    return { valid: true };
  };
}

export function nonNegative(): ValidatorFn {
  return (value: any): ValidationResult => {
    const numResult = numeric()(value);
    if (!numResult.valid) {
      return numResult;
    }

    const num = Number(value);
    if (num < 0) {
      return { valid: false, message: 'Value must be zero or greater.' };
    }

    return { valid: true };
  };
}

export function oneOf(validValues: string[]): ValidatorFn {
  return (value: any): ValidationResult => {
    if (!value || typeof value !== 'string') {
      return { valid: false, message: 'Please make a selection.' };
    }

    if (!validValues.includes(value)) {
      return {
        valid: false,
        message: `Value must be one of: ${validValues.join(', ')}`
      };
    }

    return { valid: true };
  };
}

export function optional(min: number = 0, max: number = 1000): ValidatorFn {
  return (value: any): ValidationResult => {
    // If value is 'skip' or empty, it's valid
    if (!value || value.toString().trim().toLowerCase() === 'skip') {
      return { valid: true };
    }

    // Otherwise, apply length validation
    const trimmed = value.toString().trim();
    if (trimmed.length < min) {
      return { valid: false, message: `This field must be at least ${min} characters, or type 'skip'.` };
    }

    if (trimmed.length > max) {
      return { valid: false, message: `This field cannot exceed ${max} characters.` };
    }

    return { valid: true };
  };
}

export function integer(): ValidatorFn {
  return (value: any): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: 'This field is required.' };
    }

    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { valid: false, message: 'Please enter a valid whole number.' };
    }

    return { valid: true };
  };
}

export function positiveInteger(): ValidatorFn {
  return (value: any): ValidationResult => {
    const intResult = integer()(value);
    if (!intResult.valid) {
      return intResult;
    }

    const num = Number(value);
    if (num <= 0) {
      return { valid: false, message: 'Value must be a positive whole number.' };
    }

    return { valid: true };
  };
}

/**
 * Combine multiple validators (AND logic)
 */
export function combine(...validators: ValidatorFn[]): ValidatorFn {
  return (value: any): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}
