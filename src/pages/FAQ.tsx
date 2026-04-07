import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageCircle,
  PlayCircle,
  Users,
  Lightbulb,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */
interface FAQSection {
  title: string;
  items: { q: string; a: string }[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I create my first workout plan?",
        a: "Navigate to My Plans, click the + button to create a new plan. Choose between Workout or Alimentation, give it a name, and start adding days and exercises to build your routine.",
      },
      {
        q: "What information should I include in the questionnaire?",
        a: "The questionnaire helps us personalize your experience. Include your fitness goals, current activity level, any injuries or limitations, and your preferred workout schedule.",
      },
      {
        q: "How do I track my progress?",
        a: "Your Dashboard shows key stats like total workouts, active plans, and weekly activity. Each workout plan also tracks the exercises and sets you've added over time.",
      },
    ],
  },
  {
    title: "Workout Plans",
    items: [
      {
        q: "Can I edit a workout plan after creating it?",
        a: "Yes! Open any plan from My Plans and you can rename it, add or remove days, and modify exercises at any time. Don't forget to save your changes.",
      },
      {
        q: "How do I add exercises to my workout?",
        a: "Inside a workout plan, click the \"+ Add Exercise\" button in the Activities panel. Browse or search the Exercise Library, then tap an exercise to add it to the current day.",
      },
      {
        q: "What does the rest timer do?",
        a: "The rest timer helps you maintain optimal rest periods between sets. Set your desired rest duration (usually 60-120 seconds), and use the timer to ensure consistent recovery time throughout your workout.",
      },
      {
        q: "Can I save multiple workout plans?",
        a: "Absolutely. You can create as many workout and alimentation plans as you need. Switch between them from the My Plans page and favorite the ones you use most.",
      },
    ],
  },
  {
    title: "Exercise Library",
    items: [
      {
        q: "How many exercises are in the library?",
        a: "Our library currently contains a wide range of exercises covering all major muscle groups — chest, back, legs, arms, core, and cardio. We're continuously adding more.",
      },
      {
        q: "Can I filter exercises by muscle group?",
        a: "Yes. The Exercise Library page has filter pills for each muscle group. You can also use the search bar to find exercises by name.",
      },
      {
        q: "Do exercises include video demonstrations?",
        a: "Exercise cards include visual guidance and step-by-step instructions. We're continuously expanding our library with more detailed demonstrations.",
      },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      {
        q: "How do I update my profile information?",
        a: "Go to the Profile page from the sidebar. You can view your account details and fitness statistics there.",
      },
      {
        q: "Can I change my fitness goals?",
        a: "Yes. You can retake the questionnaire at any time to update your fitness goals, activity level, and preferences.",
      },
      {
        q: "Is my workout data private?",
        a: "Your data is stored locally in your browser. We do not share your workout data with third parties.",
      },
    ],
  },
  {
    title: "Nutrition",
    items: [
      {
        q: "Does FitLife include nutrition planning?",
        a: "Yes! You can create alimentation plans from the My Plans page. Build meal plans and track your nutrition alongside your workouts.",
      },
      {
        q: "Can I sync my nutrition plan with my workouts?",
        a: "While workout and nutrition plans are managed separately, you can organize them together in My Plans for a complete fitness overview.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="reveal-up mb-12 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-50 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-slate-400">
            Everything you need to know about FitLife
          </p>
        </header>

        {/* Sections */}
        {FAQ_SECTIONS.map((section, sIdx) => (
          <section key={section.title} className="reveal-up mb-10">
            <h2 className="mb-4 text-xl font-bold text-slate-50">
              {section.title}
            </h2>

            <div className="flex flex-col gap-3">
              {section.items.map((item, iIdx) => {
                const id = `${sIdx}-${iIdx}`;
                const isOpen = openId === id;

                return (
                  <div
                    key={id}
                    className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
                      isOpen
                        ? "border-emerald-400/30 bg-white/[0.04]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-200 outline-none transition-colors hover:text-white"
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
        ))}

        {/* Still have questions? */}
        <div className="reveal-up mb-10 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/10 p-8 text-center shadow-lg shadow-emerald-500/5">
          <h3 className="mb-2 text-xl font-bold text-slate-50">
            Still have questions?
          </h3>
          <p className="mb-5 text-sm text-slate-400">
            Our support team is here to help you get the most out of FitLife
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="mailto:support@fitlife.app"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </button>
          </div>
        </div>

        {/* Resource cards */}
        <div className="reveal-up grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: PlayCircle,
              title: "Video Tutorials",
              desc: "Watch step-by-step guides",
              link: "Watch Now →",
            },
            {
              icon: Users,
              title: "Community Forum",
              desc: "Connect with other users",
              link: "Join Forum →",
            },
            {
              icon: Lightbulb,
              title: "Feature Requests",
              desc: "Suggest improvements",
              link: "Submit Idea →",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <card.icon className="mb-3 h-6 w-6 text-slate-400" />
              <h4 className="mb-1 text-sm font-bold text-slate-100">
                {card.title}
              </h4>
              <p className="mb-3 text-xs text-slate-400">{card.desc}</p>
              <span className="text-sm font-semibold text-emerald-400">
                {card.link}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

