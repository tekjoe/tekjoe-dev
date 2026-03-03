"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const ease = [0.33, 1, 0.68, 1] as const;

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.15 * i, ease },
  }),
};

const inputClass =
  "w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-vhs-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-vhs-yellow/60 focus:ring-1 focus:ring-vhs-yellow/30 transition-colors duration-300";

export function ContactForm() {
  const ref = useRef<HTMLFormElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to send message."
      );
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="border border-vhs-yellow/30 bg-vhs-yellow/5 p-8 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-vhs-yellow mb-3">
          Message Sent
        </p>
        <p className="text-vhs-white-muted text-sm leading-relaxed">
          Thanks for reaching out! I&apos;ll get back to you soon.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {(
        [
          { name: "name", label: "Name", type: "text", placeholder: "Your name" },
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "subject", label: "Subject", type: "text", placeholder: "What's this about?" },
        ] as const
      ).map((field, i) => (
        <motion.div
          key={field.name}
          custom={i}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fieldVariants}
        >
          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-vhs-gray mb-2">
            {field.label}
          </label>
          <input
            type={field.type}
            name={field.name}
            value={form[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            required
            className={inputClass}
          />
        </motion.div>
      ))}

      <motion.div
        custom={3}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fieldVariants}
      >
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-vhs-gray mb-2">
          Message
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell me about your project..."
          required
          rows={5}
          className={`${inputClass} resize-none`}
        />
      </motion.div>

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 font-mono text-xs"
        >
          {errorMsg}
        </motion.p>
      )}

      <motion.div
        custom={4}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fieldVariants}
      >
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full px-8 py-4 bg-vhs-yellow text-vhs-bg font-bold uppercase tracking-wider text-sm hover:bg-vhs-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Sending...
            </span>
          ) : (
            "Send Message"
          )}
        </button>
      </motion.div>
    </form>
  );
}
