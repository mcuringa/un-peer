import dateFormat from 'dateformat';
import moment from "moment";
import _ from "lodash";

const df = {
  day: (d)=> dateFormat(d, "ddd mmm dd"),
  fullDay: (d)=> dateFormat(d, "dddd, mmmm dd"),
  fullDayTime: (d)=> moment(d, "llll"),
  cal: (d)=> dateFormat(d, "yyyy-mm-dd"),
  pickerDate: (d)=> dateFormat(d, "mm/dd/yyyy"),
  df: (d)=> dateFormat(d, "dd mmm yyyy"),
  ts: (d)=> dateFormat(d,"yyyy-mm-dd HH:MM:ss"),
  time:(d)=> dateFormat(d,"HH:MM:ss"),
  
  range: (a,b)=> {

    const start = dateFormat(a, "ddd mm/dd");
    const end = dateFormat(b, "ddd mm/dd/yy");
    return `${start} - ${end}`;
  },

  isToday: (d)=> {
    const now = new Date();
    return moment(now).isSame(d, "day");
  },

  shortRange: (a,b)=> {

    const start = dateFormat(a, "d/m");
    const end = dateFormat(b, "d/m/yy");
    return `${start}-${end}`;
  },

  isSameDay: (d1,d2)=>{
    return d1.getYear() === d2.getYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  },

  isDateWithin: (d, start, end)=> {
    return moment(d).isBetween(start, end, null, '[]');
  },

  isDayWithin: (d, start, end)=> {
    return moment(d).isBetween(start, end, "day", '[]');
  },

  getChallengeForDate: (challenges, d)=> {
    const match = (c)=> {
      return df.isDateWithin(d,c.start,c.end);
    };

    const x = _.find(challenges, match);
    return x || null;
  }


}

export default df;
