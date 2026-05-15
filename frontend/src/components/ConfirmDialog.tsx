import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onClose,
  loading,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn bg-red-500 text-white hover:bg-red-400"
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/15 grid place-items-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-ink/80 leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  );
}
