import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/db";

const registerSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    if (getUserByEmail(validatedData.email)) {
      return NextResponse.json(
        {
          message: "Email đã được sử dụng",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Check if username already exists (if provided)
    if (validatedData.username && getUserByUsername(validatedData.username)) {
      return NextResponse.json(
        {
          message: "Username đã được sử dụng",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      provider: "credentials",
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Return response in NestJS format
    return NextResponse.json(
      {
        data: {
          user: userWithoutPassword,
        },
        message: "Đăng ký thành công",
        statusCode: 201,
      },
      { status: 201 }
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
        message: "Có lỗi xảy ra khi đăng ký",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
