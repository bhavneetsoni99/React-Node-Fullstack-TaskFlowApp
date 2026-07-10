import { useState, useEffect } from 'react';
import styles from './Notification.module.scss';

type AlertType = 'confirm' | 'error' | 'success';

interface AlertPayload {
    id: string;
    type: AlertType;
    title: string;
    message: string | string[];
    onResolve?: (value: boolean) => void;
}

const bus = new EventTarget();
const CHANNEL = 'app-notify';

export const notify = {
    confirm: (title: string, message: string | string[]): Promise<boolean> => {
        return new Promise((resolve) => {
            bus.dispatchEvent(new CustomEvent(CHANNEL, {
                detail: { id: Math.random().toString(), type: 'confirm', title, message, onResolve: resolve }
            }));
        });
    },

    error: (title: string, message: string | string[]) => {
        bus.dispatchEvent(new CustomEvent(CHANNEL, {
            detail: { id: Math.random().toString(), type: 'error', title, message }
        }));
    },

    success: (message: string) => {
        bus.dispatchEvent(new CustomEvent(CHANNEL, {
            detail: { id: Math.random().toString(), type: 'success', title: 'Success', message }
        }));
    }
};

export function NotificationManager() {
    const [alerts, setAlerts] = useState<AlertPayload[]>([]);

    useEffect(() => {
        const handleEvent = (e: Event) => {
            const payload = (e as CustomEvent<AlertPayload>).detail;

            setAlerts((prev) => [...prev, payload]);

            if (payload.type === 'success') {
                setTimeout(() => {
                    setAlerts((prev) => prev.filter((item) => item.id !== payload.id));
                }, 3000);
            }
        };

        bus.addEventListener(CHANNEL, handleEvent);
        return () => bus.removeEventListener(CHANNEL, handleEvent);
    }, []);

    const toastAlerts = alerts.filter((a) => a.type === 'success');
    const modalAlerts = alerts.filter((a) => a.type === 'confirm' || a.type === 'error');

    const handleAction = (id: string, confirmed: boolean, onResolve?: (val: boolean) => void) => {
        if (onResolve) onResolve(confirmed);
        setAlerts((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className={styles.notificationContainer} data-testid="notification-container">
            {toastAlerts.length > 0 && (
                <div className={styles.toastContainer} aria-live="polite" role="status">
                    {toastAlerts.map((toast) => (
                        <div key={toast.id} className={styles.toast} data-testid="success-toast">
                            <span aria-hidden="true">✅</span>
                            <div>{toast.message}</div>
                        </div>
                    ))}
                </div>
            )}

            {modalAlerts.map((modal) => {
                const isError = modal.type === 'error';
                const colorClass = isError ? styles.error : styles.warning;
                const modalTitleId = `modal-title-${modal.id}`;

                return (
                    <div key={modal.id} className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby={modalTitleId} data-testid="modal-overlay">
                        <div className={styles.modal}>
                            <div className={styles.header}>
                                <span aria-hidden="true">{isError ? '❌' : '⚠️'}</span>
                                <h2 id={modalTitleId} className={colorClass}>{modal.title}</h2>
                            </div>

                            {Array.isArray(modal.message) ? (
                                <ul className={styles.message}>
                                    {modal.message.map((msg, idx) => <li key={idx}>{msg}</li>)}
                                </ul>
                            ) : (
                                <p className={styles.message}>{modal.message}</p>
                            )}

                            <div className={styles.footer}>
                                {modal.type === 'confirm' && (
                                    <button
                                        onClick={() => handleAction(modal.id, false, modal.onResolve)}
                                        className={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction(modal.id, true, modal.onResolve)}
                                    className={`${styles.confirmBtn} ${colorClass}`}
                                    data-testid="confirm-button"
                                >
                                    {modal.type === 'confirm' ? 'Confirm' : 'OK'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
