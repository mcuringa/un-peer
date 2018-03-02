import React from 'react';
import _ from "lodash";

const formatFileSize = (bytes, si)=>{
  const thresh = si ? 1000 : 1024;
  if(bytes < thresh) return bytes + ' B';
  const units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  let u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(bytes >= thresh);
  return bytes.toFixed(1)+' '+units[u];
}

const UploadProgress = (props)=> {

  const pct = props.pct;
  if(!pct || _.isNaN(pct))
    return null;


  return (
    <div className="progress w-100">
      <div className="progress-bar progress-bar progress-bar-striped progress-bar-animated" 
           role="progressbar" style={{width: `${pct}%`}} 
           aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">{_.round(pct)}%</div>
    </div>
  );
}



export {UploadProgress, formatFileSize};