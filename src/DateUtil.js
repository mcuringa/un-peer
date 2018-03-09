import dateFormat from 'dateformat';


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

  }
}

export default df;
