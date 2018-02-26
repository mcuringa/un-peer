import React from 'react';


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
 
  return (
    <div className="UploadProgress">
      <div className="ProgressBar" style={{width: `${props.pct}%`}}></div>
      <div className="ProgressMsg">{props.msg}</div>
    </div>
  );
}



export {UploadProgress, formatFileSize};