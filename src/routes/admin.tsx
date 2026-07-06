import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DEFAULT_SITE_CONTENT, type SiteContent, siteContentSchema } from "@/lib/site-content";
import { useSiteContent } from "@/lib/site-content-context";
import { parseAdjustments, updateAdjustments } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

type ErrorMap = Record<string, string>;

type SavedUpload = { url: string; filename: string };

async function requestJson(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

function buildErrorMap(issues: Array<{ path: (string | number)[]; message: string }>) {
  const map: ErrorMap = {};
  for (const issue of issues) {
    map[issue.path.join(".")] = issue.message;
  }
  return map;
}

function move<T>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const swap = index + direction;
  if (swap < 0 || swap >= next.length) return next;
  [next[index], next[swap]] = [next[swap], next[index]];
  return next;
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/50">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        {hint ? <span className="text-xs text-white/35">{hint}</span> : null}
      </div>
      {children}
      {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none ${props.className ?? ""}`} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none ${props.className ?? ""}`} />;
}

function ImageEditor({
  label,
  value,
  defaultValue,
  error,
  onChange,
  onUpload,
  onDelete,
}: {
  label: string;
  value: string;
  defaultValue: string;
  error?: string;
  onChange: (next: string) => void;
  onUpload: (file: File) => Promise<SavedUpload>;
  onDelete: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const preview = value || defaultValue;
  const adjustments = parseAdjustments(value || defaultValue);

  const handleAdjustChange = (changes: Partial<typeof adjustments>) => {
    const nextVal = updateAdjustments(value || defaultValue, changes);
    onChange(nextVal);
  };

  return (
    <Field label={label} error={error} hint="PNG, JPG, WebP up to 5MB">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="w-full max-w-[220px] h-40 overflow-hidden rounded-xl border border-white/10 bg-black relative">
          <img
            src={preview}
            alt=""
            className="h-full w-full transition-all duration-200"
            style={{
              objectFit: adjustments.fit,
              objectPosition: `${adjustments.x}% ${adjustments.y}%`,
              transform: adjustments.zoom !== 100 ? `scale(${adjustments.zoom / 100})` : undefined,
            }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <label className="pill cursor-pointer">
              {busy ? "Uploading..." : value ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  try {
                    const uploaded = await onUpload(file);
                    // Keep original adjustments when replacing the image URL
                    const nextVal = updateAdjustments(uploaded.url, adjustments);
                    onChange(nextVal);
                  } catch (uploadError) {
                    console.error(uploadError);
                  } finally {
                    setBusy(false);
                    e.currentTarget.value = "";
                  }
                }}
                disabled={busy}
              />
            </label>
            <button
              type="button"
              className="pill"
              onClick={() => onChange(defaultValue)}
            >
              Reset default
            </button>
            <button
              type="button"
              className="pill"
              onClick={async () => {
                await onDelete();
                onChange(defaultValue);
              }}
            >
              Delete
            </button>
          </div>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/api/uploads/..." />
          <p className="text-xs text-white/45">You can upload a file or paste an image URL. Uploaded files are stored server-side and the URL is filled in automatically.</p>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4 space-y-4">
            <div className="text-xs font-semibold text-white/70 tracking-wider uppercase">Frame Fit & Adjustments</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Zoom Scale</span>
                  <span className="font-semibold text-white/70">{adjustments.zoom}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="5"
                  value={adjustments.zoom}
                  onChange={(e) => handleAdjustChange({ zoom: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[color:var(--lime)]"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/50">Fitting Mode</div>
                <select
                  value={adjustments.fit}
                  onChange={(e) => handleAdjustChange({ fit: e.target.value as any })}
                  className="w-full h-9 bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[color:var(--lime)]"
                >
                  <option value="cover">Cover (Fill & Crop)</option>
                  <option value="contain">Contain (Fit Entire)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Horizontal Align (X)</span>
                  <span className="font-semibold text-white/70">{adjustments.x}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.x}
                  onChange={(e) => handleAdjustChange({ x: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[color:var(--lime)]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Vertical Align (Y)</span>
                  <span className="font-semibold text-white/70">{adjustments.y}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.y}
                  onChange={(e) => handleAdjustChange({ y: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[color:var(--lime)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Field>
  );
}

function ArrayEditor({
  sectionId,
  label,
  description,
  items,
  onChange,
  children,
  addLabel,
  onAdd,
}: {
  sectionId?: string;
  label: string;
  description: string;
  items: unknown[];
  onChange: (next: unknown[]) => void;
  children: (item: unknown, index: number) => ReactNode;
  addLabel: string;
  onAdd: () => unknown;
}) {
  return (
    <Section id={sectionId ?? label.toLowerCase().replace(/\s+/g, "-")} title={label} description={description}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">Item {index + 1}</div>
              <div className="flex gap-2">
                <button type="button" className="pill" onClick={() => onChange(move(items as never[], index, -1))}>↑</button>
                <button type="button" className="pill" onClick={() => onChange(move(items as never[], index, 1))}>↓</button>
                <button type="button" className="pill" onClick={() => onChange(items.filter((_, i) => i !== index))}>Delete</button>
              </div>
            </div>
            {children(item, index)}
          </div>
        ))}
        <button type="button" className="pill" onClick={() => onChange([...items, onAdd()])}>
          {addLabel}
        </button>
      </div>
    </Section>
  );
}

function AdminRoute() {
  const { content, setContent, resetContent, refreshContent } = useSiteContent();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<SiteContent>(cloneContent(content));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const sectionIds = useMemo(
    () => ["hero", "about", "vision", "services", "projects", "testimonials", "team", "faqs", "contact", "footer"],
    [],
  );

  useEffect(() => {
    setDraft(cloneContent(content));
  }, [content]);

  useEffect(() => {
    void fetch("/api/admin/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAuthed(Boolean(data?.authed)))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => document.body.classList.remove("admin-page");
  }, []);

  const validation = useMemo(() => siteContentSchema.safeParse(draft), [draft]);
  const errors = useMemo(() => validation.success ? {} : buildErrorMap(validation.error.issues), [validation]);

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or smaller.");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as SavedUpload;
  }

  async function deleteImage(url: string) {
    if (!url.startsWith("/api/uploads/")) return;
    const filename = decodeURIComponent(url.split("/").pop() ?? "");
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename }),
      credentials: "include",
    });
  }

  if (!authed) {
    return (
      <main className="admin-page min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold">Admin Login</h1>
          <p className="mt-2 text-sm text-white/60">Use the admin password to edit live site content.</p>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-6"
            placeholder="Admin password"
          />
          <div className="mt-6 flex gap-3">
            <button
              className="pill"
              onClick={async () => {
                try {
                  await requestJson("/api/admin/login", { password });
                  setAuthed(true);
                  setStatus("Signed in.");
                } catch {
                  setGlobalError("Invalid password");
                }
              }}
            >
              Sign In
            </button>
            <Link to="/" className="pill">Back Home</Link>
          </div>
          {globalError ? <p className="mt-3 text-sm text-red-400">{globalError}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Mrora CMS</h1>
            <p className="mt-1 text-sm text-white/60">Structured editing for the public site. No raw JSON editing required.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/" className="pill">View Site</Link>
            <button
              className="pill"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setGlobalError("");
                try {
                  if (!validation.success) {
                    setGlobalError("Fix the highlighted validation errors before saving.");
                    return;
                  }
                  await setContent(validation.data);
                  setStatus("Saved and synced to the public site.");
                } catch (error) {
                  setGlobalError(error instanceof Error ? error.message : "Save failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="pill"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setGlobalError("");
                try {
                  await resetContent();
                  setDraft(cloneContent(DEFAULT_SITE_CONTENT));
                  setStatus("Reset to defaults.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Reset Defaults
            </button>
            <button
              className="pill"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await refreshContent();
                  setStatus("Reloaded from server.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Refresh
            </button>
            <button
              className="pill"
              onClick={async () => {
                await requestJson("/api/admin/logout");
                setAuthed(false);
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {status ? <div className="mb-6 rounded-xl border border-[color:var(--lime)]/20 bg-[color:var(--lime)]/10 px-4 py-3 text-sm text-[color:var(--lime)]">{status}</div> : null}
        {globalError ? <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{globalError}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="hidden xl:block">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Sections</div>
              <div className="mt-4 space-y-2 text-sm text-white/60">
                {["Hero", "About", "Vision", "Services", "Projects", "Testimonials", "Team", "FAQs", "Contact", "Footer"].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/5"
                    onClick={() => document.getElementById(sectionIds[index])?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <Section id="hero" title="Hero" description="Header hero copy and the primary image shown in the opening section.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title" error={errors["hero.title"]} hint="Max 80 chars">
                  <Input value={draft.hero.title} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, title: e.target.value } })} />
                </Field>
                <Field label="Description" error={errors["hero.description"]} hint="Max 500 chars">
                  <Textarea rows={6} value={draft.hero.description} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, description: e.target.value } })} />
                </Field>
              </div>
              <ImageEditor
                label="Hero Image"
                value={draft.hero.image}
                defaultValue={DEFAULT_SITE_CONTENT.hero.image}
                error={errors["hero.image"]}
                onChange={(next) => setDraft({ ...draft, hero: { ...draft.hero, image: next } })}
                onUpload={uploadImage}
                onDelete={() => deleteImage(draft.hero.image)}
              />
            </Section>

            <Section id="about" title="About" description="The about headline and supporting copy. Add, edit, or reorder paragraphs.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Eyebrow" error={errors["about.eyebrow"]}>
                  <Input value={draft.about.eyebrow} onChange={(e) => setDraft({ ...draft, about: { ...draft.about, eyebrow: e.target.value } })} />
                </Field>
                <Field label="Title" error={errors["about.title"]}>
                  <Input value={draft.about.title} onChange={(e) => setDraft({ ...draft, about: { ...draft.about, title: e.target.value } })} />
                </Field>
              </div>
              <ArrayEditor
                label="About Paragraphs"
                description="Add or rearrange the about paragraphs shown on the public page."
                items={draft.about.paragraphs}
                onChange={(next) => setDraft({ ...draft, about: { ...draft.about, paragraphs: next as string[] } })}
                addLabel="Add paragraph"
                onAdd={() => ""}
              >
                {(item, index) => (
                  <Field label={`Paragraph ${index + 1}`} error={errors[`about.paragraphs.${index}`]}>
                    <Textarea rows={4} value={item as string} onChange={(e) => {
                      const paragraphs = [...draft.about.paragraphs];
                      paragraphs[index] = e.target.value;
                      setDraft({ ...draft, about: { ...draft.about, paragraphs } });
                    }} />
                  </Field>
                )}
              </ArrayEditor>
            </Section>

            <Section id="vision" title="Vision" description="Vision tagline and supporting text.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Eyebrow" error={errors["vision.eyebrow"]}>
                  <Input value={draft.vision.eyebrow} onChange={(e) => setDraft({ ...draft, vision: { ...draft.vision, eyebrow: e.target.value } })} />
                </Field>
                <Field label="Title" error={errors["vision.title"]}>
                  <Input value={draft.vision.title} onChange={(e) => setDraft({ ...draft, vision: { ...draft.vision, title: e.target.value } })} />
                </Field>
              </div>
              <Field label="Description" error={errors["vision.description"]}>
                <Textarea rows={5} value={draft.vision.description} onChange={(e) => setDraft({ ...draft, vision: { ...draft.vision, description: e.target.value } })} />
              </Field>
            </Section>

            <ArrayEditor
              sectionId="services"
              label="Services"
              description="Edit the service cards and reorder them with the arrows."
              items={draft.services}
              addLabel="Add service"
              onAdd={() => ({ n: `0${draft.services.length + 1}`.slice(-2), title: "", desc: "", label: "", tags: [""] })}
              onChange={(next) => setDraft({ ...draft, services: next as SiteContent["services"] })}
            >
              {(item, index) => {
                const service = item as SiteContent["services"][number];
                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Number" error={errors[`services.${index}.n`]}>
                      <Input value={service.n} onChange={(e) => {
                        const next = [...draft.services];
                        next[index] = { ...service, n: e.target.value };
                        setDraft({ ...draft, services: next });
                      }} />
                    </Field>
                    <Field label="Title" error={errors[`services.${index}.title`]}>
                      <Input value={service.title} onChange={(e) => {
                        const next = [...draft.services];
                        next[index] = { ...service, title: e.target.value };
                        setDraft({ ...draft, services: next });
                      }} />
                    </Field>
                    <Field label="Description" error={errors[`services.${index}.desc`]}>
                      <Textarea rows={4} value={service.desc} onChange={(e) => {
                        const next = [...draft.services];
                        next[index] = { ...service, desc: e.target.value };
                        setDraft({ ...draft, services: next });
                      }} />
                    </Field>
                    <Field label="Label" error={errors[`services.${index}.label`]}>
                      <Input value={service.label} onChange={(e) => {
                        const next = [...draft.services];
                        next[index] = { ...service, label: e.target.value };
                        setDraft({ ...draft, services: next });
                      }} />
                    </Field>
                    <ArrayEditor
                      label="Tags"
                      description="Editable tag chips for this service."
                      items={service.tags}
                      addLabel="Add tag"
                      onAdd={() => ""}
                      onChange={(next) => {
                        const services = [...draft.services];
                        services[index] = { ...service, tags: next as string[] };
                        setDraft({ ...draft, services });
                      }}
                    >
                      {(tag, tagIndex) => (
                        <Field label={`Tag ${tagIndex + 1}`} error={errors[`services.${index}.tags.${tagIndex}`]}>
                          <Input
                            value={tag as string}
                            onChange={(e) => {
                              const tags = [...service.tags];
                              tags[tagIndex] = e.target.value;
                              const services = [...draft.services];
                              services[index] = { ...service, tags };
                              setDraft({ ...draft, services });
                            }}
                          />
                        </Field>
                      )}
                    </ArrayEditor>
                  </div>
                );
              }}
            </ArrayEditor>

            <ArrayEditor
              sectionId="projects"
              label="Projects"
              description="Selected work cards with image uploads and destination links."
              items={draft.projects}
              addLabel="Add project"
              onAdd={() => ({ title: "", tag: "", image: DEFAULT_SITE_CONTENT.projects[0].image, href: "" })}
              onChange={(next) => setDraft({ ...draft, projects: next as SiteContent["projects"] })}
            >
              {(item, index) => {
                const project = item as SiteContent["projects"][number];
                return (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title" error={errors[`projects.${index}.title`]}>
                        <Input value={project.title} onChange={(e) => {
                          const next = [...draft.projects];
                          next[index] = { ...project, title: e.target.value };
                          setDraft({ ...draft, projects: next });
                        }} />
                      </Field>
                      <Field label="Tag" error={errors[`projects.${index}.tag`]}>
                        <Input value={project.tag} onChange={(e) => {
                          const next = [...draft.projects];
                          next[index] = { ...project, tag: e.target.value };
                          setDraft({ ...draft, projects: next });
                        }} />
                      </Field>
                      <Field label="Project Link" error={errors[`projects.${index}.href`]}>
                        <Input value={project.href} onChange={(e) => {
                          const next = [...draft.projects];
                          next[index] = { ...project, href: e.target.value };
                          setDraft({ ...draft, projects: next });
                        }} />
                      </Field>
                    </div>
                    <ImageEditor
                      label="Project Image"
                      value={project.image}
                      defaultValue={DEFAULT_SITE_CONTENT.projects[index % DEFAULT_SITE_CONTENT.projects.length].image}
                      error={errors[`projects.${index}.image`]}
                      onChange={(next) => {
                        const projects = [...draft.projects];
                        projects[index] = { ...project, image: next };
                        setDraft({ ...draft, projects });
                      }}
                      onUpload={uploadImage}
                      onDelete={() => deleteImage(project.image)}
                    />
                  </div>
                );
              }}
            </ArrayEditor>

            <ArrayEditor
              sectionId="testimonials"
              label="Testimonials"
              description="Rotate the client quotes and avatar images."
              items={draft.testimonials}
              addLabel="Add testimonial"
              onAdd={() => ({ name: "", role: "", quote: "", avatar: DEFAULT_SITE_CONTENT.testimonials[0].avatar })}
              onChange={(next) => setDraft({ ...draft, testimonials: next as SiteContent["testimonials"] })}
            >
              {(item, index) => {
                const testimonial = item as SiteContent["testimonials"][number];
                return (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name" error={errors[`testimonials.${index}.name`]}>
                        <Input value={testimonial.name} onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[index] = { ...testimonial, name: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }} />
                      </Field>
                      <Field label="Role" error={errors[`testimonials.${index}.role`]}>
                        <Input value={testimonial.role} onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[index] = { ...testimonial, role: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }} />
                      </Field>
                      <Field label="Quote" error={errors[`testimonials.${index}.quote`]}>
                        <Textarea rows={4} value={testimonial.quote} onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[index] = { ...testimonial, quote: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }} />
                      </Field>
                    </div>
                    <ImageEditor
                      label="Avatar"
                      value={testimonial.avatar}
                      defaultValue={DEFAULT_SITE_CONTENT.testimonials[index % DEFAULT_SITE_CONTENT.testimonials.length].avatar}
                      error={errors[`testimonials.${index}.avatar`]}
                      onChange={(next) => {
                        const testimonials = [...draft.testimonials];
                        testimonials[index] = { ...testimonial, avatar: next };
                        setDraft({ ...draft, testimonials });
                      }}
                      onUpload={uploadImage}
                      onDelete={() => deleteImage(testimonial.avatar)}
                    />
                  </div>
                );
              }}
            </ArrayEditor>

            <ArrayEditor
              sectionId="team"
              label="Team"
              description="Team members shown in the public site."
              items={draft.team}
              addLabel="Add team member"
              onAdd={() => ({ name: "", role: "", image: DEFAULT_SITE_CONTENT.team[0].image, portfolioUrl: "https://example.com" })}
              onChange={(next) => setDraft({ ...draft, team: next as SiteContent["team"] })}
            >
              {(item, index) => {
                const member = item as SiteContent["team"][number];
                return (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name" error={errors[`team.${index}.name`]}>
                        <Input value={member.name} onChange={(e) => {
                          const next = [...draft.team];
                          next[index] = { ...member, name: e.target.value };
                          setDraft({ ...draft, team: next });
                        }} />
                      </Field>
                      <Field label="Role" error={errors[`team.${index}.role`]}>
                        <Input value={member.role} onChange={(e) => {
                          const next = [...draft.team];
                          next[index] = { ...member, role: e.target.value };
                          setDraft({ ...draft, team: next });
                        }} />
                      </Field>
                      <Field label="Portfolio Link" error={errors[`team.${index}.portfolioUrl`]}>
                        <Input value={member.portfolioUrl} onChange={(e) => {
                          const next = [...draft.team];
                          next[index] = { ...member, portfolioUrl: e.target.value };
                          setDraft({ ...draft, team: next });
                        }} placeholder="https://..." />
                      </Field>
                    </div>
                    <ImageEditor
                      label="Portrait"
                      value={member.image}
                      defaultValue={DEFAULT_SITE_CONTENT.team[index % DEFAULT_SITE_CONTENT.team.length].image}
                      error={errors[`team.${index}.image`]}
                      onChange={(next) => {
                        const team = [...draft.team];
                        team[index] = { ...member, image: next };
                        setDraft({ ...draft, team });
                      }}
                      onUpload={uploadImage}
                      onDelete={() => deleteImage(member.image)}
                    />
                  </div>
                );
              }}
            </ArrayEditor>

            <ArrayEditor
              sectionId="faqs"
              label="FAQs"
              description="Frequently asked questions can be managed here for future public display or support use."
              items={draft.faqs}
              addLabel="Add FAQ"
              onAdd={() => ({ question: "", answer: "" })}
              onChange={(next) => setDraft({ ...draft, faqs: next as SiteContent["faqs"] })}
            >
              {(item, index) => {
                const faq = item as SiteContent["faqs"][number];
                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Question" error={errors[`faqs.${index}.question`]}>
                      <Input value={faq.question} onChange={(e) => {
                        const next = [...draft.faqs];
                        next[index] = { ...faq, question: e.target.value };
                        setDraft({ ...draft, faqs: next });
                      }} />
                    </Field>
                    <Field label="Answer" error={errors[`faqs.${index}.answer`]}>
                      <Textarea rows={4} value={faq.answer} onChange={(e) => {
                        const next = [...draft.faqs];
                        next[index] = { ...faq, answer: e.target.value };
                        setDraft({ ...draft, faqs: next });
                      }} />
                    </Field>
                  </div>
                );
              }}
            </ArrayEditor>

            <Section id="contact" title="Contact" description="Site contact settings and CTA text.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email" error={errors["contact.email"]}>
                  <Input value={draft.contact.email} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })} />
                </Field>
                <Field label="Phone" error={errors["contact.phone"]}>
                  <Input value={draft.contact.phone} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, phone: e.target.value } })} />
                </Field>
                <Field label="Address" error={errors["contact.address"]}>
                  <Input value={draft.contact.address} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, address: e.target.value } })} />
                </Field>
                <Field label="CTA Label" error={errors["contact.ctaLabel"]}>
                  <Input value={draft.contact.ctaLabel} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, ctaLabel: e.target.value } })} />
                </Field>
              </div>
            </Section>

            <Section id="footer" title="Footer" description="Footer text and copyright details.">
              <Field label="Description" error={errors["footer.description"]}>
                <Textarea rows={4} value={draft.footer.description} onChange={(e) => setDraft({ ...draft, footer: { ...draft.footer, description: e.target.value } })} />
              </Field>
              <Field label="Copyright" error={errors["footer.copyright"]}>
                <Input value={draft.footer.copyright} onChange={(e) => setDraft({ ...draft, footer: { ...draft.footer, copyright: e.target.value } })} />
              </Field>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
