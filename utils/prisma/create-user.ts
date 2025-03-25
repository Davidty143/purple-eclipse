// utils/prisma/createuser.ts
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { id, email, username, role = "USER" } = req.body; // Default role is "USER"

      // Check if a user with the same email or username already exists
      const existingUser = await prisma.account.findFirst({
        where: {
          OR: [{ account_email: email }, { account_username: username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email or username already exists",
        });
      }

      // Query the role based on role_type (which is an enum)
      const roleRecord = await prisma.role.findFirst({
        where: { role_type: role.toUpperCase() }, // Query by role_type
      });

      // If the role doesn't exist, set the default role to "USER"
      if (!roleRecord) {
        const defaultRole = await prisma.role.findFirst({
          where: { role_type: "USER" }, // Default to "USER"
        });

        if (!defaultRole) {
          return res
            .status(400)
            .json({ success: false, error: "Role 'USER' not found" });
        }

        // Create the user and associate the default role
        const user = await prisma.account.create({
          data: {
            account_id: id,
            account_email: email,
            account_username: username,
            account_status: "ACTIVE",
            account_is_deleted: false,
            account_role: {
              connect: {
                role_id: defaultRole.role_id, // Connect with the default "USER" role
              },
            },
          },
        });

        return res.status(200).json({ success: true, user });
      }

      // If the role exists, create the user and associate the role
      const user = await prisma.account.create({
        data: {
          account_id: id,
          account_email: email,
          account_username: username,
          account_status: "ACTIVE",
          account_is_deleted: false,
          account_role: {
            connect: {
              role_id: roleRecord.role_id, // Use the role_id for the provided role
            },
          },
        },
      });

      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Error creating user" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
