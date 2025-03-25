// app/api/prisma/create-user/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id, email, username, role = "USER" } = await req.json(); // Parse request body

    // Check if the user already exists by email or username
    const existingUser = await prisma.account.findFirst({
      where: {
        OR: [{ account_email: email }, { account_username: username }],
      },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: "User already exists" }),
        { status: 400 }
      );
    }

    // Create the user if they don't exist
    const user = await prisma.account.create({
      data: {
        account_id: id,
        account_email: email,
        account_username: username,
        account_status: "ACTIVE",
        account_is_deleted: false,
        account_role: {
          connect: {
            role_id: role, // Connect role if needed
          },
        },
      },
    });

    return new Response(JSON.stringify({ success: true, user }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: "Error creating user" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
