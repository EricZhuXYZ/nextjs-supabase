import { sendWelcomeEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!email || !name) {
      return NextResponse.json(
        { error: "email and name are required" },
        { status: 400 },
      );
    }

    await sendWelcomeEmail(email, name);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("欢迎邮件发送失败：", error);
    return NextResponse.json({ error: "failed to send welcome email" }, { status: 500 });
  }
}
