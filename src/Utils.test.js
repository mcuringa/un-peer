/* eslint-env jest */
import {isDateWithin} from './Utils';

it('Calculates dates correctly', () => {
  expect(isDateWithin(
    new Date('2017-02-02'),
    new Date('2017-05-01'),
    new Date('2017-08-04'))).toBe(false);

  expect(isDateWithin(
    new Date('2017-07-30'),
    new Date('2017-05-01'),
    new Date('2017-08-04'))).toBe(true);
});
