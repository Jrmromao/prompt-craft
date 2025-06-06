"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, Prisma, UserStatus } from "@prisma/client";

export type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  planType: string;
  status: UserStatus;
  joinedAt: string;
};

export async function getUsers(search?: string, role?: Role) {
  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    }),
    ...(role && { role }),
  };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      planType: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    ...user,
    joinedAt: user.createdAt.toISOString().split("T")[0],
  }));
}

export async function updateUserStatus(userId: string, status: UserData["status"]) {
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: Role) {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
} 