import { controller } from "@/backend/player/infra/http/controller/player-provider";

export async function POST(request: Request) {
  const body = await request.json();
  return await controller.create(body);
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return controller.search(searchParams);
}
