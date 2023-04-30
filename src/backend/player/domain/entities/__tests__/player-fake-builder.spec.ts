import { Chance } from "chance";
import { PlayerId } from "../player";
import { PlayerFakeBuilder } from "../player-fake-builder";

describe("PlayerFakeBuilder Unit Tests", () => {
  describe("entity_id prop", () => {
    const faker = PlayerFakeBuilder.aPlayer();

    it("should throw an error when entity_id has not been set", () => {
      expect(() => faker["getValue"]("entity_id")).toThrow(
        new Error(
          `Property entity_id does not have a factory, use "with" method instead`
        )
      );
      expect(() => faker.entity_id).toThrow(
        new Error(
          `Property entity_id does not have a factory, use "with" method instead`
        )
      );
    });

    it("should be undefined", () => {
      expect(faker["_entity_id"]).toBeUndefined();
    });

    test("withEntityId", () => {
      const playerId = new PlayerId();
      const $this = faker.withEntityId(playerId);
      expect($this).toBeInstanceOf(PlayerFakeBuilder);
      expect(faker["_entity_id"]).toBe(playerId);

      faker.withEntityId(() => playerId);
      //@ts-ignore
      expect(faker["_entity_id"]()).toBe(playerId);

      expect(faker.entity_id).toBe(playerId);

      const player = faker.build();
      expect(player.entityId).toStrictEqual(playerId);
    });

    it("should pass index to unique_entity_id factory", () => {
      let mockFactory = jest.fn().mockReturnValue(new PlayerId());
      faker.withEntityId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledWith(0);

      mockFactory = jest.fn().mockReturnValue(new PlayerId());
      const fakerMany = PlayerFakeBuilder.thePlayers(2);
      fakerMany.withEntityId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledWith(0);
      expect(mockFactory).toHaveBeenCalledWith(1);
    });
  });

  describe("name prop", () => {
    const faker = PlayerFakeBuilder.aPlayer();

    it("should be a function", () => {
      expect(typeof faker["_name"] === "function").toBeTruthy();
    });

    it("should call the word method", () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, "word");
      faker["chance"] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test("withName", () => {
      const $this = faker.withName("test name");
      expect($this).toBeInstanceOf(PlayerFakeBuilder);
      expect(faker["_name"]).toBe("test name");
      faker.withName(() => "test name");
      // @ts-expect-error This expression is not callable
      expect(faker["_name"]()).toBe("test name");

      expect(faker.name).toBe("test name");
    });

    it("should pass an index to name factory", () => {
      faker.withName((index) => `test name ${index}`);
      const category = faker.build();
      expect(category.name).toBe(`test name 0`);

      const fakerMany = PlayerFakeBuilder.thePlayers(2);
      fakerMany.withName((index) => `test name ${index}`);
      const categories = fakerMany.build();

      expect(categories[0].name).toBe(`test name 0`);
      expect(categories[1].name).toBe(`test name 1`);
    });

    test("invalid empty case", () => {
      const $this = faker.withInvalidNameEmpty(undefined);
      expect($this).toBeInstanceOf(PlayerFakeBuilder);

      expect(faker["_name"]).toBeUndefined();

      faker.withInvalidNameEmpty(null);
      expect(faker["_name"]).toBeNull();

      faker.withInvalidNameEmpty("");
      expect(faker["_name"]).toBe("");
    });

    test("invalid not a string case", () => {
      const $this = faker.withInvalidNameNotAString();
      expect($this).toBeInstanceOf(PlayerFakeBuilder);

      expect(faker["_name"]).toBe(5);

      faker.withInvalidNameNotAString(55);
      expect(faker["_name"]).toBe(55);

      faker.withInvalidNameNotAString(true);
      expect(faker["_name"]).toBeTruthy();
    });

    test("invalid too long case", () => {
      const tooLong = "t".repeat(256);

      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(PlayerFakeBuilder);
      expect(faker["_name"].length).toBe(256);

      faker.withInvalidNameTooLong(tooLong);
      expect(faker["_name"].length).toBe(256);
      expect(faker["_name"]).toBe(tooLong);
    });
  });

  describe("is_active prop", () => {
    const faker = PlayerFakeBuilder.aPlayer();

    it("should be a function", () => {
      expect(typeof faker["_is_active"] === "function").toBeTruthy();
    });

    test("activate", () => {
      const $this = faker.activate();
      expect($this).toBeInstanceOf(PlayerFakeBuilder);
      expect(faker["_is_active"]).toBeTruthy();
      expect(faker.is_active).toBeTruthy();
    });

    test("deactivate", () => {
      const $this = faker.deactivate();
      expect($this).toBeInstanceOf(PlayerFakeBuilder);
      expect(faker["_is_active"]).toBeFalsy();
      expect(faker.is_active).toBeFalsy();
    });
  });

  describe("Players creation", () => {
    it("should create a player", () => {
      let player = PlayerFakeBuilder.aPlayer().build();
      expect(player.entityId).toBeInstanceOf(PlayerId);
      expect(typeof player.name === "string").toBeTruthy();

      const unique_entity_id = new PlayerId();
      player = PlayerFakeBuilder.aPlayer()
        .withName("some name")
        .deactivate()
        .withEntityId(unique_entity_id)
        .build();
      expect(player.entityId).toBe(unique_entity_id);
      expect(player.id).toBe(unique_entity_id.value);
      expect(player.name).toBe("some name");
      expect(player.is_active).toBeFalsy();
    });

    it("should create many players", () => {
      let players = PlayerFakeBuilder.thePlayers(2).build();

      players.forEach((player) => {
        expect(player.entityId).toBeInstanceOf(PlayerId);
        expect(typeof player.name === "string").toBeTruthy();
      });

      const unique_entity_id = new PlayerId();
      players = PlayerFakeBuilder.thePlayers(2)
        .withName("some name")
        .activate()
        .withEntityId(unique_entity_id)
        .build();

      players.forEach((player) => {
        expect(player.entityId).toBe(unique_entity_id);
        expect(player.id).toBe(unique_entity_id.value);
        expect(player.name).toBe("some name");
        expect(player.is_active).toBeTruthy();
      });
    });
  });
});
