/* eslint-env jest */
// import {isDateWithin} from './Utils';
import df from "./DateUtil";
import _ from "lodash";

it('Calculates dates correctly', () => {
  expect(df.isDateWithin(
    new Date('2017-02-02'),
    new Date('2017-05-01'),
    new Date('2017-08-04'))).toBe(false);

  expect(df.isDateWithin(
    new Date('2017-07-30'),
    new Date('2017-05-01'),
    new Date('2017-08-04'))).toBe(true);
});

it("finds a challenge in a date range", () =>{

  const dayInMillis = 1000 * 60 * 60 * 24;

  const today = new Date();
  const yesterday = new Date(_.now() - dayInMillis)
  const tomorrow = new Date(_.now() + dayInMillis)
  const dayAfterTomorrow = new Date(_.now() + dayInMillis * 2)
  const nextWeek = new Date(_.now() + dayInMillis * 7)
  const nextMonth = new Date(_.now() + dayInMillis * 30)

  const c1 = {
    id:"challenge-1",
    start: today,
    end: tomorrow,
  };
  const c2 = {
    id:"challenge-2",
    start: tomorrow,
    end: nextWeek,
  };
  const c3 = {
    id:"challenge-3",
    start: today,
    end: nextMonth,
  };
  const challenges = [c1,c2,c3];
  let x = df.getChallengeForDate(challenges, today);
  expect(x.id).toBe("challenge-1");

  x = df.getChallengeForDate(challenges, yesterday);
  expect(x).toBeNull();

  x = df.getChallengeForDate(challenges, dayAfterTomorrow);
  expect(x.id).toBe("challenge-2");




});
