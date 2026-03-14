export const TABLE_MODEL = 'tables';

import apiService from "../services/apiService";

export const isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
};
export const loadTable = async (table_id) => {
    try {
        const response = await apiService.clientGetEntities(TABLE_MODEL, { table_id });
        if (response.data.length > 0) {
            return (response.data)
            // return (response.data.map((code) => code.description))
        } else return (window.alert("Read Table no - " + table_id + " faild"))
    } catch (error) {
        console.log(error);
    }
};
export const sendWhatsapp = (phone) => {
  let fixedPhone = phone;
  if (phone.charAt(0) === '0') fixedPhone = phone.substring(1);
  window.open('https://api.whatsapp.com/send?phone=972'+fixedPhone.replace("-", ""))
};

export async function viewGDFile(fileId, modalDialogRef) {
    return new Promise((resolve, reject) => {
        try {
            const fileView = `https://docs.google.com/file/d/${fileId}/preview?usp=drivesdk`;
            modalDialogRef.open(fileView);
            // window.open(fileView, '_blank'); // Opens the file in a new tab

            // מאזין לסגירה – ברגע שנסגר, נפתור את ה-Promise
            const unwatch = modalDialogRef.$watch(
                'isOpen',
                (newVal) => {
                    if (!newVal) {
                        unwatch(); // מפסיק להאזין
                        resolve(); // מסמן שהמודל נסגר
                    }
                },
                { immediate: false }
            );
        } catch (error) {
            console.error('Error viewing file:', error);
            reject(error);
        }
    });
}

export async function shareOnWhatsApp (fileId, msg) {
    const googleDriveLink = `https://drive.google.com/file/d/${fileId}/view`;
    const message = msg + ' ' + googleDriveLink;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');
}

