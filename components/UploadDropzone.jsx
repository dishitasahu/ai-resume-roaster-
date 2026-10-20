import { useRef, useState } from 'react';

const MAX_BYTES = 5 * 1024 * 1024;

export default function UploadDropzone({ file, onFile, onError, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function pick(f) {
    if (!f) return;
    if (f.type !== 'application/pdf') return onError('INVALID CARTRIDGE: only PDF files are allowed.');
    if (f.size > MAX_BYTES) return onError('FILE TOO HEAVY: keep it under 5MB.');
    onError('');
    onFile(f);
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) pick(e.dataTransfer.files?.[0]);
      }}
      className={`cursor-pointer border-2 border-dashed p-10 text-center transition ${
        dragging
          ? 'border-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_25px_rgba(217,70,239,0.4)]'
          : 'border-cyan-400/50 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {file ? (
        <>
          <p className="text-4xl">💾</p>
          <p className="mt-3 font-pixel text-[10px] leading-relaxed text-lime-400 neon-text">CARTRIDGE LOADED</p>
          <p className="mt-2 font-semibold">{file.name}</p>
          <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(0)} KB · click to swap</p>
        </>
      ) : (
        <>
          <p className="animate-floaty text-4xl">📀</p>
          <p className="mt-3 font-pixel text-[10px] leading-relaxed text-cyan-300 neon-text">INSERT RESUME.PDF</p>
          <p className="mt-2 text-slate-400">Drag &amp; drop or click to browse · PDF only · 5MB max</p>
        </>
      )}
    </div>
  );
}
