"use client";

interface Photo {
  id: string;
  url: string;
  category: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-400">Aucune photo</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {photos.map((photo) => (
        <div key={photo.id} className="aspect-[4/3] overflow-hidden rounded-lg">
          <img
            src={photo.url}
            alt={photo.category}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
