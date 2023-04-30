import { controller } from "@/backend/player/infra/http/controller/player-provider";
import { NextRequest } from "next/server";

export function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.findOne(params.id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return controller.update(body, params.id);
}

export function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.remove(params.id);
}
