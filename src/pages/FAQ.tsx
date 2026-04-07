import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */
interface FAQSection {
  key: string;
  title: string;
  icon: LucideIcon;
  items: { q: string; a: string }[];
}

const SECTIONS: FAQSection[] = [
  {
    key: "getting-started",
    title: "Getting Started",
    icon: Sparkles,
    items: [
      {
        q: "How do I create my first workout plan?",
        a: "Navigate to My Plans from the sidebar, click the + button to create a new plan. Choose between Workout or Alimentation, give it a name, and start adding days and exercises.",
      },
      {
        q: "What is the onboarding questionnaire for?",
        a: "The questionnaire helps us personalize your experience. It collects your fitness goals, current activity level, any limitations, and preferred workout schedule to tailor recommendations.",
      },
      {
        q: "Can I skip the onboarding process?",
        a: "Yes, you can skip the questionnaire and go straight to the dashboard. You can always fill it out later from the Profile page to get personalized suggestions.",
      },
    ],
  },
  {
    key: "workout-planning",
    title: "Workout Planning",
    icon: CalendarDays,
    items: [
      {
        q: "How do I add exercises to my workout?",
        a: "Inside a workout plan, click the \"+ Add Exercise\" button in the Activities panel. Browse or search the Exercise Library, then tap an exercise to add it to the current day.",
      },
      {
        q: "Can I have multiple training days in one plan?",
        a: "Absolutely. Use the \"+ Add Day\" button to create as many training days as you need. Each day can have its own set of exercises and structure.",
      },
      {
        q: "How do I track sets, reps, and weight?",
        a: "Each exercise in your plan has an \"Add set\" button. Click it to add sets with reps and weight fields that you can fill in as you train.",
      },
      {
        q: "What is the rest timer feature?",
        a: "The rest timer helps you maintain optimal rest periods between sets. Set your desired rest duration (usually 60-120 seconds), and use the timer to ensure consistent recovery time.",
      },
      {
        q: "Can I edit or delete saved workout plans?",
        a: "Yes! Open any plan from My Plans to edit it — rename, add or remove days, modify exercises. You can also delete plans using the trash icon on each plan card.",
      },
    ],
  },
  {
    key: "exercise-library",
    title: "Exercise Library",
    icon: Search,
    items: [
      {
        q: "How many exercises are in the library?",
        a: "Our library currently contains a wide range of exercises covering all major muscle groups — chest, back, legs, arms, core, and cardio. We're continuously adding more.",
      },
      {
        q: "Can I filter exercises by difficulty?",
        a: "You can filter exercises by muscle group using the filter pills on the Exercise Library page. Use the search bar to find specific exercises by name.",
      },
      {
        q: "Do exercises include instructions?",
        a: "Yes. Each exercise card includes step-by-step instructions. Click on any exercise to open its detail view with a full breakdown of how to perform it.",
      },
    ],
  },
  {
    key: "profile-progress",
    title: "Profile & Progress",
    icon: User,
    items: [
      {
        q: "How do I update my profile information?",
        a: "Go to the Profile page from the sidebar. You can view your account details, fitness statistics, and weekly activity overview there.",
      },
      {
        q: "What stats does FitLife track?",
        a: "FitLife tracks your total workouts, active plans, favorite exercises, and weekly activity. Your Dashboard provides an at-a-glance overview of all key metrics.",
      },
      {
        q: "How are achievements earned?",
        a: "Achievements are earned by reaching milestones — creating your first plan, completing workouts consistently, and hitting personal records. Check the Profile page for your progress.",
      },
      {
        q: "Can I see my workout history?",
        a: "Your recent workouts are displayed on the Dashboard. Each plan also keeps a record of the exercises and sets you've added over time.",
      },
    ],
  },
  {
    key: "technical-account",
    title: "Technical & Account",
    icon: Settings,
    items: [
      {
        q: "Is my workout data saved?",
        a: "Yes. Your data is stored locally in your browser using localStorage. It persists across sessions as long as you don't clear your browser data.",
      },
      {
        q: "Can I use FitLife on mobile?",
        a: "FitLife is fully responsive and works great on mobile browsers. Simply open the app URL on your phone or tablet for a mobile-optimized experience.",
      },
      {
        q: "How do I sign out?",
        a: "Click the \"Log out\" button at the bottom of the sidebar. You'll be redirected to the login page and your session will end.",
      },
      {
        q: "What if I forget my password?",
        a: "Use the \"Forgot password\" link on the sign-in screen, enter your email, and follow the reset instructions. The reset link expires after 30 minutes for security.",
      },
    ],
  },
];

const CATEGORY_FILTERS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All Topics", icon: HelpCircle },
  ...SECTIONS.map((s) => ({ key: s.key, label: s.title, icon: s.icon })),
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  const visibleSections = useMemo(
    () =>
      activeCategory === "all"
        ? SECTIONS
        : SECTIONS.filter((s) => s.key === activeCategory),
    [activeCategory],
  );

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="reveal-up mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-50 sm:text-5xl">
            Help &amp; Support
          </h1>
          <p className="mt-3 text-slate-400">
            Find answers to common questions about FitLife
          </p>
        </header>

        {/* Category filter cards */}
        <div className="reveal-up mb-10 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key);
                  setOpenId(null);
                }}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/8 hover:text-slate-200"
                }`}
              >
                <cat.icon className="h-5 w-5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sections */}
        {visibleSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <section
              key={section.key}
              className="reveal-up mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                <SectionIcon className="h-6 w-6 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-50">
                  {section.title}
                </h2>
              </div>

              {/* Questions */}
              <div className="flex flex-col gap-2.5 px-5 pb-5">
                {section.items.map((item, iIdx) => {
                  const id = `${section.key}-${iIdx}`;
                  const isOpen = openId === id;

                  return (
                    <div
                      key={id}
                      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                        isOpen
                          ? "border-emerald-400/40 bg-white/8 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                          : "border-white/10 bg-white/[0.03] hover:border-emerald-400/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-slate-200 outline-none transition-colors hover:text-white"
                      >
                        <span>{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                        )}
                      </button>

                      <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Still need help? */}
        <div className="reveal-up overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/10 px-6 py-10 text-center shadow-lg shadow-emerald-500/5">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
              <MessageCircle className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-50">
            Still need help?
          </h3>
          <p className="mb-6 text-sm text-slate-400">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </button>
            <a
              href="mailto:support@fitlife.app"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

