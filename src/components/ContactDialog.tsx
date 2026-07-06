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

  const services = [
    "Web Design & Development",
    "SEO Optimization",
    "UX/UI Design",
    "Branding",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = `Project Inquiry from ${formData.name}`;
    const body = `Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Service Needed: ${formData.service}

Project Details:
${formData.message}`;

    const emailTo = content?.contact?.email || "mroraai11@gmail.com";
    const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoUrl;
    setSubmitted(true);
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
                disabled={!formData.service || !formData.name || !formData.phone || !formData.email}
                className="w-full justify-center pill py-3 text-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
              >
                Send Request
                <span aria-hidden>→</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--lime)]/10 text-[color:var(--lime)] border border-[color:var(--lime)]/20 animate-bounce">
              <Check className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Inquiry Prepared!</h3>
              <p className="text-sm text-white/60 max-w-sm mx-auto">
                We've launched your email client to send this request to <span className="text-[color:var(--lime)] font-semibold">{content?.contact?.email || "mroraai11@gmail.com"}</span>.
              </p>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                If the email app did not open, you can copy the details below and send it manually.
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
                onClick={() => {
                  const subject = `Project Inquiry from ${formData.name}`;
                  const body = `Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Service Needed: ${formData.service}

Project Details:
${formData.message}`;
                  const mailtoUrl = `mailto:${content?.contact?.email || "mroraai11@gmail.com"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  window.location.href = mailtoUrl;
                }}
                className="flex-1 pill py-2.5 text-center text-sm cursor-pointer justify-center flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Mail App
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
