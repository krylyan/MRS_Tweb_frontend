import { useEffect, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

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
        to="/"
        aria-label="Go to home page"
        className="inline-flex items-center space-x-3"
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 30 }}
      >
        <div className="bg-gradient-to-br from-emerald-400 to-blue-500 p-2 rounded-lg">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <span className="text-4xl font-bold text-white md:text-2xl">FitLife</span>
      </Link>

      <section aria-labelledby="faq-title" className="mx-auto w-full max-w-4xl">
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm md:p-8"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0px)" : "translateY(20px)",
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
          }}
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
            onValueChange={setOpenItem}
            aria-label="Frequently asked questions"
          >
            {faqItems.map((item, index) => {
              const isOpen = openItem === item.id;

              return (
                <Accordion.Item
                  key={item.id}
                  value={item.id}
                  className="border-b border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-emerald-500/20"
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded
                      ? `translateY(0px) scale(${isOpen ? 1.01 : 1})`
                      : "translateY(20px) scale(1)",
                    backgroundColor: isOpen ? "rgba(255,255,255,0.02)" : "transparent",
                    boxShadow: isOpen
                      ? "0 8px 24px rgba(16, 185, 129, 0.08)"
                      : "0 0 0 rgba(0,0,0,0)",
                    transition: `opacity 600ms ease-out ${index * 80}ms, transform 600ms ease-out ${index * 80}ms, background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  }}
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="flex w-full items-center justify-between py-6 text-gray-300 transition-all duration-300 hover:text-white outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      style={{ "--ring": "rgb(52 211 153 / 0.75)" } as React.CSSProperties}
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className="h-4 w-4 transition-transform"
                        style={{
                          color: isOpen ? "#34d399" : "#9ca3af",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transitionDuration: "250ms",
                          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content
                    className="overflow-hidden data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
                  >
                    <div
                      className="text-sm leading-relaxed text-gray-400 data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
                      data-state={isOpen ? "open" : "closed"}
                      style={{
                        maxHeight: isOpen ? "180px" : "0px",
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? "translateY(0px)" : "translateY(5px)",
                        paddingBottom: isOpen ? "24px" : "0px",
                        transition: "max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1), padding-bottom 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
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
