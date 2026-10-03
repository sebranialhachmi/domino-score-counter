export default function Toast({ toast, onClose }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div
        role="status"
        className="animate-slide-down pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/90 py-2 ps-4 pe-2 text-sm font-semibold shadow-xl shadow-black/50 backdrop-blur-xl"
      >
        <span>{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.run()
              onClose()
            }}
            className="rounded-full bg-teal-400 px-3 py-1 font-extrabold text-slate-950 active:scale-95"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  )
}
