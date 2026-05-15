import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Download, Image as ImageIcon, Lock, Unlock, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('resized-image');
  const [fileType, setFileType] = useState<string>('image/png');
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [targetWidth, setTargetWidth] = useState<string>('');
  const [targetHeight, setTargetHeight] = useState<string>('');
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件 / Please upload an image file');
      return;
    }

    setFileType(file.type);
    setFileName(file.name.split('.')[0]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setOriginalSize({ width: img.width, height: img.height });
        setTargetWidth(img.width.toString());
        setTargetHeight(img.height.toString());
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value;
    setTargetWidth(newWidth);

    if (lockRatio && originalSize && newWidth !== '') {
      const parsedWidth = parseFloat(newWidth);
      if (!isNaN(parsedWidth)) {
        const ratio = originalSize.height / originalSize.width;
        setTargetHeight(Math.round(parsedWidth * ratio).toString());
      }
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value;
    setTargetHeight(newHeight);

    if (lockRatio && originalSize && newHeight !== '') {
      const parsedHeight = parseFloat(newHeight);
      if (!isNaN(parsedHeight)) {
        const ratio = originalSize.width / originalSize.height;
        setTargetWidth(Math.round(parsedHeight * ratio).toString());
      }
    }
  };

  const handleDownload = () => {
    if (!imageSrc || targetWidth === '' || targetHeight === '') return;

    const width = parseInt(targetWidth, 10);
    const height = parseInt(targetHeight, 10);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      alert('请输入有效的宽高 / Please enter valid dimensions');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(fileType);
        
        const ext = fileType.split('/')[1] || 'png';
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${fileName}-resized.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.src = imageSrc;
  };

  const clearImage = () => {
    setImageSrc(null);
    setOriginalSize(null);
    setTargetWidth('');
    setTargetHeight('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans flex flex-col">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <ImageIcon className="w-6 h-6 text-indigo-600" />
        <h1 className="text-xl font-semibold tracking-tight text-neutral-800">图片尺寸修改器 / Image Resizer</h1>
      </header>

      <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Editor Area */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col min-h-[400px]">
          {!imageSrc ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors border-2 border-dashed m-6 rounded-xl ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-800">拖拽图片到这里，或点击上传</p>
                  <p className="text-sm text-neutral-500 mt-1">支持 PNG, JPG, WEBP 等格式</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  选择图片
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative bg-neutral-50/50">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={clearImage}
                  className="w-10 h-10 bg-white/90 hover:bg-white text-neutral-600 hover:text-red-600 shadow-sm rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-neutral-200 cursor-pointer"
                  title="清除图片 / Clear image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-auto">
                <div className="relative w-full h-full flex items-center justify-center min-h-[300px]">
                  {/* Checkerboard background for transparent images */}
                  <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIiAvPgogIDxyZWN0IHg9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmZmZmYiIC8+CiAgPHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZmZmZiIgLz4KICA8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YwZjBmMCIgLz4KPC9zdmc+')] opacity-50 rounded-lg"></div>
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain relative z-10 shadow-lg rounded-lg border border-neutral-200/50 block"
                  />
                </div>
              </div>
              {originalSize && (
                <div className="bg-white border-t border-neutral-200 px-6 py-3 flex justify-between items-center text-sm">
                  <span className="text-neutral-500">原图尺寸 / Original</span>
                  <span className="font-mono bg-neutral-100 px-2 py-1 rounded text-neutral-700">
                    {originalSize.width} &times; {originalSize.height} px
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Controls Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col gap-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-1">图片设置 / Settings</h2>
            <p className="text-sm text-neutral-500">调整想要导出的尺寸。</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="widthInput" className="text-sm font-medium text-neutral-700 block">
                宽度 / Width (px)
              </label>
              <input
                id="widthInput"
                type="number"
                value={targetWidth}
                onChange={handleWidthChange}
                disabled={!imageSrc}
                placeholder="例如: 800"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-neutral-800"
              />
            </div>

            <div className="flex items-center justify-center my-2 relative">
              <div className="absolute left-0 right-0 h-px bg-neutral-200"></div>
              <button
                onClick={() => setLockRatio(!lockRatio)}
                disabled={!imageSrc}
                className="relative z-10 w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title={lockRatio ? "解锁纵横比 / Unlock ratio" : "锁定纵横比 / Lock ratio"}
              >
                {lockRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="heightInput" className="text-sm font-medium text-neutral-700 block">
                高度 / Height (px)
              </label>
              <input
                id="heightInput"
                type="number"
                value={targetHeight}
                onChange={handleHeightChange}
                disabled={!imageSrc}
                placeholder="例如: 600"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-neutral-800"
              />
            </div>
            
            {(targetWidth || targetHeight) && imageSrc && (
              <div className="pt-2">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs font-medium text-indigo-800">目标尺寸:</span>
                  <span className="text-sm font-mono font-semibold text-indigo-700">
                    {targetWidth || '?'} &times; {targetHeight || '?'} px
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-neutral-100">
            <button
              onClick={handleDownload}
              disabled={!imageSrc}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-black text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              <Download className="w-5 h-5" />
              导出图片 / Export
            </button>
          </div>
        </motion.aside>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
