// src/components/image-quality-slider.tsx
const ImageQualitySlider = ({
  value,
  onImageQualityChange,
}: {
  value: number;
  onImageQualityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const getImageQualityInfo = (q: number) => {
    if (q === 0) return { label: "ШАКАЛЫ", color: "#e14f42" };
    if (q === 20) return { label: "ПОТЕРЯННЫЕ ПИКСЕЛИ", color: "#f3d35f" };
    if (q === 40) return { label: "2007 КОЛЛИНТА", color: "#f3a235" };
    if (q === 60) return { label: "БАЛАНС", color: "#3fc97f" };
    if (q === 80) return { label: "ПРЕМИУМ", color: "#2baf6b" };
    if (q === 100) return { label: "БЕЗ ИЗМЕНЕНИЙ", color: "#6366f1" };
    return { label: "", color: "#000" };
  };

  const { label, color } = getImageQualityInfo(value);

  return (
    <div className="w-full">
      <label className="text-base font-bold">
        Степень сжатия: {value}%
        <span style={{ color }} className="ml-1">
          ({label})
        </span>
      </label>
      <p className="text-muted-foreground text-sm">
        Чем меньше — тем меньше вес, но больше артефактов
      </p>
      <div className="relative mb-4">
        <input
          type="range"
          className="range range-sm h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          value={value}
          min={0}
          max={100}
          step={20}
          onChange={onImageQualityChange}
        />
        <div className="mt-1 flex justify-between text-xs font-bold">
          <span className="text-destructive">ШАКАЛЫ</span>
          <span className="text-warning">ПИКСЕЛИ</span>
          <span className="text-warning">2007</span>
          <span className="text-success">БАЛАНС</span>
          <span className="text-success">ПРЕМИУМ</span>
          <span className="text-[#6366f1]">ОРИГИНАЛ</span>
        </div>
      </div>
    </div>
  );
};

export default ImageQualitySlider;
