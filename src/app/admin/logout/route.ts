import { logoutAction } from "@/app/actions/auth";

export async function GET() {
  await logoutAction();
}

export async function POST() {
  await logoutAction();
}
