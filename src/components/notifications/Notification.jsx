import React from 'react';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


function Notification(props) {
    return (
        <div className=''>
            <ToastContainer position="bottom-right"/>
        </div>
    );
}

export default Notification;