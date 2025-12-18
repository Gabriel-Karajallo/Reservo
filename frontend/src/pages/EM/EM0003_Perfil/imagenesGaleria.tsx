import { useState } from "react";

interface Props {
  url: string;
}

const ImagenGaleria = ({ url }: Props) => {
  const [cargada, setCargada] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-200">
      {!cargada && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-300" />
      )}

      {!error && (
        <img
          src={url}
          loading="lazy"
          onLoad={() => setCargada(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            cargada ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
          Imagen no disponible
        </div>
      )}
    </div>
  );
};

export default ImagenGaleria;
