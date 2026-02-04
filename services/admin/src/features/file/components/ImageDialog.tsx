export function ImageDialog({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div className="z-80 fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black/70">
      <button
        className="z-90 fixed right-8 top-6 text-5xl font-bold text-white"
        onClick={onClose}
      >
        &times;
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[600px] max-w-[800px] object-cover"
      />
    </div>
  );
}
