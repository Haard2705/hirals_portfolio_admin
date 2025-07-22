"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { name, email, subject, message } = formData;

    const { error } = await supabase.from("contact_form").insert([
      {
        name,
        email,
        subject,
        message,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Error submitting form:", error.message);
      alert("Failed to submit message.");
    } else {
      alert("Message submitted successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }
  };

  return (
    <section
      id="contact"
      className="min-h-screen w-full pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-white text-black overflow-x-hidden"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center md:text-left">
          Contact Me
        </h1>
        <p className="mb-10 text-lg md:text-xl text-center md:text-left">
          Have questions? Fill out the form below.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-4 sm:p-6 bg-white rounded-2xl shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              required
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="p-3 rounded-md w-full border-2 bg-white text-black"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 rounded-md w-full border-2 bg-white text-black"
            />
          </div>

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="p-3 rounded-md w-full border-2 bg-white text-black"
          />

          <textarea
            name="message"
            rows={5}
            required
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="p-3 rounded-md w-full border-2 bg-white text-black"
          ></textarea>

          <button
            type="submit"
            className="btn-theme w-full sm:w-auto disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
