import { EntityValidationError } from "@/backend/@seedwork/domain/errors/validation.error";
import prisma from "../../../@seedwork/utils/db";
import { Player } from "../../domain/entities/player";
import { PlayerPrisma } from "../../infra/db/prisma/player-prisma";
import PlayerExistsError from "./errors/player-exists.error";
import { UpdatePlayerFixture } from "../../fixtures";
import { UpdatePlayerUseCase } from "./update-player.use-case";

const { PlayerRepository } = PlayerPrisma;

describe("UpdatePlayerUseCase Integration Tests", () => {
  let repository: PlayerPrisma.PlayerRepository;
  let useCase: UpdatePlayerUseCase.UseCase;

  beforeEach(async () => {
    await prisma.playerModel.deleteMany();
    repository = new PlayerRepository();
    useCase = new UpdatePlayerUseCase.UseCase(repository);
  });

  it("should throw an error on updating a player when name exists already", async () => {
    const entities = [
      Player.fake().aPlayer().withName("John Doe").build(),
      Player.fake().aPlayer().withName("Mary Doe").build(),
    ];
    await repository.bulkInsert(entities);

    try {
      await useCase.execute({ id: entities[1].id, name: "John Doe" });
      fail("Should throw PlayerExistsError");
    } catch (e) {
      expect(e).toBeInstanceOf(PlayerExistsError);
      if (e instanceof PlayerExistsError) {
        expect(e.message).toEqual(
          `John Doe exists already in the players collection`
        );
      }
    }
  });

  describe("should update player", () => {
    const arrange = UpdatePlayerFixture.arrangeForSave();
    const keysInResponse = UpdatePlayerFixture.keysInResponse();
    test.each(arrange)(
      "when value is $send_data",
      async ({ send_data, expected }) => {
        const createdPlayer = Player.fake().aPlayer().build();
        await repository.insert(createdPlayer);
        const output = await useCase.execute({
          id: createdPlayer.id,
          ...send_data,
        });
        const foundPlayer = await repository.findById(output.id);
        expect(Object.keys(output)).toEqual(keysInResponse);
        expect(output.name).toBe(expected.name);
        expect(foundPlayer.name).toBe(expected.name);
      }
    );
  });

  describe("should throw EntityValidationError", () => {
    const arrange =
      UpdatePlayerFixture.arrangeForUseCaseEntityValidationError();
    test.each(arrange)(
      "when label is $label",
      async ({ send_data, expected }) => {
        const createdPlayer = Player.fake().aPlayer().build();
        await repository.insert(createdPlayer);
        try {
          await useCase.execute({
            id: createdPlayer.id,
            ...(send_data as any),
          });
          fail("Should throw an entity validation error");
        } catch (e) {
          expect(e).toBeInstanceOf(EntityValidationError);
          if (e instanceof EntityValidationError) {
            expect(e.error).toEqual(expected.error);
          }
        }
      }
    );
  });
});
