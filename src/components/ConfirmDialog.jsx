import Dialog from './Dialog.jsx';

export default function ConfirmDialog({ dialog, onResult, cancelLabel, defaultConfirm }) {
  const open = !!dialog;
  return (
    <Dialog
      open={open}
      onClose={() => onResult(false)}
      title={dialog ? dialog.title : ''}
      closeLabel={cancelLabel}
      footer={
        <>
          <button type="button" className="btn btn-soft" onClick={() => onResult(false)}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${dialog && dialog.danger ? 'btn-danger' : 'btn-accent'}`} onClick={() => onResult(true)}>
            {(dialog && dialog.confirmLabel) || defaultConfirm}
          </button>
        </>
      }
    >
      {dialog && <p className="mb-0">{dialog.message}</p>}
    </Dialog>
  );
}
