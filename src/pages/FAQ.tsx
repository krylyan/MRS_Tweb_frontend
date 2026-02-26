import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-16 text-white md:px-12 md:py-24">
      <section aria-labelledby="faq-title" className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm md:p-8">
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
            {faqItems.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <Accordion.Item key={item.id} value={item.id} className="border-b border-white/10">
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between py-6 text-gray-300 transition-colors duration-300 hover:text-white outline-none">
                      <span>{item.question}</span>
                      <ChevronDown
                        className="h-4 w-4 transition-transform duration-300"
                        style={{
                          color: isOpen ? "#34d399" : "#9ca3af",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className="overflow-hidden">
                    <div
                      className="text-sm leading-relaxed text-gray-400 transition-all duration-300"
                      style={{
                        maxHeight: isOpen ? "160px" : "0px",
                        opacity: isOpen ? 1 : 0,
                        paddingBottom: isOpen ? "24px" : "0px",
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
