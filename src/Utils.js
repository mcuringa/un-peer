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
function isDateWithin(d1, start, end) {
  return d1 >= start && d1 <= end;
}

export {isSameDay, isDateWithin};
