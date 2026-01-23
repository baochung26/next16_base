import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmailOrUsername, verifyPassword } from "@/lib/db";
import { randomUUID } from "crypto";

const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập username hoặc email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = getUserByEmailOrUsername(validatedData.identifier);
    if (!user || !user.password) {
      return NextResponse.json(
        {
          message: "Username/Email hoặc mật khẩu không đúng",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        {
          message: "Username/Email hoặc mật khẩu không đúng",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    // Generate fake JWT token with user ID embedded
    // Format: fake-jwt-token-{userId}|{random}
    // In production, backend will generate real JWT with user info
    const accessToken = `fake-jwt-token-${user.id}|${randomUUID()}`;
    const refreshToken = `fake-refresh-token-${randomUUID()}`;

    // Return response in NestJS format
    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          image: user.image,
        },
        accessToken,
        refreshToken,
      },
      message: "Đăng nhập thành công",
      statusCode: 200,
    });
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

    console.error("Login error:", error);
    return NextResponse.json(
      {
        message: "Có lỗi xảy ra khi đăng nhập",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
