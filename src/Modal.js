import React from 'react';
import $ from "jquery";

class Modal  extends React.Component {

  componentDidMount() {
    $(`#${this.props.id}`).on('hide.bs.modal', this.props.closeHandler);
  }

  componentDidUpdate() {
    if(this.props.show)
      $(`#${this.props.id}`).modal("show");
    else {
      $(`#${this.props.id}`).modal("hide");
    }
  }


  propsWillChange(nextProps) {
    console.log(this.props.closeHandler);
    if(this.props.closeHandler && !nextProps.show && this.props.show) {
      console.log("calling close handler");
      this.props.closeHandler();
    }
  }


  render() {
    const ModalBody = this.props.body || this.props.children;
    return (
      <div className={`modal fade`} id={this.props.id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <ModalHeader title={this.props.title} />
            <div className="modal-body">{ModalBody}</div>
            <ConfirmFooter id={this.props.id} onConfirm={this.props.onConfirm} />
            <ModalFooter footer={this.props.footer} />
          </div>
        </div>
      </div>
    );
  }
}

const ModalHeader = (props)=> {

  // if(!props.title)
  //   return null;

  return (
    <div className="modal-header">
      <h5 className="modal-title">{props.title}</h5>
      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

  );


};

const ModalFooter = (props)=> {

  if(!props.footer)
    return null;

  return (
    <div className="modal-footer">
      {props.footer}
    </div>
  );
};

const ConfirmFooter = (props)=> {

  if(!props.onConfirm)
    return null;
  const label = props.confirmLabel || "OK";
  const ok = ()=> {
    props.onConfirm();
    $(`#${props.id}`).modal("hide");
  }

  return (
    <div className="modal-footer">
      <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
      <button type="button"
        onClick={ok}
        className="btn btn-primary">{label}</button>
    </div>
  );
};



export default Modal;
