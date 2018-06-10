// import localforage from "localforage";
import _ from "lodash";
import db from "./DBTools";
import FBUtil from "./FBUtil";

const notifications = {
  listeners: [],
  addListener(listener) {
    notifications.listeners.push(listener);
  },

  notify() {
    const f = n=>n();
    _.each(notifications.listeners, f);
    
  },

  all() {
    const user = FBUtil.getFB().auth().currentUser;   
    const expired = (alert)=> {
      return _.now() > alert.expires.getTime();
    }

    const promiseToGetAll = (resolve, reject)=> {
      let alerts = [];
      let old = [];

      const sortAlerts = (t)=> {
        // console.log("sorting messages", t);
        _.each(t, (a)=>{
          // console.log(a);
          if(!expired(a))
            alerts.push(a)
          else
            old.push(a);
        });

      };

      const resolveAlerts = ()=>{
        if(alerts.length > 0) {
          alerts = _.sortBy(alerts, "sent");
          resolve(alerts);
        }
        else
          reject();
        
        db.deleteAll(old);

      }

      const path = `/users/${user.uid}/messages`;
      db.findAll(path)
        .then(sortAlerts)
        .then(resolveAlerts);
    };

    return new Promise(promiseToGetAll);
  },

  delete(alert) {
    const user = FBUtil.getFB().auth().currentUser;
    const path = `/users/${user.uid}/messages`;
    console.log("delete path", path);
    console.log("alert id", alert.id);
    const err = (e)=>{
      console.log("error deleting notification");
      console.log(e);
    }

    db.delete(path, alert.id).then(notifications.notify, err).catch(err);
  },
}

export default notifications;
