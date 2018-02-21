import _ from "lodash";
import dateFormat from 'dateformat';


const df = {
  day: (d)=> dateFormat(d, "ddd mmm dd"),
  cal: (d)=> dateFormat(d, "yyyy-mm-dd"),
  df: (d)=> dateFormat(d, "dd mmm yyyy"),
  ts: (d)=> dateFormat(d,"yyyy-mm-dd HH:MM:ss"),
}

export default df;