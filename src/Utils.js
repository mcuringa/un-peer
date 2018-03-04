/**
 * Returns true if these two dates are the same day.
 */
function isSameDay(d1, d2) {
  return d1.getYear() === d2.getYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Returns true if the first date's day happens within the
 * other two.
 */
function isDateWithin(d, start, end) {
  return d >= start && d <= end;
}

/**
 * Given a list of challenges and a date, return a challenge, or null.
 */
function getChallengeForDate(challenges, d) {
  for (let i = 0; i < challenges.length; i++) {
    if (isDateWithin(d, challenges[i].start, challenges[i].end)) {
      return challenges[i];
    }
  }

  return null;
}

export {isSameDay, isDateWithin, getChallengeForDate};
