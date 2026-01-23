import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getPasswordResetToken,
  deletePasswordResetToken,
  getUserById,
  updateUser,
} from "@/lib/db";

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Get reset token
    const resetToken = getPasswordResetToken(validatedData.token);
    if (!resetToken) {
      return NextResponse.json(
        {
          message: "Token không hợp lệ hoặc đã hết hạn",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Get user
    const user = getUserById(resetToken.userId);
    if (!user) {
      return NextResponse.json(
        {
          message: "Người dùng không tồn tại",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // Update password
    await updateUser(user.id, {
      password: validatedData.password,
    });

    // Delete reset token
    deletePasswordResetToken(validatedData.token);

    return NextResponse.json(
      {
        data: {
          message: "Đặt lại mật khẩu thành công",
        },
        message: "Đặt lại mật khẩu thành công",
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
