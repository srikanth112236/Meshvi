import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Globe,
  Lock,
  Image as ImageIcon,
  Sparkles,
  Hash,
  AlertCircle,
  Trash2,
  Plus,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  validatePartnershipMandateApi,
  MandateValidationAnalysis,
} from '../../services/aiService';
import {
  PartnershipPost,
  getStoredPosts,
  saveStoredPosts,
  getRegisteredHashtags,
  registerNewHashtag,
  HashtagItem,
} from '../../data/partnershipsData';

const CORPORATE_BANNER_PRESETS = [
  {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cross-border',
    label: 'Cross-Border JV & Trade',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tech-cloud',
    label: 'Enterprise Infrastructure',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pharma-health',
    label: 'Pharma & Biotech Corridors',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: PartnershipPost) => void;
}

export const CreatePartnershipPostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [visibility, setVisibility] = useState<'CONNECTIONS_ONLY' | 'PUBLIC'>('PUBLIC');
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(['partnership', 'b2bcommerce']);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  // Preview Mode Toggle
  const [isPreview, setIsPreview] = useState(false);

  // AI Mandate Sentinel States
  const [validationResult, setValidationResult] = useState<MandateValidationAnalysis | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Selected Mandate Intent
  const [selectedIntent, setSelectedIntent] = useState<string>('jointventure');

  // Dynamic hashtag registry list
  const [registeredTags, setRegisteredTags] = useState<HashtagItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const tagContainerRef = useRef<HTMLDivElement | null>(null);
  const audienceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRegisteredTags(getRegisteredHashtags());
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isTagDropdownOpen) {
          setIsTagDropdownOpen(false);
        } else if (isAudienceDropdownOpen) {
          setIsAudienceDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isTagDropdownOpen, isAudienceDropdownOpen]);

  // Click outside tag dropdown & audience dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagContainerRef.current && !tagContainerRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
      if (audienceRef.current && !audienceRef.current.contains(e.target as Node)) {
        setIsAudienceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // AI Mandate Validation Debounce Effect
  useEffect(() => {
    if (!isOpen) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 5 && trimmedContent.length < 15) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      const res = await validatePartnershipMandateApi({
        title: trimmedTitle,
        content: trimmedContent,
        tags,
      });
      setValidationResult(res);
      setIsValidating(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [title, content, isOpen]);

  const handleManualValidate = async () => {
    if (!title.trim() && !content.trim()) {
      setError('Please enter a title and requirements before verifying.');
      return;
    }
    setError(null);
    setIsValidating(true);
    const res = await validatePartnershipMandateApi({
      title: title.trim(),
      content: content.trim(),
      tags,
    });
    setValidationResult(res);
    setIsValidating(false);
  };

  const handleApplySuggestedRewrite = () => {
    if (!validationResult?.suggestedRewrite) return;
    setTitle(validationResult.suggestedRewrite.title);
    setContent(validationResult.suggestedRewrite.content);
    setValidationResult({
      isCompliant: true,
      score: 95,
      classification: 'COMMERCIAL_PARTNERSHIP',
      flagReason: null,
      politeFeedback:
        'Successfully converted to executive B2B format with clear bilateral scope and counterpart criteria.',
      suggestedRemedy: null,
      suggestedRewrite: null,
      detectedThemes: ['B2B Partnership', 'Strategic Alliance', 'Commercial Agreement'],
    });
    setError(null);
  };

  // Compute tag suggestions based on typed input
  const tagSuggestions = useMemo(() => {
    const clean = tagInput.replace(/^#/, '').trim().toLowerCase();
    if (!clean) return [];

    const matches = registeredTags.filter((item) =>
      item.tag.toLowerCase().includes(clean)
    );

    return matches.slice(0, 7);
  }, [tagInput, registeredTags]);

  const cleanTypedTag = tagInput.replace(/^#/, '').trim().toLowerCase();

  if (!isOpen) return null;

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

  const addTag = (rawTag: string) => {
    const clean = rawTag.replace(/^#/, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) return;
    if (tags.length >= 15) {
      setError('Maximum 15 tags allowed per post.');
      return;
    }
    if (tags.includes(clean)) {
      setTagInput('');
      setIsTagDropdownOpen(false);
      return;
    }
    setTags([...tags, clean]);
    registerNewHashtag(clean);
    setRegisteredTags(getRegisteredHashtags());
    setTagInput('');
    setIsTagDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
    setError(null);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a partnership title.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide a partnership description.');
      return;
    }

    // Guardrail Check before submission
    let check = validationResult;
    if (!check) {
      setIsValidating(true);
      check = await validatePartnershipMandateApi({
        title: title.trim(),
        content: content.trim(),
        tags,
      });
      setIsValidating(false);
      setValidationResult(check);
    }

    if (check && !check.isCompliant) {
      setError(
        'Submission Blocked: MESHVI Partnerships is reserved exclusively for bilateral commercial partnerships, joint ventures, co-investments, supplier alliances, or corporate business interests. Please review the AI guidance below and revise your post or click "Convert to Corporate Mandate".',
      );
      setIsPreview(false);
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Ensure all current tags are persisted into the registry
    tags.forEach((t) => registerNewHashtag(t));

    const newPost: PartnershipPost = {
      id: `post-${Date.now()}`,
      authorId: user?.id || 'current-user',
      authorName: user?.profile?.displayName || user?.email?.split('@')[0] || 'Executive Leader',
      authorRole: user?.profile?.currentTitle || 'Verified Business Executive',
      authorCompany: user?.profile?.company?.name || 'Corporate Enterprise',
      authorAvatar: user?.profile?.avatarUrl || null,
      authorBadges: [
        { type: 'SIGNATORY', label: 'Authorized Commercial Signatory' },
        { type: 'FULFILLMENT', label: 'Verified Annual Fulfillment: $10M+' },
        { type: 'SLA', label: 'Response SLA: < 24 Hours' },
      ],
      title: title.trim(),
      content: content.trim(),
      imageUrl: imagePreview || null,
      visibility,
      tags,
      likesCount: 0,
      commentsCount: 0,
      resharesCount: 0,
      impressionsCount: 1,
      isLiked: false,
      createdAt: new Date().toISOString(),
      comments: [],
      analytics: {
        uniqueViewers: 1,
        dailyViews: [{ date: 'Today', views: 1 }],
      },
    };

    const existing = getStoredPosts();
    const updated = [newPost, ...existing];
    saveStoredPosts(updated);

    if (onPostCreated) {
      onPostCreated(newPost);
    }

    // Reset & close
    setTitle('');
    setContent('');
    setImagePreview(null);
    setImageName('');
    setTags(['partnership', 'b2bcommerce']);
    setTagInput('');
    setError(null);
    setValidationResult(null);
    setIsValidating(false);
    setIsPreview(false);
    onClose();
  };

  const authorDisplayName = user?.profile?.displayName || user?.email?.split('@')[0] || 'Executive Leader';
  const authorRole = user?.profile?.currentTitle || 'Verified Business Executive';
  const authorCompany = user?.profile?.company?.name || 'Corporate Enterprise';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-surface border border-border w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Fixed Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-muted/40 shrink-0">
          <div className="flex items-center space-x-2.5">
            {user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt={authorDisplayName}
                className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {authorDisplayName[0]?.toUpperCase() || 'E'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-navy truncate max-w-[140px] sm:max-w-[200px]">
                  {authorDisplayName}
                </span>

                {/* Audience Pill with dropdown */}
                <div className="relative" ref={audienceRef}>
                  <button
                    type="button"
                    onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-border bg-surface hover:bg-surface-muted text-navy transition-colors cursor-pointer"
                  >
                    {visibility === 'PUBLIC' ? (
                      <>
                        <Globe className="w-2.5 h-2.5 text-primary" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>Connections</span>
                      </>
                    )}
                    <ChevronDown className="w-2.5 h-2.5 text-text-muted" />
                  </button>

                  {isAudienceDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-52 bg-surface border border-border rounded-xl shadow-lg z-20 py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setVisibility('PUBLIC');
                          setIsAudienceDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start space-x-2 hover:bg-surface-muted ${
                          visibility === 'PUBLIC' ? 'font-bold text-primary bg-primary/5' : 'text-navy'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                        <div>
                          <div>Global Deal Exchange</div>
                          <div className="text-[10px] text-text-muted font-normal">
                            All verified members + institutional network
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVisibility('CONNECTIONS_ONLY');
                          setIsAudienceDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start space-x-2 hover:bg-surface-muted ${
                          visibility === 'CONNECTIONS_ONLY' ? 'font-bold text-primary bg-primary/5' : 'text-navy'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
                        <div>
                          <div>Only Connections</div>
                          <div className="text-[10px] text-text-muted font-normal">
                            1st-degree verified network only
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-text-muted truncate max-w-[200px] sm:max-w-[280px]">
                {authorRole} • {authorCompany}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Preview Toggle Pill */}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                isPreview
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface hover:bg-surface-muted text-navy border-border'
              }`}
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 text-primary" />
                  <span>Preview</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div
          ref={modalScrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-border/40"
          style={{ scrollbarWidth: 'thin' }}
        >
          {error && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* PREVIEW MODE */}
          {isPreview ? (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl border border-primary/20 bg-surface shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-navy">{authorDisplayName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] text-text-muted">
                      • {visibility === 'PUBLIC' ? 'Public' : 'Connections Only'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted">Just now</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                    Authorized Commercial Signatory
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-surface-muted text-navy border border-border">
                    Verified Fulfillment: $10M+
                  </span>
                </div>

                <h4 className="text-sm font-bold text-navy leading-snug">
                  {title || <span className="text-text-muted italic">Partnership Title goes here...</span>}
                </h4>

                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                  {content || <span className="italic">Partnership mandate requirements go here...</span>}
                </p>

                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-border max-h-48 mt-2">
                    <img src={imagePreview} alt="Attached Media" className="w-full h-full object-cover" />
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-muted text-primary">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Compliance Status in Preview */}
              {validationResult && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    validationResult.isCompliant
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                      : 'bg-red-50/90 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    {validationResult.isCompliant ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    )}
                    <span>
                      {validationResult.isCompliant
                        ? 'Ready to Broadcast: Bilateral Commercial Intent Confirmed'
                        : 'Blocked: Content Flagged by Meshvi AI Guardrail'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70">
                    {validationResult.score}/100
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* COMPACT EDIT MODE */
            <div className="space-y-3 pt-1">
              {/* Partnership Title Input */}
              <div>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Partnership Title (e.g. Seeking Joint Venture Supplier for Regional Aviation Concessions)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-muted/30 border border-border rounded-xl text-xs font-bold text-navy placeholder:text-text-muted/70 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              {/* Mandate Type Quick-Selector Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-0.5">
                  Type:
                </span>
                {[
                  { id: 'jointventure', label: '🤝 Joint Venture', tag: 'jointventure' },
                  { id: 'distribution', label: '📦 Distribution & Channel', tag: 'distribution' },
                  { id: 'sourcing', label: '🏭 OEM & Sourcing', tag: 'oemsourcing' },
                  { id: 'investment', label: '💰 Co-Investment', tag: 'coinvestment' },
                  { id: 'licensing', label: '⚡ Tech Licensing', tag: 'techlicensing' },
                  { id: 'crossborder', label: '🌐 Cross-Border Corridor', tag: 'crossborder' },
                ].map((m) => {
                  const isSelected = selectedIntent === m.id || tags.includes(m.tag);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedIntent(m.id);
                        if (!tags.includes(m.tag)) {
                          setTags([...tags, m.tag]);
                        }
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                          : 'bg-surface border-border text-navy hover:bg-surface-muted'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Partnership Mandate Text Box Style Editor */}
              <div>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline your bilateral objective, target counterparty credentials, volume requirements, or co-investment scope..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full px-3 py-2 bg-surface border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted/70 focus:outline-none focus:ring-1 transition-all resize-none leading-relaxed ${
                    validationResult && !validationResult.isCompliant
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/10'
                      : 'border-border focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>

              {/* AI SENTINEL PROGRESSIVE STATUS CONTAINER */}
              {isValidating && (
                <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center space-x-2 text-xs text-blue-800 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                  <span className="font-semibold text-[11px]">
                    Evaluating commercial mandate & bilateral intent with Gemini 2.5 Flash...
                  </span>
                </div>
              )}

              {!isValidating && validationResult && !validationResult.isCompliant && (
                <div className="p-2.5 rounded-xl border border-red-200 bg-red-50/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-red-800 font-bold text-xs">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>Corporate Mandate Required</span>
                    </div>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-200/90 text-red-800">
                      Score: {validationResult.score}/100
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-red-950">
                    <div className="flex items-start space-x-1.5">
                      <span className="text-red-600 font-bold shrink-0">🚫</span>
                      <span><strong>Issue:</strong> {validationResult.flagReason || 'Personal career milestone or non-commercial content.'}</span>
                    </div>
                    <div className="flex items-start space-x-1.5">
                      <span className="text-emerald-600 font-bold shrink-0">💡</span>
                      <span><strong>Fix:</strong> {validationResult.suggestedRemedy || 'Specify target counterparty credentials or bilateral volume scope.'}</span>
                    </div>
                  </div>

                  {validationResult.suggestedRewrite && (
                    <div className="pt-1.5 border-t border-red-200/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-600 italic truncate">
                        1-click convert to executive B2B proposal
                      </span>
                      <button
                        type="button"
                        onClick={handleApplySuggestedRewrite}
                        className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-xs flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Convert to Corporate Mandate</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isValidating && validationResult && validationResult.isCompliant && (
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Bilateral Partnership Mandate</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Quality: {validationResult.score}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 font-medium">
                    {validationResult.politeFeedback}
                  </p>
                  {validationResult.detectedThemes?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {validationResult.detectedThemes.map((theme, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800"
                        >
                          #{theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Banner / Image Selection Section */}
              {imagePreview ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface-muted/40 text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <img
                      src={imagePreview}
                      alt="Thumbnail"
                      className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 shadow-2xs"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-navy truncate max-w-[240px]">
                        {imageName || 'Attached Corporate Banner'}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready to broadcast</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageName('');
                      }}
                      className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-3 bg-surface-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-navy">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span>Attach Corporate Visual Banner / Media</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-surface border border-border hover:border-primary text-primary text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Image</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-text-muted">Or select an executive preset:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CORPORATE_BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setImagePreview(preset.url);
                          setImageName(preset.label);
                        }}
                        className="group relative rounded-lg overflow-hidden border border-border hover:border-primary transition-all text-left bg-surface shadow-2xs cursor-pointer"
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-10 object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="p-1 text-[10px] font-bold text-navy truncate">
                          {preset.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Hashtags Chips Row */}
              <div className="space-y-1.5" ref={tagContainerRef}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-surface-muted border border-border text-xs text-primary font-medium"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-text-muted hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {showTagInput ? (
                    <div className="relative inline-block">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setIsTagDropdownOpen(true);
                        }}
                        onKeyDown={handleTagInputKeyDown}
                        className="px-2 py-0.5 rounded-lg border border-primary text-xs bg-surface text-navy focus:outline-none w-28"
                      />

                      {/* Tag Autocomplete Dropdown */}
                      {isTagDropdownOpen && tagSuggestions.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 w-44 bg-surface border border-border rounded-xl shadow-lg z-30 py-1 text-xs">
                          {tagSuggestions.map((item, idx) => (
                            <div
                              key={item.tag}
                              onClick={() => addTag(item.tag)}
                              className={`px-2.5 py-1.5 cursor-pointer flex items-center justify-between hover:bg-surface-muted ${
                                idx === selectedSuggestionIndex ? 'bg-primary/10 text-primary font-bold' : 'text-navy'
                              }`}
                            >
                              <span>#{item.tag}</span>
                              <span className="text-[10px] text-text-muted">{item.category}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg border border-dashed border-border hover:border-primary text-[11px] text-text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Tag</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for Image */}
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

        {/* Fixed Footer Toolbar */}
        <div className="px-4 py-2.5 border-t border-border bg-surface-muted/30 flex items-center justify-between gap-2 shrink-0">
          {/* Left: Compact Icon Row Action Bar */}
          <div className="flex items-center space-x-1">
            {/* Photo / Media Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-colors cursor-pointer ${
                imagePreview
                  ? 'border-primary/40 bg-primary/10 text-primary font-bold'
                  : 'border-transparent text-text-muted hover:text-navy hover:bg-surface-muted'
              }`}
              title="Add Image Banner"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Photo</span>
            </button>

            {/* Tag Button */}
            <button
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-1.5 rounded-lg border border-transparent text-text-muted hover:text-navy hover:bg-surface-muted text-xs flex items-center space-x-1 transition-colors cursor-pointer"
              title="Manage Hashtags"
            >
              <Hash className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Tags</span>
            </button>

            {/* AI Verify Button / Status Pill */}
            {isValidating ? (
              <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Analyzing</span>
              </span>
            ) : validationResult ? (
              <button
                type="button"
                onClick={handleManualValidate}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border cursor-pointer ${
                  validationResult.isCompliant
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
                title="Re-check mandate with Gemini"
              >
                {validationResult.isCompliant ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-3 h-3 text-red-600" />
                )}
                <span>{validationResult.score}%</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleManualValidate}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 flex items-center space-x-1 transition-colors cursor-pointer"
                title="Verify Mandate with AI"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Verify AI</span>
              </button>
            )}
          </div>

          {/* Right: Submit Button */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-surface hover:bg-surface-muted text-navy font-semibold text-xs rounded-xl border border-border transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isValidating || (validationResult !== null && !validationResult.isCompliant)}
              className={`px-4 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 ${
                validationResult !== null && !validationResult.isCompliant
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed opacity-85'
                  : isValidating
                  ? 'bg-blue-600 text-white opacity-70 cursor-wait'
                  : 'bg-primary hover:bg-primary-dark text-white cursor-pointer'
              }`}
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : validationResult !== null && !validationResult.isCompliant ? (
                <>
                  <ShieldAlert className="w-3 h-3 text-amber-700" />
                  <span>Revise Mandate</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
