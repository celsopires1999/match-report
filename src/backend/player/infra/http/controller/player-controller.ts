import PlayerExistsError from "@/backend/player/application/use-cases/errors/player-exists.error";
import {
  createUseCase,
  listUseCase,
  getUseCase,
  deleteUseCase,
  updateUseCase,
} from "@/backend/player/infra/http/controller/player-provider";
import { instanceToPlain } from "class-transformer";
import { NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import NotFoundError from "../../../../@seedwork/domain/errors/not-found.error";
import { EntityValidationError } from "../../../../@seedwork/domain/errors/validation.error";
import { PlayerOutput } from "../../../application/dto/player-output";
import DeletePlayerUseCase from "../../../application/use-cases/delete-player.use-case";
import GetPlayerUseCase from "../../../application/use-cases/get-player.use-case";
import UpdatePlayerUseCase from "../../../application/use-cases/update-player.use-case";
import { CreatePlayerDto } from "../dto/create-player.dto";
import { SearchPlayerDto } from "../dto/search-player.dto";
import { UpdatePlayerDto } from "../dto/update-player.dto";
import {
  PlayerCollectionPresenter,
  PlayerPresenter,
} from "../presenter/player.presenter";

export type Response = {
  status: number;
  body?: any;
};

export class PlayerController {
  async create(body: any) {
    try {
      const createPlayerDto: CreatePlayerDto = {
        name: body.name,
        is_active: body.is_active,
      };
      const output = await createUseCase.execute(createPlayerDto);
      return NextResponse.json(PlayerController.playerToResponse(output), {
        status: 201,
      });
    } catch (e) {
      return this.errorHandling(e);
    }
  }

  async update(updatePlayerDto: UpdatePlayerDto, id: string) {
    if (!uuidValidate(id)) {
      return this.invalidUuidError();
    }

    try {
      const output = await updateUseCase.execute({
        id,
        ...updatePlayerDto,
      });
      return NextResponse.json(PlayerController.playerToResponse(output), {
        status: 200,
      });
    } catch (e) {
      return this.errorHandling(e);
    }
  }

  async remove(id: string) {
    if (!uuidValidate(id)) {
      return this.invalidUuidError();
    }

    try {
      const output = await deleteUseCase.execute({ id });
      return NextResponse.json(PlayerController.playerToResponse(output), {
        status: 200,
      });
    } catch (e) {
      return this.errorHandling(e);
    }
  }

  async findOne(id: string) {
    if (!uuidValidate(id)) {
      return this.invalidUuidError();
    }

    try {
      const output = await getUseCase.execute({ id });
      return NextResponse.json(PlayerController.playerToResponse(output), {
        status: 200,
      });
    } catch (e) {
      return this.errorHandling(e);
    }
  }

  async search(searchParams: URLSearchParams) {
    const searchPlayerDto = new SearchPlayerDto(searchParams);
    try {
      const output = await listUseCase.execute(searchPlayerDto);
      return NextResponse.json(
        instanceToPlain(instanceToPlain(new PlayerCollectionPresenter(output))),
        { status: 200 }
      );
    } catch (e) {
      return NextResponse.json(this.internalServerError(e));
    }
  }

  private invalidUuidError() {
    return NextResponse.json(
      {
        statusCode: 422,
        error: "Unprocessable Entity",
        message: "Validation failed (uuid v4 is expected)",
      },
      { status: 422 }
    );
  }

  private errorHandling(e: unknown) {
    if (e instanceof NotFoundError) {
      return this.notFoundError(e);
    } else if (e instanceof EntityValidationError) {
      return this.entityValidationError(e);
    } else if (e instanceof PlayerExistsError) {
      return this.playerExistsError(e);
    } else {
      return this.internalServerError(e);
    }
  }

  private notFoundError(e: NotFoundError) {
    return NextResponse.json(
      {
        message: e.message,
        statusCode: 404,
        error: "Not Found",
      },
      { status: 404 }
    );
  }

  private entityValidationError(e: EntityValidationError) {
    return NextResponse.json(
      {
        message: Object.values(e.error).flat(),
        statusCode: 422,
        error: "Unprocessable Entity",
      },
      { status: 422 }
    );
  }

  private playerExistsError(e: PlayerExistsError) {
    return NextResponse.json(
      {
        message: e.message,
        statusCode: 422,
        error: "Unprocessable Entity",
      },
      { status: 422 }
    );
  }

  private internalServerError(e: unknown) {
    return NextResponse.json(JSON.stringify(e), { status: 500 });
  }

  static playerToResponse(output: PlayerOutput) {
    return { data: instanceToPlain(new PlayerPresenter(output)) };
  }
}
