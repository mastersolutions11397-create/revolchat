"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
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
    } catch (error) {
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
                Get in Touch
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                Have questions? We'd love to hear from you. Send us a message and
                we'll respond as soon as possible.
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_handsup.png"
                  alt="Yeti Contact"
                  fill
                  className="object-contain"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
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
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales Question</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="media">Media Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#5170ff] hover:bg-[#4a68f0] text-white py-3 px-4 rounded-xl font-semibold transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in touch
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#5170ff] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <p className="text-gray-600">hello@yetiai.com</p>
                      <p className="text-sm text-gray-500">
                        We'll respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#5170ff] rounded-lg flex items-center justify-center flex-shrink-0">
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
                    <div className="w-12 h-12 bg-[#5170ff] rounded-lg flex items-center justify-center flex-shrink-0">
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
              </div>

              {/* FAQ Section */}
              <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      How quickly can I get started?
                    </h3>
                    <p className="text-gray-600">
                      You can set up your first AI agent integration in under 5
                      minutes with our guided setup process.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Do you offer custom integrations?
                    </h3>
                    <p className="text-gray-600">
                      Yes! We work with enterprise customers to create custom
                      integrations for their specific needs.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      What platforms do you support?
                    </h3>
                    <p className="text-gray-600">
                      We currently support Instagram, Telegram, WhatsApp, and are
                      constantly adding new platforms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Yetti Image */}
              <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 overflow-hidden">
                <div className="relative w-full aspect-square">
                  <Image
                    src="/yetti/yetti_angry.png"
                    alt="Yeti Contact"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
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