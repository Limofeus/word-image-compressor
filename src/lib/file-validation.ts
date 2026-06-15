// src/lib/file-validation.ts
import { toast } from "sonner";

export const ALLOWED_FORMATS = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const validateFileType = (file: File): boolean => {
  return (
    ALLOWED_FORMATS.includes(file.type.toLowerCase()) ||
    file.name.toLowerCase().endsWith(".docx")
  );
};

export const filterValidFiles = (files: FileList | File[]): File[] => {
  const filesArray = Array.from(files);
  const validFiles: File[] = [];
  const invalidFiles: File[] = [];

  filesArray.forEach((file) => {
    if (validateFileType(file)) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
  });

  if (invalidFiles.length > 0) {
    const invalidFileNames = invalidFiles.map((file) => file.name).join(", ");
    toast.error(`Неверный файл! Загружайте только DOCX.`, {
      description: invalidFileNames,
      duration: 5000,
      position: "top-right",
    });
  }

  return validFiles;
};
