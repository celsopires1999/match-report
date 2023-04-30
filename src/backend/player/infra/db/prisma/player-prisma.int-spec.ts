import DuplicatedError from "@/backend/@seedwork/domain/errors/duplicated.error";
import NotFoundError from "@/backend/@seedwork/domain/errors/not-found.error";
import prisma from "@/backend/@seedwork/utils/db";
import { Player } from "../../../domain/entities/player";
import { PlayerFakeBuilder } from "../../../domain/entities/player-fake-builder";
import { PlayerRepository } from "../../../domain/repository/player.repository";
import { PlayerPrisma } from "./player-prisma";

const { PlayerModelMapper } = PlayerPrisma;

describe("Player Integration Test", () => {
  let repository: PlayerPrisma.PlayerRepository;
  beforeEach(async () => {
    repository = new PlayerPrisma.PlayerRepository();
    await prisma.playerModel.deleteMany();
  });

  it("should create a player", async () => {
    const entity = Player.fake().aPlayer().build();
    await repository.insert(entity);
    const createdPlayer = await repository.findById(entity.id);
    expect(createdPlayer.toJSON()).toEqual(entity.toJSON());
  });

  it("should throw an error on creating when a player exists already", async () => {
    const entity = Player.fake().aPlayer().build();
    await repository.insert(entity);
    expect(repository.insert(entity)).rejects.toThrow(
      new DuplicatedError(`Entity duplicated with ID ${entity.id}`)
    );
  });

  it("should update a player", async () => {
    const entity = Player.fake().aPlayer().build();
    await repository.insert(entity);

    entity.update("John Doe");
    await repository.update(entity);

    let entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  it("should throw an error on updating when player is not found", async () => {
    const entity = Player.fake().aPlayer().build();

    expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(`Entity not found using ID ${entity.id}`)
    );
  });

  it("should delete a player", async () => {
    const entity = Player.fake().aPlayer().build();
    await repository.insert(entity);
    await repository.delete(entity.id);
    expect(repository.findById(entity.id)).rejects.toThrow(
      new NotFoundError(`Entity not found using ID ${entity.id}`)
    );
  });

  it("should throw an error on deleting when player is not found", async () => {
    const entity = Player.fake().aPlayer().build();

    expect(repository.delete(entity.id)).rejects.toThrow(
      new NotFoundError(`Entity not found using ID ${entity.id}`)
    );
  });

  it("should find a player by id", async () => {
    const entity = new Player({ name: "Mary Doe" });
    await repository.insert(entity);
    const createdPlayer = await repository.findById(entity.id);
    expect(createdPlayer.toJSON()).toEqual(entity.toJSON());
  });

  it("should throw an error when player is not found", async () => {
    expect(repository.findById("fake-id")).rejects.toThrow(
      new NotFoundError(`Entity not found using ID fake-id`)
    );
  });

  it("should find all players", async () => {
    const players = PlayerFakeBuilder.thePlayers(2).build();
    await repository.bulkInsert(players);
    const foundPlayers = await repository.findAll();
    expect(JSON.stringify(foundPlayers)).toEqual(JSON.stringify(players));
  });

  it("should find a player by name", async () => {
    const player = Player.fake().aPlayer().build();
    await repository.insert(player);
    expect(repository.exists(player.name)).toBeTruthy();
  });

  it("should not find a player by name", async () => {
    const player = Player.fake().aPlayer().build();
    expect(await repository.exists(player.name)).toBeFalsy();
  });

  describe("search method", () => {
    it("should only apply paginate when other params are null ", async () => {
      const players = Player.fake().thePlayers(16).build();
      await repository.bulkInsert(players);
      const spyToEntity = jest.spyOn(PlayerModelMapper, "toEntity");

      const searchOutput = await repository.search(
        PlayerRepository.SearchParams.create()
      );

      expect(searchOutput).toBeInstanceOf(PlayerRepository.SearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      });
    });

    it("should order by name ASC when search params are null", async () => {
      const players = Player.fake()
        .thePlayers(16)
        .withName((index) => `John Doe${index.toString().padStart(2, "0")}`)
        .build();
      await repository.bulkInsert(players);

      let searchOutputActual = await repository.search(
        PlayerRepository.SearchParams.create()
      );

      [...searchOutputActual.items].forEach((i, index) => {
        expect(i.name).toBe(`John Doe${index.toString().padStart(2, "0")}`);
      });

      searchOutputActual = await repository.search(
        PlayerRepository.SearchParams.create({ page: 2, per_page: 15 })
      );
      expect(searchOutputActual.items.length).toBe(1);
      expect(searchOutputActual.items[0].name).toBe(`John Doe15`);
    });

    it("should apply paginate and filter by name", async () => {
      const players = [
        Player.fake().aPlayer().withName("test").build(),
        Player.fake().aPlayer().withName("a").build(),
        Player.fake().aPlayer().withName("TEST").build(),
        Player.fake().aPlayer().withName("TeSt").build(),
      ];
      await repository.bulkInsert(players);

      let searchOutput = await repository.search(
        PlayerRepository.SearchParams.create({
          page: 1,
          per_page: 2,
          filter: { name: "TEST" },
        })
      );
      expect(searchOutput.toJSON()).toMatchObject(
        new PlayerRepository.SearchResult({
          items: [players[0], players[3]],
          total: 3,
          current_page: 1,
          per_page: 2,
          sort: null,
          sort_dir: null,
          filter: { name: "TEST" },
        }).toJSON()
      );

      searchOutput = await repository.search(
        PlayerRepository.SearchParams.create({
          page: 2,
          per_page: 2,
          filter: { name: "TEST" },
        })
      );
      expect(searchOutput.toJSON()).toMatchObject(
        new PlayerRepository.SearchResult({
          items: [players[2]],
          total: 3,
          current_page: 2,
          per_page: 2,
          sort: null,
          sort_dir: null,
          filter: { name: "TEST" },
        }).toJSON()
      );
    });

    it("should apply paginate and sort by name", async () => {
      expect(repository.sortableFields).toStrictEqual(["name", "is_active"]);

      const players = [
        Player.fake().aPlayer().withName("b").build(),
        Player.fake().aPlayer().withName("a").build(),
        Player.fake().aPlayer().withName("d").build(),
        Player.fake().aPlayer().withName("e").build(),
        Player.fake().aPlayer().withName("c").build(),
      ];
      await repository.bulkInsert(players);

      const arrange = [
        {
          params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[1], players[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[4], players[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[3], players[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[4], players[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "desc",
            filter: null,
          }),
        },
      ];

      for (const i of arrange) {
        let result = await repository.search(i.params);
        expect(result.toJSON()).toMatchObject(i.result.toJSON());
      }
    });

    it("should apply paginate and sort by is_active", async () => {
      expect(repository.sortableFields).toStrictEqual(["name", "is_active"]);

      const players = [
        Player.fake().aPlayer().withName("b").activate().build(),
        Player.fake().aPlayer().withName("a").deactivate().build(),
        Player.fake().aPlayer().withName("d").activate().build(),
        Player.fake().aPlayer().withName("e").deactivate().build(),
        Player.fake().aPlayer().withName("c").activate().build(),
      ];
      await repository.bulkInsert(players);

      const arrange = [
        {
          params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "is_active",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[1], players[3]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "is_active",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 2,
            per_page: 2,
            sort: "is_active",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[0], players[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "is_active",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 3,
            per_page: 2,
            sort: "is_active",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[4]],
            total: 5,
            current_page: 3,
            per_page: 2,
            sort: "is_active",
            sort_dir: "asc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "is_active",
            sort_dir: "desc",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[0], players[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
            sort: "is_active",
            sort_dir: "desc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 2,
            per_page: 2,
            sort: "is_active",
            sort_dir: "desc",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[4], players[1]],
            total: 5,
            current_page: 2,
            per_page: 2,
            sort: "is_active",
            sort_dir: "desc",
            filter: null,
          }),
        },
        {
          params: PlayerRepository.SearchParams.create({
            page: 3,
            per_page: 2,
            sort: "is_active",
            sort_dir: "desc",
          }),
          result: new PlayerRepository.SearchResult({
            items: [players[3]],
            total: 5,
            current_page: 3,
            per_page: 2,
            sort: "is_active",
            sort_dir: "desc",
            filter: null,
          }),
        },
      ];

      for (const i of arrange) {
        let result = await repository.search(i.params);
        expect(result.toJSON()).toMatchObject(i.result.toJSON());
      }
    });

    describe("should search using filter by name, sort and paginate", () => {
      const players = [
        Player.fake().aPlayer().withName("test").build(),
        Player.fake().aPlayer().withName("a").build(),
        Player.fake().aPlayer().withName("TEST").build(),
        Player.fake().aPlayer().withName("e").build(),
        Player.fake().aPlayer().withName("TeSt").build(),
      ];

      let arrange = [
        {
          search_params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { name: "TEST" },
          }),
          search_result: new PlayerRepository.SearchResult({
            items: [players[0], players[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: { name: "TEST" },
          }),
        },
        {
          search_params: PlayerRepository.SearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: { name: "TEST" },
          }),
          search_result: new PlayerRepository.SearchResult({
            items: [players[2]],
            total: 3,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: { name: "TEST" },
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(players);
      });

      test.each(arrange)(
        "when value is $search_params",
        async ({ search_params, search_result }) => {
          let result = await repository.search(search_params);
          expect(result.toJSON()).toMatchObject(search_result.toJSON());
        }
      );
    });

    describe("should search using filter by is_active, sort and paginate", () => {
      const players = [
        Player.fake().aPlayer().withName("test").activate().build(),
        Player.fake().aPlayer().withName("a").deactivate().build(),
        Player.fake().aPlayer().withName("TEST").activate().build(),
        Player.fake().aPlayer().withName("e").deactivate().build(),
        Player.fake().aPlayer().withName("TeSt").activate().build(),
      ];

      let arrange = [
        {
          search_params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { is_active: true },
          }),
          search_result: new PlayerRepository.SearchResult({
            items: [players[0], players[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: { is_active: true },
          }),
        },
        {
          search_params: PlayerRepository.SearchParams.create({
            page: 2,
            per_page: 2,
            sort: "name",
            filter: { is_active: true },
          }),
          search_result: new PlayerRepository.SearchResult({
            items: [players[2]],
            total: 3,
            current_page: 2,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: { is_active: true },
          }),
        },
        {
          search_params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { is_active: false },
          }),
          search_result: new PlayerRepository.SearchResult({
            items: [players[1], players[3]],
            total: 2,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: { is_active: false },
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(players);
      });

      test.each(arrange)(
        "when value is $search_params",
        async ({ search_params, search_result }) => {
          let result = await repository.search(search_params);
          expect(result.toJSON()).toMatchObject(search_result.toJSON());
        }
      );
    });

    describe("should search using filter by name and is_active, sort and paginate", () => {
      const players = [
        Player.fake().aPlayer().withName("test").activate().build(),
        Player.fake().aPlayer().withName("a").deactivate().build(),
        Player.fake().aPlayer().withName("TEST").deactivate().build(),
        Player.fake().aPlayer().withName("e").deactivate().build(),
        Player.fake().aPlayer().withName("TeSt").activate().build(),
      ];

      let arrange = [
        {
          search_params: PlayerRepository.SearchParams.create({
            page: 1,
            per_page: 2,
            sort: "name",
            filter: { name: "te", is_active: false },
          }),
          search_result: new PlayerRepository.SearchResult({
            items: [players[2]],
            total: 1,
            current_page: 1,
            per_page: 2,
            sort: "name",
            sort_dir: "asc",
            filter: { name: "te", is_active: false },
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(players);
      });

      test.each(arrange)(
        "when value is $search_params",
        async ({ search_params, search_result }) => {
          let result = await repository.search(search_params);
          expect(result.toJSON()).toMatchObject(search_result.toJSON());
        }
      );
    });
  });
});
