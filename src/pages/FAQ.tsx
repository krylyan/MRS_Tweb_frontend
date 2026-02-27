import { useEffect, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "payments",
    question: "What payment methods are accepted?",
    answer:
      "We support all major debit and credit cards, plus secure card payments through our billing portal. Enterprise plans can also pay by bank transfer.",
  },
  {
    id: "password",
    question: "How can I reset my password if I forget it?",
    answer:
      'Click "Forgot password" on the sign-in screen, enter your email, and follow the reset link we send. For security, the link expires after 30 minutes.',
  },
  {
    id: "returns",
    question: "What is your return policy?",
    answer:
      "You can cancel your subscription at any time. If you were charged in error, contact support within 14 days and we will review your refund request quickly.",
  },
  {
    id: "account",
    question: "How do I create an account?",
    answer:
      "Select Sign Up, add your name, email, and password, then verify your email address. You can finish onboarding in under two minutes.",
  },
  {
    id: "support",
    question: "How can I contact support?",
    answer:
      "Use the in-app support form or email support@fitlife.app. Our team typically replies within one business day.",
  },
];

const ITEM_DELAY_CLASSES = [
  "delay-0",
  "delay-75",
  "delay-150",
  "delay-200",
  "delay-300",
] as const;

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string>("payments");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-16 text-white md:px-12 md:py-24">
      <Link
        to="/home"
        aria-label="Go to home page"
        className="absolute left-5 top-5 z-30 inline-flex items-center space-x-3"
      >
        <div className="rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 p-2">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <span className="text-4xl font-bold text-white md:text-2xl">FitLife</span>
      </Link>

      <section aria-labelledby="faq-title" className="mx-auto w-full max-w-4xl">
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm transition-all duration-700 ease-out md:p-8 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <header className="mb-10 text-center">
            <h1 id="faq-title" className="text-5xl font-bold text-emerald-400 md:text-5xl">
              FAQ
            </h1>
            <p className="text-sm leading-relaxed text-gray-400">Frequently asked questions</p>
          </header>

          <Accordion.Root
            type="single"
            collapsible
            value={openItem}
            onValueChange={(value) => setOpenItem(value)}
            aria-label="Frequently asked questions"
          >
            {faqItems.map((item, index) => {
              const isOpen = openItem === item.id;
              const delayClass = ITEM_DELAY_CLASSES[index] ?? "delay-0";

              return (
                <Accordion.Item
                  key={item.id}
                  value={item.id}
                  className={`border-b border-white/10 transition-all duration-300 ${delayClass} ${
                    isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                  } ${isOpen ? "scale-[1.01] bg-white/[0.02] shadow-[0_8px_24px_rgba(16,185,129,0.08)]" : "hover:bg-white/10"}`}
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between py-6 text-gray-300 outline-none transition-all duration-300 hover:text-white focus-visible:ring-[3px] focus-visible:ring-emerald-400/75">
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-all duration-300 ${
                          isOpen ? "rotate-180 text-emerald-400" : "text-gray-400"
                        }`}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div
                      className={`text-sm leading-relaxed text-gray-400 transition-all duration-300 ${
                        isOpen ? "translate-y-0 pb-6" : "translate-y-1 pb-0"
                      }`}
                    >
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        </div>
      </section>
    </main>
  );
}

