import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  isDragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadArea({
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onFileInputChange,
}: FileUploadAreaProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
        isDragOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-muted/20"
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onFileSelect}
    >
      <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Upload XML File
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-3">
        Drop your XML file here or click to browse
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Supports .xml, .arxml, .xsd, .svg files
      </p>
      <input
        type="file"
        accept=".xml,.arxml,.xsd,.svg,.rss,.atom"
        onChange={onFileInputChange}
        className="hidden"
        id="file-input"
      />
    </div>
  );
}
