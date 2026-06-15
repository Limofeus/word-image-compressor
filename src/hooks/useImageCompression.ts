// src/hooks/useImageCompression.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { compressBlob, extractDocxImages } from "@/lib/image-compression";

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
  const [loading, setLoading] = useState(false);
  const [originalFileName, setOriginalFileName] = useState("document.docx");

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

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
        setQualities(new Array(extractedImages.length).fill(60));
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

  // Compress current image when index or quality changes
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
  };

  const nextImage = () => {
    setCurrentIndex((i) => Math.min(i + 1, images.length - 1));
  };

  const prevImage = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const jumpToImage = (index: number) => {
    if (index >= 1 && index <= images.length) {
      setCurrentIndex(index - 1);
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
    setOriginalFileName("document.docx");
  };

  return {
    step,
    images,
    currentIndex,
    quality: qualities[currentIndex] ?? 60,
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
