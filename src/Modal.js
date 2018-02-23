import React from 'react';
import Modal from "react-bootstrap-modal";

const UNModal = (props)=> {
  <Modal
    show={props.show}
    onHide={props.onClose}
    aria-labelledby="ModalHeader"
  >
    <Modal.Header closeButton>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>

    <Modal.Body>{props.footer}</Modal.Body>
    <Modal.Footer>{props.footer}</Modal.Footer>
  </Modal>
}

export default UNModal;