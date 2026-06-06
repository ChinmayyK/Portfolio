"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return { success: false, error: "All fields are required." };
    }

    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <hello@chinmaykudalkar.com>",
      to: ["chinmayy.kudalkar@gmail.com"],
      subject: `New Portfolio Inquiry from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Message sent successfully!" };
  } catch (err: any) {
    console.error("Server Action Error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
