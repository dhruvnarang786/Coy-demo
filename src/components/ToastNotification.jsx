import { motion } from 'motion/react';
import { CircleCheck, CircleAlert } from 'lucide-react';

export default function ToastNotification({ toast }) {
  const isError = toast.type === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <motion.div
      className={`toast-notification ${isError ? 'toast-error' : ''}`}
      role={isError ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      <Icon size={18} />
      <span>{toast.message}</span>
    </motion.div>
  );
}
