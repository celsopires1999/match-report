import prisma from "../../../@seedwork/utils/db";
import PlayerRepository from "../../domain/repository/player.repository";
import { PlayerPrisma } from "../../infra/db/prisma/player-prisma";
import { ListPlayerFixture } from "../../fixtures";
import { ListPlayersUseCase } from "./list-player.use-case";

describe("ListPlayersUseCase Integration Tests", () => {
  let useCase: ListPlayersUseCase.UseCase;
  let repository: PlayerRepository.Repository;

  beforeEach(async () => {
    await prisma.playerModel.deleteMany();
    repository = new PlayerPrisma.PlayerRepository();
    useCase = new ListPlayersUseCase.UseCase(repository);
  });

  describe("should return players ordered by name when query is empty", () => {
    const { arrange, entitiesMap } = ListPlayerFixture.arrange();
    const entities = Object.values(entitiesMap);

    beforeEach(async () => {
      await prisma.playerModel.deleteMany();
      await repository.bulkInsert(entities);
    });

    test.each(arrange)(
      "%#) when query_params is {page: $send_data.page, per_page: $send_data.per_page}",
      async ({ send_data, expected }) => {
        const output = await useCase.execute(send_data);
        expect(output).toEqual(expected);
      }
    );
  });

  describe("should search applying filter by name, sort and paginate", () => {
    const { arrange, entitiesMap } = ListPlayerFixture.arrangeUnsorted();
    const players = Object.values(entitiesMap);

    beforeEach(async () => {
      await repository.bulkInsert(players);
    });

    test.each(arrange)(
      "%#) when value is $search_params",
      async ({ send_data, expected }) => {
        const output = await useCase.execute(send_data);
        expect(output).toEqual(expected);
      }
    );
  });
});
