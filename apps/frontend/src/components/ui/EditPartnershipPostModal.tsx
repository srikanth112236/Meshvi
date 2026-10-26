import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Globe,
  Lock,
  Image as ImageIcon,
  Hash,
  AlertCircle,
  UploadCloud,
  Trash2,
  Plus,
  Tag,
  Save,
} from 'lucide-react';
import {
  PartnershipPost,
  getRegisteredHashtags,
  registerNewHashtag,
  HashtagItem,
  updateStoredPost,
} from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (updatedPost: PartnershipPost) => void;
}

export const EditPartnershipPostModal: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  onPostUpdated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [visibility, setVisibility] = useState<'CONNECTIONS_ONLY' | 'PUBLIC'>('PUBLIC');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const [registeredTags, setRegisteredTags] = useState<HashtagItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const tagContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setImagePreview(post.imageUrl || null);
      setImageName(post.imageUrl ? 'Current Banner Image' : '');
      setVisibility(post.visibility);
      setTags(post.tags || []);
    }
  }, [post]);

  useEffect(() => {
    if (isOpen) {
      setRegisteredTags(getRegisteredHashtags());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isTagDropdownOpen) {
          setIsTagDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isTagDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagContainerRef.current && !tagContainerRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tagSuggestions = useMemo(() => {
    const clean = tagInput.replace(/^#/, '').trim().toLowerCase();
    if (!clean) return [];

    const matches = registeredTags.filter((item) =>
      item.tag.toLowerCase().includes(clean)
    );

    return matches.slice(0, 7);
  }, [tagInput, registeredTags]);

  const cleanTypedTag = tagInput.replace(/^#/, '').trim().toLowerCase();
  const exactMatchExists = registeredTags.some(
    (item) => item.tag.toLowerCase() === cleanTypedTag
  );

  if (!isOpen || !post) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }
    setError(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = (raw: string) => {
    const clean = raw.replace(/^#/, '').trim().toLowerCase();
    if (!clean) return;

    if (tags.includes(clean)) {
      setTagInput('');
      setIsTagDropdownOpen(false);
      return;
    }

    if (tags.length >= 15) {
      setError('A post can contain a maximum of 15 hashtags.');
      setIsTagDropdownOpen(false);
      return;
    }

    registerNewHashtag(clean);
    setRegisteredTags(getRegisteredHashtags());

    setTags((prev) => [...prev, clean]);
    setTagInput('');
    setIsTagDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
    setError(null);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isTagDropdownOpen && tagSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < tagSuggestions.length - 1 ? prev + 1 : prev
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      }
    }

    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && tagSuggestions[selectedSuggestionIndex]) {
        addTag(tagSuggestions[selectedSuggestionIndex].tag);
      } else if (cleanTypedTag) {
        addTag(cleanTypedTag);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide a description.');
      return;
    }

    tags.forEach((t) => registerNewHashtag(t));

    const updated = updateStoredPost(post.id, {
      title: title.trim(),
      content: content.trim(),
      imageUrl: imagePreview || null,
      visibility,
      tags,
    });

    if (updated) {
      onPostUpdated(updated);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        className="bg-surface border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">Edit Partnership Post</h3>
              <p className="text-xs text-text-muted">Modify commercial mandate specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Audience & Distribution
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                  visibility === 'PUBLIC'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-surface hover:bg-surface-muted'
                }`}
              >
                <Globe className={`w-4 h-4 mt-0.5 shrink-0 ${visibility === 'PUBLIC' ? 'text-primary' : 'text-text-muted'}`} />
                <div>
                  <div className={`text-xs font-bold ${visibility === 'PUBLIC' ? 'text-primary' : 'text-navy'}`}>
                    Public (Global)
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Connections + matched by hashtags
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('CONNECTIONS_ONLY')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                  visibility === 'CONNECTIONS_ONLY'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-surface hover:bg-surface-muted'
                }`}
              >
                <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${visibility === 'CONNECTIONS_ONLY' ? 'text-primary' : 'text-text-muted'}`} />
                <div>
                  <div className={`text-xs font-bold ${visibility === 'CONNECTIONS_ONLY' ? 'text-primary' : 'text-navy'}`}>
                    Only Connections 🔒
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    1st-degree verified network only
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Partnership Title *
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Description & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Image Banner */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Post Image Banner</span>
              <span className="text-[10px] text-text-muted font-normal">PNG, JPG, WEBP up to 5MB</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-surface-muted/60'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1.5">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-navy">
                  Click to upload media <span className="font-normal text-text-muted">or drag & drop</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl border border-border overflow-hidden bg-surface-muted group">
                <img
                  src={imagePreview}
                  alt="Post banner preview"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-surface text-navy text-xs font-bold rounded-lg shadow hover:bg-surface-muted transition-colors flex items-center space-x-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow hover:bg-rose-700 transition-colors flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
                <div className="p-2 bg-surface text-[11px] text-navy font-semibold truncate border-t border-border flex items-center justify-between">
                  <span className="truncate">{imageName || 'Attached Media Image'}</span>
                  <span className="text-emerald-600 text-[10px] font-bold shrink-0 ml-2">Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Hashtags Input */}
          <div ref={tagContainerRef} className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-primary" />
                <span>Relevant Hashtags (Max 15)</span>
              </label>
              <span className={`text-[11px] font-bold ${tags.length >= 15 ? 'text-amber-600' : 'text-text-muted'}`}>
                {tags.length} / 15 tags
              </span>
            </div>

            <div className="flex gap-2 relative">
              <input
                type="text"
                placeholder="Type hashtag..."
                value={tagInput}
                onFocus={() => {
                  if (cleanTypedTag) setIsTagDropdownOpen(true);
                }}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setIsTagDropdownOpen(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onKeyDown={handleTagKeyDown}
                disabled={tags.length >= 15}
                className="flex-1 px-3.5 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => {
                  if (cleanTypedTag) addTag(cleanTypedTag);
                }}
                disabled={!cleanTypedTag || tags.length >= 15}
                className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 shrink-0"
              >
                Add Tag
              </button>
            </div>

            {/* Smart Popover */}
            {isTagDropdownOpen && cleanTypedTag && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-xl z-40 overflow-hidden divide-y divide-border animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                {tagSuggestions.map((item, idx) => {
                  const isSelected = selectedSuggestionIndex === idx;
                  const isAlreadyAdded = tags.includes(item.tag);
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => addTag(item.tag)}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        isAlreadyAdded
                          ? 'opacity-40 cursor-not-allowed bg-surface-muted/30'
                          : isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-surface-muted text-navy'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-bold">#{item.tag}</span>
                      </div>
                      <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-full bg-surface-muted border border-border">
                        {item.category}
                      </span>
                    </button>
                  );
                })}

                {!exactMatchExists && (
                  <button
                    type="button"
                    onClick={() => addTag(cleanTypedTag)}
                    className="w-full px-3.5 py-2.5 text-left text-xs bg-primary/5 hover:bg-primary/10 text-primary font-bold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create &quot;#{cleanTypedTag}&quot; as new hashtag</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Tag Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors ml-1 font-bold text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
