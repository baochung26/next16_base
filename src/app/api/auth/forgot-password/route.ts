import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail, createPasswordResetToken } from "@/lib/db";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const user = getUserByEmail(validatedData.email);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        {
          data: {
            message: "Nếu email tồn tại, chúng tôi đã gửi link reset password",
          },
          message: "Nếu email tồn tại, chúng tôi đã gửi link reset password",
          statusCode: 200,
        },
        { status: 200 }
      );
    }

    // Create reset token
    const resetToken = createPasswordResetToken(user.id);

    // In production, send email with reset link
    // For now, we'll just return the token (remove this in production!)
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

    console.log("Reset password link:", resetLink); // Remove in production!

    return NextResponse.json(
      {
        data: {
          message: "Nếu email tồn tại, chúng tôi đã gửi link reset password",
          // Remove this in production - only for development
          resetLink:
            process.env.NODE_ENV === "development" ? resetLink : undefined,
        },
        message: "Nếu email tồn tại, chúng tôi đã gửi link reset password",
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.errors[0].message,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Có lỗi xảy ra",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
