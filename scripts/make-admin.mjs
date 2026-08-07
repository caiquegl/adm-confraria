/**
 * Usage: node --env-file=.env scripts/make-admin.mjs user@email.com
 */
import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Informe o e-mail: node --env-file=.env scripts/make-admin.mjs user@email.com");
  process.exit(1);
}

const prisma = new PrismaClient();

const user = await prisma.user.update({
  data: { is_admin: true },
  select: { email: true, is_admin: true, name: true },
  where: { email },
});

console.log("Admin atualizado:", user);
await prisma.$disconnect();
