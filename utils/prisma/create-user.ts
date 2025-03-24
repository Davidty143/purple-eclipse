import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { id, email, username, role } = req.body;
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

      const roleRecord = await prisma.role.findUnique({
        where: { role_type: role.toUpperCase() },
      });

      if (!roleRecord) {
        return res
          .status(400)
          .json({ success: false, error: "Role not found" });
      }

      const user = await prisma.account.create({
        data: {
          account_id: id,
          account_email: email,
          account_username: username,
          account_status: "ACTIVE",
          account_is_deleted: false,
          account_role: {
            connect: {
              role_id: roleRecord.role_id,
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
