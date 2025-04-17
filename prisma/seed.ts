import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingRoles = await prisma.role.findMany();

  if (existingRoles.length === 0) {
    await prisma.role.create({
      data: {
        role_type: 'USER'
      } as any
    });

    await prisma.role.create({
      data: {
        role_type: 'ADMIN'
      } as any
    });
  }

  console.log('Roles seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
