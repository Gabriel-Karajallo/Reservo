export const redimensionarImagen = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    calidad = 0.8
  ): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob!], file.name, {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          calidad
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };
