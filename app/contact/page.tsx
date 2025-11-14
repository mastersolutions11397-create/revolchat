"use client";

import { useState } from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          company: "",
          subject: "",
          message: "",
          inquiryType: "general",
        });
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                {t("contact.title")}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                {t("contact.subtitle")}
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto rounded-2xl overflow-hidden">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/yetti/yetti_laying.png"
                  alt="yetti Contact"
                  fill
                  className="object-contain rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("contact.sendMessage")}
              </h2>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">
                    Thank you for your message! We&apos;ll get back to you soon.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col h-full gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("contact.name")}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("contact.email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("contact.company")}
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("contact.inquiryType")}
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    >
                      <option value="general">{t("contact.general")}</option>
                      <option value="sales">{t("contact.sales")}</option>
                      <option value="support">{t("contact.support")}</option>
                      <option value="partnership">{t("contact.partnership")}</option>
                      <option value="media">{t("contact.media")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.subject")}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="flex flex-col grow">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full h-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                >
                  {isSubmitting ? (
                    t("contact.sending")
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t("contact.sendButton")}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("contact.contactInfo")}
              </h2>

              <div className="space-y-6 grow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Email
                    </h3>
                    <p className="text-gray-600">hello@yettiai.com</p>
                    <p className="text-sm text-gray-500">
                      We&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Phone
                    </h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">
                      Monday to Friday, 9 AM - 6 PM PST
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Live Chat
                    </h3>
                    <p className="text-gray-600">Available 9 AM - 6 PM PST</p>
                    <p className="text-sm text-gray-500">
                      Monday through Friday
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Office
                    </h3>
                    <p className="text-gray-600">123 AI Street</p>
                    <p className="text-gray-600">San Francisco, CA 94105</p>
                    <p className="text-sm text-gray-500">United States</p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="text-gray-900 font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="text-gray-900 font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="text-gray-900 font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}