import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsUlidConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') {
      return false;
    }
    const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    return ulidRegex.test(value);
  }

  defaultMessage({ value }: ValidationArguments) {
    return `The value (${value}) is not a valid ULID`;
  }
}

export function IsUlid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUlidConstraint,
    });
  };
}
