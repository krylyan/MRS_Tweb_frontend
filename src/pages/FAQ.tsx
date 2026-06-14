import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  HelpCircle,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import AuthUtils from "../utils/authUtils";
import { faqService, type FaqIconKey, type FaqItem, type FaqSection } from "../services/faqService";

const ICONS: Record<FaqIconKey, LucideIcon> = {
  help: HelpCircle,
  sparkles: Sparkles,
  calendar: CalendarDays,
  search: Search,
  user: User,
  settings: Settings,
  dumbbell: Dumbbell,
  message: MessageCircle,
};

const ICON_OPTIONS: { key: FaqIconKey; label: string }[] = [
  { key: "help", label: "Help" },
  { key: "sparkles", label: "Sparkles" },
  { key: "calendar", label: "Calendar" },
  { key: "search", label: "Search" },
  { key: "user", label: "User" },
  { key: "settings", label: "Settings" },
  { key: "dumbbell", label: "Dumbbell" },
  { key: "message", label: "Message" },
];

export default function FAQ() {
  const isAdminMode = AuthUtils.isAdminModeEnabled();
  const [sections, setSections] = useState<FaqSection[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState<FaqIconKey>("help");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const refresh = async () => {
    setLoading(true);
    const data = await faqService.getAll();
    setSections(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const id = window.setTimeout(() => setStatusMessage(""), 2600);
    return () => window.clearTimeout(id);
  }, [statusMessage]);

  const categoryFilters = useMemo(
    () => [{ id: "all", title: "All Topics", icon: "help" as FaqIconKey }, ...sections.map((section) => ({ id: String(section.id), title: section.title, icon: section.icon }))],
    [sections],
  );

  const visibleSections = useMemo(
    () => (activeCategory === "all" ? sections : sections.filter((section) => String(section.id) === activeCategory)),
    [activeCategory, sections],
  );

  const updateSectionLocal = (sectionId: number, patch: Partial<FaqSection>) => {
    setSections((current) => current.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)));
  };

  const updateItemLocal = (sectionId: number, itemId: number, patch: Partial<FaqItem>) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) }
          : section,
      ),
    );
  };

  const saveCategory = async (section: FaqSection) => {
    const saved = await faqService.updateCategory(section.id, { title: section.title, icon: section.icon, order: section.order });
    setStatusMessage(saved ? "Category saved in database." : "Category could not be saved.");
    if (saved) {
      setEditingSectionId(null);
      refresh();
    }
  };

  const saveQuestion = async (item: FaqItem) => {
    const saved = await faqService.updateQuestion(item.id, {
      faqCategoryId: item.faqCategoryId,
      question: item.q,
      answer: item.a,
      icon: item.icon,
      order: item.order,
    });
    setStatusMessage(saved ? "Question saved in database." : "Question could not be saved.");
    if (saved) {
      setEditingItemId(null);
      refresh();
    }
  };

  const addCategory = async () => {
    const title = newCategoryTitle.trim();
    if (!title) return;
    const created = await faqService.createCategory({ title, icon: newCategoryIcon, order: sections.length });
    if (created) {
      setNewCategoryTitle("");
      setNewCategoryIcon("help");
      setActiveCategory(String(created.id));
      await refresh();
      setStatusMessage("Category saved in database.");
    }
  };

  const deleteCategory = async (sectionId: number) => {
    const ok = await faqService.deleteCategory(sectionId);
    if (ok) {
      if (activeCategory === String(sectionId)) setActiveCategory("all");
      await refresh();
    }
    setStatusMessage(ok ? "Category deleted from database." : "Category could not be deleted.");
  };

  const addQuestion = async (section: FaqSection) => {
    const created = await faqService.createQuestion({
      faqCategoryId: section.id,
      question: "New question",
      answer: "Write the answer here.",
      icon: "help",
      order: section.items.length,
    });
    if (created) {
      await refresh();
      setEditingItemId(created.id);
      setOpenId(`${section.id}-${created.id}`);
      setStatusMessage("Question saved in database.");
    }
  };

  const deleteQuestion = async (itemId: number) => {
    const ok = await faqService.deleteQuestion(itemId);
    if (ok) await refresh();
    setStatusMessage(ok ? "Question deleted from database." : "Question could not be deleted.");
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="reveal-up mb-10 flex flex-col items-center text-center">
          <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${isAdminMode ? "bg-amber-500 shadow-amber-500/25" : "bg-emerald-500 shadow-emerald-500/30"}`}>
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-50 sm:text-5xl">Help &amp; Support</h1>
          <p className="mt-3 text-slate-400">{isAdminMode ? "Manage the FAQ content stored in the database" : "Find answers to common questions about FitLife"}</p>
        </header>

        {isAdminMode ? (
          <section className="reveal-up mb-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input value={newCategoryTitle} onChange={(event) => setNewCategoryTitle(event.target.value)} placeholder="New category name" className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/60" />
              <IconSelect value={newCategoryIcon} onChange={setNewCategoryIcon} />
              <button type="button" onClick={addCategory} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-400">
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          </section>
        ) : null}

        <div className="reveal-up mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categoryFilters.map((cat) => {
            const Icon = ICONS[cat.icon];
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} type="button" onClick={() => { setActiveCategory(cat.id); setOpenId(null); }} className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-all duration-200 ${isActive ? (isAdminMode ? "border-amber-300/50 bg-amber-400/15 text-amber-100 shadow-lg shadow-amber-500/10" : "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10") : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/8 hover:text-slate-200"}`}>
                <Icon className="h-5 w-5" />
                <span className="text-center leading-snug">{cat.title}</span>
              </button>
            );
          })}
        </div>

        {loading ? <div className="py-16 text-center text-slate-400">Loading FAQ...</div> : null}

        {!loading && visibleSections.map((section) => {
          const SectionIcon = ICONS[section.icon];
          const isEditingSection = editingSectionId === section.id;
          return (
            <section key={section.id} className="reveal-up mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="flex flex-col gap-4 px-6 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <SectionIcon className={`h-6 w-6 ${isAdminMode ? "text-amber-200" : "text-emerald-400"}`} />
                  {isEditingSection ? (
                    <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_170px]">
                      <input value={section.title} onChange={(event) => updateSectionLocal(section.id, { title: event.target.value })} className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60" />
                      <IconSelect value={section.icon} onChange={(icon) => updateSectionLocal(section.id, { icon })} />
                    </div>
                  ) : (
                    <h2 className="truncate text-lg font-bold text-slate-50">{section.title}</h2>
                  )}
                </div>

                {isAdminMode ? (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => (isEditingSection ? saveCategory(section) : setEditingSectionId(section.id))} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                      {isEditingSection ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      {isEditingSection ? "Save" : "Edit"}
                    </button>
                    <button type="button" onClick={() => addQuestion(section)} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-400">
                      <Plus className="h-4 w-4" />
                      Question
                    </button>
                    <button type="button" onClick={() => deleteCategory(section.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/20">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2.5 px-5 pb-5">
                {section.items.map((item) => {
                  const id = `${section.id}-${item.id}`;
                  const isOpen = openId === id;
                  const isEditingItem = editingItemId === item.id;
                  const ItemIcon = ICONS[item.icon];

                  return (
                    <div key={item.id} className={`overflow-hidden rounded-xl border transition-all duration-200 ${isOpen ? "border-emerald-400/40 bg-white/8" : "border-white/10 bg-white/[0.03] hover:border-emerald-400/30"}`}>
                      <button type="button" onClick={() => setOpenId(isOpen ? null : id)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm font-medium text-slate-200 outline-none transition-colors hover:text-white">
                        <span className="flex min-w-0 items-center gap-3">
                          <ItemIcon className={`h-4 w-4 shrink-0 ${isAdminMode ? "text-amber-200" : "text-emerald-300"}`} />
                          <span className="break-words">{item.q}</span>
                        </span>
                        {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                      </button>

                      <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                        <div className="overflow-hidden">
                          {isAdminMode && isEditingItem ? (
                            <div className="space-y-3 px-5 pb-5">
                              <input value={item.q} onChange={(event) => updateItemLocal(section.id, item.id, { q: event.target.value })} className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60" />
                              <textarea value={item.a} onChange={(event) => updateItemLocal(section.id, item.id, { a: event.target.value })} rows={4} className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60" />
                              <IconSelect value={item.icon} onChange={(icon) => updateItemLocal(section.id, item.id, { icon })} />
                            </div>
                          ) : (
                            <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">{item.a}</p>
                          )}

                          {isAdminMode ? (
                            <div className="flex gap-2 px-5 pb-5">
                              <button type="button" onClick={() => (isEditingItem ? saveQuestion(item) : setEditingItemId(item.id))} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                                {isEditingItem ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                                {isEditingItem ? "Save" : "Edit"}
                              </button>
                              <button type="button" onClick={() => deleteQuestion(item.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/20">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {!isAdminMode ? (
          <div className="reveal-up overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/10 px-6 py-10 text-center shadow-lg shadow-emerald-500/5">
            <div className="mb-4 flex justify-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20"><MessageCircle className="h-6 w-6 text-emerald-400" /></div></div>
            <h3 className="mb-2 text-xl font-bold text-slate-50">Still need help?</h3>
            <p className="mb-6 text-sm text-slate-400">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"><MessageCircle className="h-4 w-4" />Contact Support</button>
              <a href="mailto:support@fitlife.app" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"><Mail className="h-4 w-4" />Email Us</a>
            </div>
          </div>
        ) : null}

        {statusMessage ? <div className="fixed bottom-4 right-4 z-[9999] rounded-2xl border border-amber-300/25 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-amber-100 shadow-2xl">{statusMessage}</div> : null}
      </div>
    </main>
  );
}

function IconSelect({ value, onChange }: { value: FaqIconKey; onChange: (value: FaqIconKey) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as FaqIconKey)} className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60">
      {ICON_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
    </select>
  );
}
