import React, {useImperativeHandle, useState} from 'react';
import Modal from 'react-native-modal';

const Popup = React.forwardRef((props, ref) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const {content, modalStyle} = props;

  const hideModal = () => {
    setModalVisible(false);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  useImperativeHandle(ref, () => ({
    hideModal() {
      hideModal();
    },
    showModal() {
      showModal();
    },
  }));

  const rednerContent = () => content;

  return (
    <Modal style={modalStyle} onBackdropPress={hideModal} isVisible={isModalVisible}>
      {rednerContent()}
    </Modal>
  );
});

export default Popup;
