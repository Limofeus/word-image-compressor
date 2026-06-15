// src/App.tsx
import { useState, useEffect, useRef } from "react";
import DropZone from "./components/drop-zone";
import Footer from "./components/footer";
import Header from "./components/header";
import ImageQualitySlider from "./components/image-quality-slider";
import Intro from "./components/intro";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { useImageCompression } from "./hooks/useImageCompression";
import { formatBytes } from "./lib/utils";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  FileImage,
} from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
  const {
    step,
    images,
    currentIndex,
    quality,
    loading,
    hasImages,
    handleImageUpload,
    onImageQualityChange,
    nextImage,
    prevImage,
    jumpToImage,
    finish,
    resetCompression,
  } = useImageCompression();

  const [jumpValue, setJumpValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const imageResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === "compress" && imageResultRef.current) {
      setTimeout(() => {
        imageResultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 300);
    }
  }, [step]);

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (!currentImage) {
      setPreviewUrl("");
      return;
    }
    const blob = currentImage.compressedBlob || currentImage.originalBlob;
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [images, currentIndex]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!isNaN(num)) {
      jumpToImage(num);
    }
  };

  const compressionPercent = currentImage
    ? (
        ((currentImage.originalSize - currentImage.compressedSize) /
          currentImage.originalSize) *
        100
      ).toFixed(1)
    : "0";

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex-1 px-4">
          <Intro />

          {step === "upload" && (
            <div className="animate-fadeIn animate-delay-200">
              <DropZone
                onFilesSelected={handleImageUpload}
                hasCompressedImages={false}
              />
            </div>
          )}

          {step === "compress" && hasImages && (
            <div
              className="animate-fadeIn animate-delay-200 py-6"
              ref={imageResultRef}
            >
              {/* Top bar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Картинка
                  </span>
                  <span className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-bold">
                    {currentIndex + 1} / {images.length}
                  </span>
                </div>
                <form
                  onSubmit={handleJump}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    min={1}
                    max={images.length}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    placeholder="№"
                    className="border-input h-8 w-20 rounded-md border px-2 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Перейти
                  </Button>
                </form>
              </div>

              {/* Image preview */}
              <div className="relative mb-6 overflow-hidden rounded-xl border bg-black/5 dark:bg-white/5">
                <div className="flex aspect-video items-center justify-center p-4">
                  {currentImage && previewUrl && (
                    <img
                      src={previewUrl}
                      alt={currentImage.path}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Info + Quality */}
              <div className="mb-6 rounded-lg border p-4">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                  <FileImage className="text-muted-foreground size-4" />
                  <span className="font-mono text-xs">
                    {currentImage?.path.split("/").pop()}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-destructive">
                    {formatBytes(currentImage?.originalSize || 0)}
                  </span>
                  <ArrowRight className="size-3" />
                  <span className="text-success">
                    {formatBytes(currentImage?.compressedSize || 0)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({compressionPercent}%)
                  </span>
                </div>

                <ImageQualitySlider
                  key={currentIndex}
                  value={quality}
                  onImageQualityChange={onImageQualityChange}
                />
              </div>

              {/* Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={prevImage}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="mr-1 size-4" />
                  Назад
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="default"
                    onClick={nextImage}
                    disabled={currentIndex === images.length - 1}
                  >
                    Далее
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={finish}
                    disabled={loading}
                  >
                    <Download className="mr-1 size-4" />
                    Закончить
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="animate-fadeIn flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-6xl">🎓</div>
              <h2 className="mb-2 text-2xl font-bold">Диплом сжат!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Ваш документ был успешно обработан и сжат. Если он всё ещё
                тяжёлый — попробуйте режим ШАКАЛЫ.
              </p>
              <Button onClick={resetCompression}>
                <RotateCcw className="mr-1 size-4" />
                Сжать ещё один
              </Button>
            </div>
          )}

          <Footer />
          <Toaster />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
