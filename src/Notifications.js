import _ from "lodash";
import db from "./DBTools";
import FBUtil from "./FBUtil";

const notifications = {
  listeners: [],
  addListener(listener) {
    notifications.listeners.push(listener);
  },

  notify() {
    const callListener = n=>n();
    _.each(notifications.listeners, callListener);
    
  },

  markAllRead() {
    const user = FBUtil.getFB().auth().currentUser;
    if(_.isNil(user) || _.isNil(user.uid))
      return;

    const path = `/users/${user.uid}/messages`;
    const markRead = (t)=> {
      const mark = (n) => {
        let m = _.merge(n, {read: true});
        return m;
      }   
      return _.map(t, mark);
    }
    
    const save = (t)=> {
      db.saveAll(path, t);
    }

    const promiseToMarkRead = (resolve, reject)=> {
      db.findAll(path).then(markRead).then(save).then(this.notify).then(resolve);
    };

    return new Promise(promiseToMarkRead);
      
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
          alerts = _.reverse(alerts);
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
    const err = (e)=>{
      console.log("error deleting notification");
      console.log(e);
    }

    db.delete(path, alert.id).then(notifications.notify, err).catch(err);
  },
}

export default notifications;
