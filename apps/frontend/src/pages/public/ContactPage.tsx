import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, Building, User } from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    enquiryType: 'Business Partnerships',
    message: '',
    consent: false,
  });

  const [status, setStatus] = useState<{
    loading: boolean;
    success?: string;
    error?: string;
  }>({ loading: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setStatus({ loading: false, error: 'You must agree to the privacy policy to submit your enquiry.' });
      return;
    }

    setStatus({ loading: true });

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to submit enquiry.');
      }

      setStatus({
        loading: false,
        success: data.data?.message || 'Thank you! Your enquiry has been received.',
      });
      setFormData({
        name: '',
        email: '',
        company: '',
        enquiryType: 'Business Partnerships',
        message: '',
        consent: false,
      });
    } catch (err: any) {
      setStatus({
        loading: false,
        error: err.message || 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info Left */}
        <div className="space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Get in Touch</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight leading-tight">
            Contact MESHVI
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Have questions about our data strategy, company claims, or want to discuss a pilot partnership? We’d be glad to connect.
          </p>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="text-sm font-bold text-navy">Direct Points of Contact</h3>
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>inquiries@projectsetu.local</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <Building className="w-4 h-4 text-primary shrink-0" />
              <span>Vedasynk Technologies — Bengaluru & International Operations</span>
            </div>
          </div>
        </div>

        {/* Form Right */}
        <div className="bg-surface p-8 sm:p-10 rounded-2xl border border-border shadow-sm">
          {status.success ? (
            <div className="p-6 bg-success/10 border border-success/30 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
              <h3 className="text-lg font-bold text-navy">Message Received</h3>
              <p className="text-sm text-text-muted">{status.success}</p>
              <button
                type="button"
                onClick={() => setStatus({ loading: false })}
                className="mt-4 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status.error && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center space-x-3 text-xs text-danger">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                    placeholder="Srikanth M"
                  />
                </div>
              </div>

              {/* Business Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Company (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Company Name (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              {/* Enquiry Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Enquiry Type *
                </label>
                <select
                  value={formData.enquiryType}
                  onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                >
                  <option value="Business Partnerships">Business Partnerships</option>
                  <option value="Company Verification & Claims">Company Verification & Claims</option>
                  <option value="Data Privacy & Profile Correction">Data Privacy & Profile Correction</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-focus focus:outline-none resize-none"
                  placeholder="How can we assist you with your business discovery objective?"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-focus"
                />
                <label htmlFor="consent" className="text-xs text-text-muted">
                  I agree to the processing of my business contact information in accordance with MESHVI’s Privacy Policy.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status.loading}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {status.loading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <Send className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
