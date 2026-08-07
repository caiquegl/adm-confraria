"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";

type PreviewItem = {
  file: File;
  id: string;
  url: string;
};

const MAX_GALLERY = 10;

function revokeAll(items: PreviewItem[]) {
  items.forEach((item) => URL.revokeObjectURL(item.url));
}

function syncInput(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic)$/i.test(file.name);
}

function toPreviewItems(files: File[]): PreviewItem[] {
  return files.filter(isImageFile).map((file) => ({
    file,
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
  }));
}

function DropzoneShell({
  active,
  children,
  className = "",
  onClick,
  onDropFiles,
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  onDropFiles: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);

  function handleDrag(event: DragEvent<HTMLButtonElement>, next: boolean) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(next);
  }

  return (
    <button
      className={`group relative block w-full cursor-pointer rounded-2xl border-2 border-dashed transition ${
        dragging || active
          ? "border-brand-primary bg-accent-soft/70"
          : "border-border bg-brand-gray/50 hover:border-brand-primary/50 hover:bg-accent-soft/40"
      } ${className}`}
      onClick={onClick}
      onDragEnter={(event) => handleDrag(event, true)}
      onDragLeave={(event) => handleDrag(event, false)}
      onDragOver={(event) => handleDrag(event, true)}
      onDrop={(event) => {
        handleDrag(event, false);
        if (event.dataTransfer.files?.length) {
          onDropFiles(Array.from(event.dataTransfer.files));
        }
      }}
      type="button"
    >
      {children}
    </button>
  );
}

export function EventImageFields() {
  const coverPickerRef = useRef<HTMLInputElement>(null);
  const galleryPickerRef = useRef<HTMLInputElement>(null);
  const coverSubmitRef = useRef<HTMLInputElement>(null);
  const gallerySubmitRef = useRef<HTMLInputElement>(null);

  const [cover, setCover] = useState<PreviewItem | null>(null);
  const [gallery, setGallery] = useState<PreviewItem[]>([]);

  useEffect(() => {
    syncInput(coverSubmitRef.current, cover ? [cover.file] : []);
  }, [cover]);

  useEffect(() => {
    syncInput(
      gallerySubmitRef.current,
      gallery.map((item) => item.file),
    );
  }, [gallery]);

  useEffect(() => {
    return () => {
      if (cover) URL.revokeObjectURL(cover.url);
      revokeAll(gallery);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCoverFile = useCallback((file: File | null) => {
    setCover((current) => {
      if (current) URL.revokeObjectURL(current.url);
      if (!file || !isImageFile(file)) return null;
      return {
        file,
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
      };
    });
  }, []);

  const addGalleryFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    setGallery((current) => {
      const room = MAX_GALLERY - current.length;
      if (room <= 0) return current;
      return [...current, ...toPreviewItems(files).slice(0, room)];
    });
  }, []);

  function removeGalleryItem(id: string) {
    setGallery((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <input
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = "";
          setCoverFile(file);
        }}
        ref={coverPickerRef}
        type="file"
      />
      <input
        className="hidden"
        name="cover"
        ref={coverSubmitRef}
        type="file"
      />

      <input
        accept="image/*"
        className="sr-only"
        multiple
        onChange={(event) => {
          // FileList é live: copiar ANTES de limpar o input
          const files = event.target.files
            ? Array.from(event.target.files)
            : [];
          event.target.value = "";
          addGalleryFiles(files);
        }}
        ref={galleryPickerRef}
        type="file"
      />
      <input
        className="hidden"
        multiple
        name="gallery"
        ref={gallerySubmitRef}
        type="file"
      />

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-dark">Capa</p>
            <p className="text-xs text-muted">Imagem principal do evento</p>
          </div>
          {cover ? (
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-semibold text-white"
                onClick={() => coverPickerRef.current?.click()}
                type="button"
              >
                Trocar
              </button>
              <button
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-danger"
                onClick={() => setCoverFile(null)}
                type="button"
              >
                Remover
              </button>
            </div>
          ) : null}
        </div>

        {cover ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Capa do evento"
              className="aspect-[16/10] w-full object-cover"
              src={cover.url}
            />
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{cover.file.name}</p>
                <p className="text-xs text-muted">{formatBytes(cover.file.size)}</p>
              </div>
              <span className="rounded-full bg-brand-green px-2.5 py-1 text-[11px] font-bold text-brand-dark">
                Capa
              </span>
            </div>
          </div>
        ) : (
          <DropzoneShell
            className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center"
            onClick={() => coverPickerRef.current?.click()}
            onDropFiles={(files) => setCoverFile(files[0] ?? null)}
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green text-lg font-black text-brand-dark">
              +
            </span>
            <p className="text-sm font-semibold text-brand-dark">
              Arraste a capa aqui
            </p>
            <p className="mt-1 text-xs text-muted">
              ou clique para selecionar · JPG, PNG ou WEBP
            </p>
          </DropzoneShell>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-dark">Galeria</p>
            <p className="text-xs text-muted">
              {gallery.length}/{MAX_GALLERY} fotos
            </p>
          </div>
          {gallery.length > 0 && gallery.length < MAX_GALLERY ? (
            <button
              className="rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => galleryPickerRef.current?.click()}
              type="button"
            >
              Adicionar
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {gallery.map((item) => (
            <div
              className="group relative overflow-hidden rounded-2xl border border-border bg-panel shadow-sm"
              key={item.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={item.file.name}
                className="aspect-square w-full object-cover"
                src={item.url}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/80 to-transparent p-2 pt-8">
                <p className="truncate text-[11px] font-medium text-white">
                  {item.file.name}
                </p>
                <p className="text-[10px] text-white/70">
                  {formatBytes(item.file.size)}
                </p>
              </div>
              <button
                aria-label={`Remover ${item.file.name}`}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-sm font-bold text-danger shadow-sm transition group-hover:scale-105"
                onClick={() => removeGalleryItem(item.id)}
                type="button"
              >
                ×
              </button>
            </div>
          ))}

          {gallery.length < MAX_GALLERY ? (
            <DropzoneShell
              className="flex aspect-square flex-col items-center justify-center px-3 text-center"
              onClick={() => galleryPickerRef.current?.click()}
              onDropFiles={addGalleryFiles}
            >
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-bold text-brand-primary shadow-sm">
                +
              </span>
              <p className="text-xs font-semibold text-brand-dark">
                {gallery.length === 0 ? "Adicionar fotos" : "Mais fotos"}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">Arraste ou clique</p>
            </DropzoneShell>
          ) : null}
        </div>
      </div>
    </div>
  );
}
