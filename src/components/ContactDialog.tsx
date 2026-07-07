import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSiteContent } from "@/lib/site-content-context";
import { Check, Copy, ExternalLink } from "lucide-react";

export function ContactDialog() {
  const { isContactOpen, setContactOpen, content } = useSiteContent();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");

  const services = [
    "Web Design & Development",
    "SEO Optimization",
    "UX/UI Design",
    "Branding",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok) {
        setRecipient(data.recipient || "mroraaii1@gmail.com");
        setSubmitted(true);
      } else {
        throw new Error(data?.error || "Failed to send inquiry.");
      }
    } catch (err: any) {
      console.error("Inquiry submission error:", err);
      setError(err?.message || "There was a problem sending your inquiry. Please try again or copy details to send manually.");
    } finally {
      setSending(false);
    }
  };

  const getFormattedMessage = () => {
    return `Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Service: ${formData.service}
Details: ${formData.message}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setContactOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        message: "",
      });
    }, 300);
  };

  return (
    <Dialog open={isContactOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      else setContactOpen(true);
    }}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-950 border border-white/10 text-white rounded-2xl p-6 md:p-8 overflow-hidden z-50">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-3xl font-extrabold text-white tracking-tight">
                Let's <span className="text-[color:var(--lime)]">Talk</span>
              </DialogTitle>
              <DialogDescription className="text-white/60 text-sm">
                Share your details with us and we'll help build something unforgettable.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-white/50">Full Name</Label>
                <Input
                  id="contact-name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-[color:var(--lime)] focus-visible:border-[color:var(--lime)] h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-xs font-semibold uppercase tracking-wider text-white/50">Contact Number</Label>
                  <Input
                    id="contact-phone"
                    required
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-[color:var(--lime)] focus-visible:border-[color:var(--lime)] h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-white/50">Email Address</Label>
                  <Input
                    id="contact-email"
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-[color:var(--lime)] focus-visible:border-[color:var(--lime)] h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-white/50 block">Which service do you need?</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {services.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setFormData({ ...formData, service })}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-all border cursor-pointer ${
                        formData.service === service
                          ? "bg-[color:var(--lime)] text-black border-[color:var(--lime)] font-semibold shadow-[0_0_12px_rgba(198,255,61,0.2)]"
                          : "bg-white/5 text-white/80 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-white/50">Tell us about your project</Label>
                <Textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Explain what you want to build, details, timelines, etc..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-[color:var(--lime)] focus-visible:border-[color:var(--lime)] min-h-[100px]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending || !formData.service || !formData.name || !formData.phone || !formData.email}
                className="w-full justify-center pill py-3 text-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Request
                    <span aria-hidden>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--lime)]/10 text-[color:var(--lime)] border border-[color:var(--lime)]/20 animate-bounce">
              <Check className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Inquiry Sent!</h3>
              <p className="text-sm text-white/60 max-w-sm mx-auto">
                We've sent your request to <span className="text-[color:var(--lime)] font-semibold">{recipient}</span>.
              </p>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                Your request has been delivered. We will get back to you shortly.
              </p>
            </div>

            <div className="relative rounded-xl border border-white/5 bg-black/60 p-4 text-left font-mono text-xs text-white/80 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {getFormattedMessage()}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2.5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/5 transition-all text-white cursor-pointer flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Details"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 pill py-2.5 text-center text-sm cursor-pointer justify-center flex items-center gap-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
