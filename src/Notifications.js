import localforage from "localforage";
import _ from "lodash";
import {uuid} from "./DBTools";

const init = _.once(()=>{
  console.log("alert store configured");
  console.log("uuid test", uuid());
  localforage.config({
      driver: [localforage.INDEXEDDB],
      name: 'alerts'
  });
  console.log("alerts initialized"); 
  localforage.length().then((n)=>{
    console.log("# of alerts", n);
  });
});

init();

const ttl = 1000 * 60 * 60 * 12; //12 hours in millis
const notifications = {
  listeners: [],
  addListener(listener) {
    this.listeners.push(listener);
  },

  notify(action, data) {
    const event = {action: action, data: data};
    const n = (f)=>{f(event);};
    _.each(this.listeners,n);
  },

  add(alert) {
    console.log("adding alert", alert);
    alert = _.merge(alert.notification, alert.data);
    alert.id = alert.id || uuid();
    alert.sent = (alert.sent)? new Date(alert.sent) : new Date();
    alert.recieved = new Date();
    alert.read = false; 
    alert.ttl = alert.ttl || ttl;
    this.notify("add", alert);
    return localforage.setItem(alert.id, alert);
  },

  all() {
    console.log("gathering all alerts");
    const expired = (alert)=> {
      // const age = _.now() -  alert.sent.getTime();
      // return age > alert.ttl;
      return false;
    }

    const promiseToGetAll = (resolve, reject)=> {
      let alerts = [];
      let old = [];
      const sortAlerts = (a)=> {
        console.log("sorting alert", a);

        if(!expired(a))
          alerts.push(a)
        else
          old.push(a);
      };
      const resolveAlerts = ()=>{
        if(alerts.length > 0)
          resolve(alerts);
        else
          reject();
        // _.each(alerts, this.delete)
      }
      
      localforage.iterate(sortAlerts)
      .then(resolveAlerts);
    };

    return new Promise(promiseToGetAll);
  },

  set(alert) {
    this.notify("update", alert);
    return localforage.setItem(alert.id, alert);
  },

  get(id) {
    return localforage.getItem(id);
  },

  delete(alert) {
    this.notify("delete", alert);
    return localforage.removeItem(alert.id);
  },
}

export default notifications;
