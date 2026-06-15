import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { compressBlob, extractDocxImages } from "@/lib/image-compression";

const DEFAULT_QUALITY = 60;

export interface DocxImage {
  path: string;
  originalBlob: Blob;
  compressedBlob: Blob | null;
  originalSize: number;
  compressedSize: number;
}

export const useImageCompression = () => {
  const [step, setStep] = useState<"upload" | "compress" | "done">("upload");
  const [zip, setZip] = useState<any>(null);
  const [images, setImages] = useState<DocxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qualities, setQualities] = useState<number[]>([]);
  const [edited, setEdited] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [originalFileName, setOriginalFileName] = useState("document.docx");

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const navigateTo = useCallback((targetIndex: number) => {
    if (targetIndex === currentIndex || targetIndex < 0 || targetIndex >= images.length) return;
    setQualities((prev) => {
      const next = [...prev];
      if (!edited[targetIndex]) {
        next[targetIndex] = next[currentIndex];
      }
      return next;
    });
    setEdited((prev) => {
      const next = [...prev];
      next[targetIndex] = true;
      return next;
    });
    setCurrentIndex(targetIndex);
  }, [currentIndex, edited, images.length]);

  const handleImageUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const docx = fileArray.find(
        (f) =>
          f.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          f.name.toLowerCase().endsWith(".docx")
      );
      if (!docx) {
        toast.error("Пожалуйста, загрузите DOCX файл");
        return;
      }

      setLoading(true);
      try {
        const { zip: loadedZip, images: extractedImages } =
          await extractDocxImages(docx);
        if (extractedImages.length === 0) {
          toast.error("В этом документе нет картинок! Что сжимать-то?");
          setLoading(false);
          return;
        }

        setZip(loadedZip);
        setImages(
          extractedImages.map((img) => ({
            path: img.path,
            originalBlob: img.blob,
            compressedBlob: null,
            originalSize: img.size,
            compressedSize: img.size,
          }))
        );
        setQualities(new Array(extractedImages.length).fill(DEFAULT_QUALITY));
        setEdited(new Array(extractedImages.length).fill(false));
        setCurrentIndex(0);
        setOriginalFileName(docx.name);
        setStep("compress");
        toast.success(`Найдено ${extractedImages.length} картинок!`);
      } catch (err) {
        console.error(err);
        toast.error("Ошибка распаковки DOCX");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (step !== "compress" || imagesRef.current.length === 0) return;
    const q = qualities[currentIndex];

    if (q >= 100) {
      setImages((prev) => {
        const next = [...prev];
        if (next[currentIndex]) {
          next[currentIndex] = {
            ...next[currentIndex],
            compressedBlob: null,
            compressedSize: next[currentIndex].originalSize,
          };
        }
        return next;
      });
      return;
    }

    setLoading(true);
    let cancelled = false;

    const blob = imagesRef.current[currentIndex].originalBlob;
    compressBlob(blob, q)
      .then((compressed) => {
        if (cancelled) return;
        setImages((prev) => {
          const next = [...prev];
          if (next[currentIndex]) {
            next[currentIndex] = {
              ...next[currentIndex],
              compressedBlob: compressed,
              compressedSize: compressed.size,
            };
          }
          return next;
        });
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          toast.error("Ошибка сжатия картинки");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, qualities, step]);

  const onImageQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value, 10);
    setQualities((prev) => {
      const next = [...prev];
      next[currentIndex] = val;
      return next;
    });
    setEdited((prev) => {
      const next = [...prev];
      next[currentIndex] = true;
      return next;
    });
  };

  const nextImage = () => navigateTo(currentIndex + 1);
  const prevImage = () => navigateTo(currentIndex - 1);

  const jumpToImage = (index: number) => {
    if (index >= 1 && index <= images.length) {
      navigateTo(index - 1);
    } else {
      toast.error(`Введите номер от 1 до ${images.length}`);
    }
  };

  const finish = useCallback(async () => {
    if (!zip || images.length === 0) return;
    setLoading(true);
    try {
      const newZip = zip;
      for (const img of images) {
        if (img.compressedBlob) {
          newZip.file(img.path, img.compressedBlob, { binary: true });
        }
      }
      const blob = await newZip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dotIndex = originalFileName.lastIndexOf(".");
      const base =
        dotIndex !== -1
          ? originalFileName.slice(0, dotIndex)
          : originalFileName;
      a.download = `${base}-compressed.docx`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStep("done");
      toast.success("Диплом сжат! Скачивайте!");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка упаковки DOCX");
    } finally {
      setLoading(false);
    }
  }, [zip, images, originalFileName]);

  const resetCompression = () => {
    setStep("upload");
    setZip(null);
    setImages([]);
    setCurrentIndex(0);
    setQualities([]);
    setEdited([]);
    setOriginalFileName("document.docx");
  };

  return {
    step,
    images,
    currentIndex,
    quality: qualities[currentIndex] ?? DEFAULT_QUALITY,
    loading,
    hasImages: images.length > 0,
    handleImageUpload,
    onImageQualityChange,
    nextImage,
    prevImage,
    jumpToImage,
    finish,
    resetCompression,
  };
};
