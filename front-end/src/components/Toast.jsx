import { useNotification } from '../context/NotificationContext';
import './Toast.css';

const Toast = () => {
  const { notifications, hideNotification, loading } = useNotification();

  return (
    <>
      {loading && (
        <div className="global-loader-overlay">
          <div className="global-loader-spinner"></div>
        </div>
      )}
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`} onClick={() => hideNotification(n.id)}>
            <div className="toast-content">{n.message}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Toast;
