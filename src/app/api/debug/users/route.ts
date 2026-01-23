import { NextResponse } from "next/server";
import { getUsers } from "@/lib/db";
import path from "path";

export async function GET() {
  try {
    const usersFilePath = path.join(process.cwd(), "src/lib/db/users.json");
    const users = getUsers();

    return NextResponse.json({
      success: true,
      filePath: usersFilePath,
      fileExists: require("fs").existsSync(usersFilePath),
      usersCount: users.length,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        hasPassword: !!u.password,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
