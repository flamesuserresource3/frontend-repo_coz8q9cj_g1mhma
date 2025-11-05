import React from 'react';
import { Upload } from 'lucide-react';

const FilePicker = ({ onFilesSelected }) => {
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    onFilesSelected(files);
    // reset to allow selecting the same files again
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <label className="flex items-center justify-center gap-3 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 hover:bg-white/10 transition">
        <Upload className="h-5 w-5 text-slate-200" />
        <span className="font-medium">Add audio files</span>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </label>
      <p className="mt-2 text-xs text-slate-400 text-center">MP3, WAV, OGG and more. Files stay local to your browser.</p>
    </div>
  );
};

export default FilePicker;
