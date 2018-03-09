import dateFormat from 'dateformat';
import _ from "lodash";

const df = {
  day: (d)=> dateFormat(d, "ddd mmm dd"),
  fullDay: (d)=> dateFormat(d, "dddd, mmmm dd"),
  cal: (d)=> dateFormat(d, "yyyy-mm-dd"),
  df: (d)=> dateFormat(d, "dd mmm yyyy"),
  ts: (d)=> dateFormat(d,"yyyy-mm-dd HH:MM:ss"),
  range: (a,b)=> {

    const start = dateFormat(a, "ddd mm/dd - ");
    const end = dateFormat(b, "ddd mm/dd/yy");
    return `${start}${end}`
  },

  isSameDay: (d1,d2)=>{
  return d1.getYear() === d2.getYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
  },

  isDateWithin: (d, start, end)=> {
    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
  },

  getChallengeForDate: (challenges, d)=> {
    const match = (c)=> {
      return df.isDateWithin(d,c.start,c.end);
    }

    const x = _.find(challenges, match);
    return x || null;
  }


}

export default df;
