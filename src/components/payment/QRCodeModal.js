import Modal from "@mui/material/Modal";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect, useState, useRef, memo } from "react";

const QRCodeModal = memo(({ qrCode, reference, modalOpen, handleModalClose }) => {
  const qrCodeRef = useRef();
  const [isQrCodeAppended, setIsQrCodeAppended] = useState(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    outerHeight: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  useEffect(() => {
    if(qrCode) {
      qrCode.append(qrCodeRef.current);
      console.log("qrCodeRef appended... ");
      setIsQrCodeAppended(true);
    }
  }, [qrCodeRef, qrCode, isQrCodeAppended]); 

  useEffect(() => {
    if (!modalOpen) {
      setIsQrCodeAppended(false); // Reset the state when the modal is closed
    }
  }, [modalOpen]);

  return (
      <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Scan to Pay
        </Typography>
      <div ref={qrCodeRef}></div>
      </Box>
      
      </>
    </Modal>
  );
});

export default QRCodeModal;