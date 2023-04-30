import NotFoundError from "../../../@seedwork/domain/errors/not-found.error";
import prisma from "../../../@seedwork/utils/db";
import { Player } from "../../domain/entities/player";
import { PlayerPrisma } from "../../infra/db/prisma/player-prisma";
import { DeletePlayerUseCase } from "./delete-player.use-case";

const { PlayerRepository } = PlayerPrisma;

describe("DeletePlayerUseCase Integration Tests", () => {
  let repository: PlayerPrisma.PlayerRepository;
  let useCase: DeletePlayerUseCase.UseCase;

  beforeEach(async () => {
    await prisma.playerModel.deleteMany();
    repository = new PlayerRepository();
    useCase = new DeletePlayerUseCase.UseCase(repository);
  });

  it("should delete a player", async () => {
    const entity = Player.fake().aPlayer().build();
    repository.insert(entity);
    await useCase.execute({ id: entity.id });
    expect(repository.findById(entity.id)).rejects.toThrow(
      new NotFoundError(`Entity not found using ID ${entity.id}`)
    );
  });

  it("should throw an error when player is not found", async () => {
    expect(useCase.execute({ id: "fake-id" })).rejects.toThrow(
      new NotFoundError(`Entity not found using ID fake-id`)
    );
  });
});
