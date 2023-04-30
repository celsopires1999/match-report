import prisma from "@/backend/@seedwork/utils/db";
import { flatten } from "@/backend/@seedwork/utils/tests/q-flat";
import { Player } from "@/backend/player/domain/entities/player";
import { PlayerRepository } from "@/backend/player/domain/repository/player.repository";
import {
  CreatePlayerFixture,
  DeletePlayerFixture,
  ListPlayerFixture,
  PlayerFixture,
  UpdatePlayerFixture,
} from "@/backend/player/fixtures";
import { PlayerPrisma } from "@/backend/player/infra/db/prisma/player-prisma";
import { controller } from "@/backend/player/infra/http/controller/player-provider";
import { instanceToPlain } from "class-transformer";
import {
  PlayerCollectionPresenter,
  PlayerPresenter,
} from "../presenter/player.presenter";
import NotFoundError from "@/backend/@seedwork/domain/errors/not-found.error";

describe("PlayerController Integration Test", () => {
  describe("search method", () => {
    describe("should return players ordered by name when query is empty", () => {
      let playerRepo: PlayerRepository.Repository;
      const { arrange, entitiesMap } = ListPlayerFixture.arrange();
      const entities = Object.values(entitiesMap);

      beforeEach(async () => {
        await prisma.playerModel.deleteMany();
        playerRepo = new PlayerPrisma.PlayerRepository();
        await playerRepo.bulkInsert(entities);
      });

      test.each(arrange)(
        "when query_params is {page: $send_data.page, per_page: $send_data.per_page}",
        async ({ send_data, expected }) => {
          const searchParams = new URLSearchParams(send_data as any);
          const res = await controller.search(searchParams);
          const body = await res.json();

          expect(Object.keys(body)).toStrictEqual(["data", "meta"]);
          expect(res.status).toBe(200);
          const presenter = new PlayerCollectionPresenter(expected);
          const serialized = instanceToPlain(presenter);
          expect(body).toEqual(serialized);
        }
      );
    });

    describe("should return players using paginate, sort and filter", () => {
      let playerRepo: PlayerRepository.Repository;
      const { arrange, entitiesMap } = ListPlayerFixture.arrangeUnsorted();
      const entities = Object.values(entitiesMap);

      beforeEach(async () => {
        await prisma.playerModel.deleteMany();
        playerRepo = new PlayerPrisma.PlayerRepository();
        await playerRepo.bulkInsert(entities);
      });

      test.each(arrange)(
        "when query_params is {filter: $send_data.filter, sort: $send_data.sort, page: $send_data.page, per_page: $send_data.per_page}",
        async ({ send_data, expected }) => {
          const input = flatten(send_data);
          const searchParams = new URLSearchParams(input);
          const res = await controller.search(searchParams);
          const body = await res.json();

          expect(Object.keys(body)).toStrictEqual(["data", "meta"]);
          expect(res.status).toBe(200);
          const presenter = new PlayerCollectionPresenter(expected);
          const serialized = instanceToPlain(presenter);
          expect(body).toEqual(serialized);
        }
      );
    });
  });

  describe("findOne method", () => {
    describe("should give a response error with 422/404 when id is invalid or not found", () => {
      beforeEach(async () => {
        await prisma.playerModel.deleteMany();
      });

      const arrange = [
        {
          label: "INVALID",
          id: "fake id",
          expected: {
            statusCode: 422,
            error: "Unprocessable Entity",
            message: "Validation failed (uuid v4 is expected)",
          },
        },
        {
          label: "NOT FOUND",
          id: "d0ba5077-fb6d-406f-bd05-8c521ba9425a",
          expected: {
            statusCode: 404,
            error: "Not Found",
            message:
              "Entity not found using ID d0ba5077-fb6d-406f-bd05-8c521ba9425a",
          },
        },
      ];
      test.each(arrange)("id contents: $label", async ({ id, expected }) => {
        const res = await controller.findOne(id);
        const body = await res.json();
        expect(body).toEqual(expected);
        expect(res.status).toBe(expected.statusCode);
      });
    });

    it("should get a player", async () => {
      const playerRepo = new PlayerPrisma.PlayerRepository();
      const createdPlayer = Player.fake().aPlayer().build();
      await playerRepo.insert(createdPlayer);
      const res = await controller.findOne(createdPlayer.id);
      const body = await res.json();
      expect(res.status).toBe(200);
      const keysInResponse = PlayerFixture.keysInResponse();
      expect(Object.keys(body)).toStrictEqual(["data"]);
      expect(Object.keys(body.data)).toStrictEqual(keysInResponse);
      const presenter = new PlayerPresenter(createdPlayer.toJSON());
      const serialized = instanceToPlain(presenter);
      expect(body.data).toEqual(serialized);
    });
  });

  describe("create method", () => {
    beforeEach(async () => {
      await prisma.playerModel.deleteMany();
    });

    describe("should give a response error with 422 when throw EntityValidationError", () => {
      const arrange = CreatePlayerFixture.arrangeForEntityValidationError();

      test.each(arrange)(
        "when body is $label",
        async ({ send_data, expected }) => {
          const res = await controller.create(send_data);
          const body = await res.json();
          expect(body).toEqual(expected);
          expect(res.status).toBe(expected.statusCode);
        }
      );
    });

    describe("should create player", () => {
      const arrange = CreatePlayerFixture.arrangeForSave();
      let playerRepo: PlayerRepository.Repository;

      beforeEach(async () => {
        playerRepo = new PlayerPrisma.PlayerRepository();
      });

      test.each(arrange)(
        "when body is $send_data",
        async ({ send_data, expected }) => {
          const res = await controller.create(send_data);
          const body = await res.json();
          expect(res.status).toBe(201);
          const keysInResponse = CreatePlayerFixture.keysInResponse();
          expect(Object.keys(body)).toStrictEqual(["data"]);
          expect(Object.keys(body.data)).toStrictEqual(keysInResponse);
          const id = body.data.id;
          const player = await playerRepo.findById(id);
          const presenter = new PlayerPresenter(player.toJSON());
          const serialized = instanceToPlain(presenter);
          expect(body.data).toEqual(serialized);
          expect(body.data).toEqual({
            id: serialized.id,
            ...expected,
          });
        }
      );
    });
  });

  describe("update method", () => {
    describe("should give a response error with 422 when throw EntityValidationError", () => {
      const arrange = UpdatePlayerFixture.arrangeForEntityValidationError();
      let playerRepo: PlayerRepository.Repository;

      beforeEach(async () => {
        await prisma.playerModel.deleteMany();
        playerRepo = new PlayerPrisma.PlayerRepository();
      });

      test.each(arrange)(
        "body contents: $label",
        async ({ send_data, expected }) => {
          const player = Player.fake().aPlayer().build();
          await playerRepo.insert(player);
          const res = await controller.update(send_data as any, player.id);
          const body = await res.json();
          expect(body).toEqual(expected);
          expect(res.status).toBe(expected.statusCode);
        }
      );
    });

    describe("should give a response error with 422/404 when id is invalid or not found", () => {
      const faker = Player.fake().aPlayer();
      const arrange = [
        {
          label: "INVALID",
          id: "fake id",
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            error: "Unprocessable Entity",
            message: "Validation failed (uuid v4 is expected)",
          },
        },
        {
          label: "NOT FOUND",
          id: "d0ba5077-fb6d-406f-bd05-8c521ba9425a",
          send_data: { name: faker.name },
          expected: {
            statusCode: 404,
            error: "Not Found",
            message:
              "Entity not found using ID d0ba5077-fb6d-406f-bd05-8c521ba9425a",
          },
        },
      ];
      test.each(arrange)(
        "id contents: $label",
        async ({ id, send_data, expected }) => {
          const res = await controller.update(send_data, id);
          const body = await res.json();
          expect(body).toEqual(expected);
          expect(res.status).toBe(expected.statusCode);
        }
      );
    });

    describe("should update a player", () => {
      const arrange = UpdatePlayerFixture.arrangeForSave();
      let playerRepo: PlayerRepository.Repository;

      beforeEach(async () => {
        await prisma.playerModel.deleteMany();
        playerRepo = new PlayerPrisma.PlayerRepository();
      });

      test.each(arrange)(
        "when body is $send_data",
        async ({ send_data, expected }) => {
          const createdPlayer = Player.fake().aPlayer().build();
          await playerRepo.insert(createdPlayer);
          const res = await controller.update(send_data, createdPlayer.id);
          const body = await res.json();
          expect(res.status).toBe(200);
          const keysInResponse = UpdatePlayerFixture.keysInResponse();
          expect(Object.keys(body)).toStrictEqual(["data"]);
          expect(Object.keys(body.data)).toStrictEqual(keysInResponse);

          const id = body.data.id;
          const updatedPlayer = await playerRepo.findById(id);
          const presenter = new PlayerPresenter(updatedPlayer.toJSON());
          const serialized = instanceToPlain(presenter);
          expect(body.data).toEqual(serialized);
          expect(body.data).toEqual({
            id: serialized.id,
            ...expected,
          });
        }
      );
    });
  });

  describe("remove method", () => {
    describe("should return a response error when id is invalid or not found", () => {
      const arrange = [
        {
          id: "51683e7d-0842-4913-a768-f7bb0be5bfcc",
          expected: {
            message:
              "Entity not found using ID 51683e7d-0842-4913-a768-f7bb0be5bfcc",
            statusCode: 404,
            error: "Not Found",
          },
        },
        {
          id: "fake id",
          expected: {
            message: "Validation failed (uuid v4 is expected)",
            statusCode: 422,
            error: "Unprocessable Entity",
          },
        },
      ];

      test.each(arrange)("with id is $id", async ({ id, expected }) => {
        const res = await controller.remove(id);
        expect(res.status).toBe(expected.statusCode);
      });
    });

    it("should delete a player with response status 200 ", async () => {
      const playerRepo = new PlayerPrisma.PlayerRepository();
      const player = Player.fake().aPlayer().build();
      playerRepo.insert(player);

      const res = await controller.remove(player.id);
      const body = await res.json();
      expect(res.status).toBe(200);
      const keysInResponse = DeletePlayerFixture.keysInResponse();
      expect(Object.keys(body)).toStrictEqual(["data"]);
      expect(Object.keys(body.data)).toStrictEqual(keysInResponse);

      await expect(playerRepo.findById(player.id)).rejects.toThrowError(
        new NotFoundError(`Entity not found using ID ${player.id}`)
      );
    });
  });
});
