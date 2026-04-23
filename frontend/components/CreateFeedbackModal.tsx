"use client";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedbackService";

interface CreateFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateFeedbackModal({ isOpen, onClose }: CreateFeedbackModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<number>(5); // Default to Other
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => feedbackService.submitFeedback(title, content, category, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || "Failed to submit feedback.");
    }
  });

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalCount = files.length + newFiles.length;

      if (totalCount > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`);
        return;
      }

      for (const file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`File "${file.name}" exceeds the 10MB limit.`);
          return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`File "${file.name}" has an unsupported format. Only JPG, PNG, and PDF allowed.`);
          return;
        }
      }

      setError("");
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setCategory(5);
    setFiles([]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-background/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-brand-surface rounded-2xl shadow-premium border border-brand-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-text-main">New Feedback Thread</h2>
            <button onClick={handleClose} className="text-brand-text-muted hover:text-brand-text-main transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-6"
          >
            {error && (
              <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm rounded-xl animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-brand-text-main mb-2">Subject / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your feedback"
                className="w-full px-4 py-3 rounded-xl bg-brand-background/30 border border-brand-primary/10 focus:border-brand-secondary outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text-main mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-brand-background border border-brand-primary/10 focus:border-brand-secondary outline-none transition-all appearance-none cursor-pointer text-brand-text-main font-medium"
                required
              >
                <option value={0}>Facilities & Infrastructure</option>
                <option value={1}>Academic & Curriculum</option>
                <option value={2}>Student Affairs</option>
                <option value={3}>Canteen & Services</option>
                <option value={4}>Reporting & Safety</option>
                <option value={5}>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text-main mb-2">Details</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us more about your feedback..."
                className="w-full px-4 py-3 rounded-xl bg-brand-background/30 border border-brand-primary/10 focus:border-brand-secondary outline-none transition-all min-h-[120px] resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text-main mb-2">Proof / Attachments (Optional)</label>
              <div className="flex flex-wrap gap-3">
                {files.map((file, index) => (
                  <div key={index} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-brand-primary/10 bg-brand-background/50">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <svg className="w-6 h-6 text-brand-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[8px] font-bold text-brand-text-muted mt-1 truncate w-full px-1">{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute inset-0 bg-brand-error/60 text-brand-background opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 rounded-xl border-2 border-dashed border-brand-primary/20 flex flex-col items-center justify-center text-brand-primary/40 hover:border-brand-primary/40 hover:text-brand-primary/60 transition-all bg-brand-primary/5 group"
                  >
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-[10px] font-bold mt-1 uppercase">Add Proof</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                />
              </div>
              <p className="mt-2 text-[10px] text-brand-text-body/40 italic flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Max 5 files, 10MB each. Types: JPG, PNG, PDF.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-brand-primary/10 text-brand-text-main font-semibold rounded-xl hover:bg-brand-primary/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-6 py-3 bg-brand-primary text-brand-background font-bold rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
