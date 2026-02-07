import { toast } from "react-toastify";

// Success Notifications
export const notifySuccess = (message) => {
  toast.success(message || "Action completed successfully!", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Error Notifications
export const notifyError = (message) => {
  toast.error(message || "Something went wrong!", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Info Notifications
export const notifyInfo = (message) => {
  toast.info(message || "Information", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Warning Notifications
export const notifyWarning = (message) => {
  toast.warning(message || "Warning", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
