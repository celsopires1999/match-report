import NotFoundError from "../../../@seedwork/domain/errors/not-found.error";
import prisma from "../../../@seedwork/utils/db";
import { Player } from "../../domain/entities/player";
import { PlayerPrisma } from "../../infra/db/prisma/player-prisma";
import { GetPlayerUseCase } from "./get-player.use-case";

const { PlayerRepository } = PlayerPrisma;

describe("GetPlayerUseCase Integration Tests", () => {
  let repository: PlayerPrisma.PlayerRepository;
  let useCase: GetPlayerUseCase.UseCase;

  beforeEach(async () => {
    await prisma.playerModel.deleteMany();
    repository = new PlayerRepository();
    useCase = new GetPlayerUseCase.UseCase(repository);
  });

  it("should get a player", async () => {
    const entity = new Player({ name: "John Doe" });
    repository.insert(entity);
    const output = await useCase.execute({ id: entity.id });
    const foundPlayer = await repository.findById(output.id);
    expect(output.name).toBe(entity.name);
    expect(output.id).toBe(entity.id);
    expect(foundPlayer.id).toBe(entity.id);
    expect(foundPlayer.name).toBe(entity.name);
    expect(foundPlayer.is_active).toBe(entity.is_active);
  });

  it("should throw an error when player is not found", async () => {
    expect(useCase.execute({ id: "fake-id" })).rejects.toThrow(
      new NotFoundError(`Entity not found using ID fake-id`)
    );
  });
});
