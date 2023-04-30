import { EntityValidationError } from "@/backend/@seedwork/domain/errors/validation.error";
import prisma from "../../../@seedwork/utils/db";
import { PlayerPrisma } from "../../infra/db/prisma/player-prisma";
import { CreatePlayerUseCase } from "./create-player.use-case";
import PlayerExistsError from "./errors/player-exists.error";
import { CreatePlayerFixture } from "../../fixtures";

const { PlayerRepository } = PlayerPrisma;

describe("CreatePlayerUseCase Integration Tests", () => {
  let repository: PlayerPrisma.PlayerRepository;
  let useCase: CreatePlayerUseCase.UseCase;

  beforeEach(async () => {
    await prisma.playerModel.deleteMany();
    repository = new PlayerRepository();
    useCase = new CreatePlayerUseCase.UseCase(repository);
  });

  it("should throw an error on creating a player when name exists already", async () => {
    await useCase.execute({ name: "John Doe" });
    expect(useCase.execute({ name: "John Doe" })).rejects.toThrow(
      new PlayerExistsError(`John Doe exists already in the players collection`)
    );
  });

  describe("should create player", () => {
    const arrange = CreatePlayerFixture.arrangeForSave();
    const keysInResponse = CreatePlayerFixture.keysInResponse();
    test.each(arrange)(
      "when value is $send_data",
      async ({ send_data, expected }) => {
        const output = await useCase.execute(send_data);
        const foundPlayer = await repository.findById(output.id);
        expect(Object.keys(output)).toEqual(keysInResponse);
        expect(output.name).toBe(expected.name);
        expect(foundPlayer.name).toBe(expected.name);
      }
    );
  });

  describe("should thrown EntityValidationError", () => {
    const arrange = CreatePlayerFixture.arrangeForEntityValidationError();
    test.each(arrange)("when label is $label", async ({ send_data }) => {
      expect(useCase.execute(send_data as any)).rejects.toThrowError(
        EntityValidationError
      );
    });
  });
});
