import { SortDirection } from "@/backend/@seedwork/domain/repository/repository-contracts";
import { Player } from "../domain/entities/player";

export class PlayerFixture {
  static keysInResponse() {
    return ["id", "name", "is_active"];
  }

  static arrangeForSave() {
    const entities = [
      Player.fake().aPlayer().withName("John Doe").activate().build(),
      Player.fake().aPlayer().withName("Mary Doe").deactivate().build(),
    ];
    return [
      {
        send_data: {
          ...entities[0].props,
        },
        expected: {
          ...entities[0].props,
        },
      },
      {
        send_data: {
          ...entities[1].props,
        },
        expected: {
          ...entities[1].props,
        },
      },
    ];
  }

  static arrangeForEntityValidationError() {
    const defaultExpected = {
      statusCode: 422,
      error: "Unprocessable Entity",
    };

    return [
      {
        label: "EMPTY",
        send_data: {},
        expected: {
          message: [
            "name should not be empty",
            "name must be a string",
            "name must be shorter than or equal to 255 characters",
          ],
          ...defaultExpected,
        },
      },
      {
        label: "NAME_UNDEFINED",
        send_data: {
          name: undefined,
        },
        expected: {
          message: [
            "name should not be empty",
            "name must be a string",
            "name must be shorter than or equal to 255 characters",
          ],
          ...defaultExpected,
        },
      },
      {
        label: "NAME_NULL",
        send_data: {
          name: null,
        },
        expected: {
          message: [
            "name should not be empty",
            "name must be a string",
            "name must be shorter than or equal to 255 characters",
          ],
          ...defaultExpected,
        },
      },
      {
        label: "NAME_EMPTY",
        send_data: {
          name: "",
        },
        expected: {
          message: ["name should not be empty"],
          ...defaultExpected,
        },
      },
    ];
  }

  static arrangeForUseCaseEntityValidationError() {
    return [
      {
        label: "EMPTY",
        send_data: {},
        expected: {
          error: {
            name: [
              "name should not be empty",
              "name must be a string",
              "name must be shorter than or equal to 255 characters",
            ],
          },
        },
      },
      {
        label: "NAME_UNDEFINED",
        send_data: {
          name: undefined,
        },
        expected: {
          error: {
            name: [
              "name should not be empty",
              "name must be a string",
              "name must be shorter than or equal to 255 characters",
            ],
          },
        },
      },
      {
        label: "NAME_NULL",
        send_data: {
          name: null,
        },
        expected: {
          error: {
            name: [
              "name should not be empty",
              "name must be a string",
              "name must be shorter than or equal to 255 characters",
            ],
          },
        },
      },
      {
        label: "NAME_EMPTY",
        send_data: {
          name: "",
        },
        expected: {
          error: { name: ["name should not be empty"] },
        },
      },
    ];
  }
}

export class CreatePlayerFixture {
  static keysInResponse() {
    return PlayerFixture.keysInResponse();
  }

  static arrangeForSave() {
    return PlayerFixture.arrangeForSave();
  }

  static arrangeForEntityValidationError() {
    return PlayerFixture.arrangeForEntityValidationError();
  }
}

export class UpdatePlayerFixture {
  static keysInResponse() {
    return PlayerFixture.keysInResponse();
  }

  static arrangeForSave() {
    return PlayerFixture.arrangeForSave();
  }

  static arrangeForEntityValidationError() {
    return PlayerFixture.arrangeForEntityValidationError();
  }

  static arrangeForUseCaseEntityValidationError() {
    return PlayerFixture.arrangeForUseCaseEntityValidationError();
  }
}

export class DeletePlayerFixture {
  static keysInResponse() {
    return PlayerFixture.keysInResponse();
  }
}

export class ListPlayerFixture {
  static arrange() {
    const entities = Player.fake()
      .thePlayers(4)
      .withName((index) => `teste ${index}`)
      .build();

    const entitiesMap = {
      first: entities[0],
      second: entities[1],
      third: entities[2],
      fourth: entities[3],
    };

    const arrange = [
      // test #0
      {
        send_data: {},
        expected: {
          items: [
            entitiesMap.first.toJSON(),
            entitiesMap.second.toJSON(),
            entitiesMap.third.toJSON(),
            entitiesMap.fourth.toJSON(),
          ],
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 4,
        },
      },
      // test #1
      {
        send_data: {
          page: 1,
          per_page: 2,
        },
        expected: {
          items: [entitiesMap.first.toJSON(), entitiesMap.second.toJSON()],
          current_page: 1,
          last_page: 2,
          per_page: 2,
          total: 4,
        },
      },
      // test #2
      {
        send_data: {
          page: 2,
          per_page: 2,
        },
        expected: {
          items: [entitiesMap.third.toJSON(), entitiesMap.fourth.toJSON()],
          current_page: 2,
          last_page: 2,
          per_page: 2,
          total: 4,
        },
      },
      // test #3
      {
        send_data: {
          page: 99,
          per_page: 2,
        },
        expected: {
          items: [],
          current_page: 99,
          last_page: 2,
          per_page: 2,
          total: 4,
        },
      },
    ];

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const entitiesMap = {
      a: Player.fake().aPlayer().withName("a").activate().build(),
      AAA: Player.fake().aPlayer().withName("AAA").deactivate().build(),
      AaA: Player.fake().aPlayer().withName("AaA").deactivate().build(),
      b: Player.fake().aPlayer().withName("b").activate().build(),
      c: Player.fake().aPlayer().withName("c").deactivate().build(),
    };

    const arrange = [
      // test #0
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "name",
          filter: { name: "a" },
        },
        expected: {
          items: [entitiesMap.a.toJSON(), entitiesMap.AaA.toJSON()],
          total: 3,
          current_page: 1,
          last_page: 2,
          per_page: 2,
        },
      },
      // test #1
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: "name",
          filter: { name: "a" },
        },
        expected: {
          items: [entitiesMap.AAA.toJSON()],
          total: 3,
          current_page: 2,
          last_page: 2,
          per_page: 2,
        },
      },
      // test #2
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "name",
          sort_dir: "desc" as SortDirection,
          filter: { name: "a" },
        },
        expected: {
          items: [entitiesMap.AAA.toJSON(), entitiesMap.AaA.toJSON()],
          total: 3,
          current_page: 1,
          last_page: 2,
          per_page: 2,
        },
      },
      // test #3
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: "name",
          sort_dir: "desc" as SortDirection,
          filter: { name: "a" },
        },
        expected: {
          items: [entitiesMap.a.toJSON()],
          total: 3,
          current_page: 2,
          last_page: 2,
          per_page: 2,
        },
      },
      // test #4
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "is_active",
          filter: { is_active: false },
        },
        expected: {
          items: [entitiesMap.AAA.toJSON(), entitiesMap.AaA.toJSON()],
          total: 3,
          current_page: 1,
          last_page: 2,
          per_page: 2,
        },
      },
      // test #5
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: "is_active",
          filter: { is_active: false },
        },
        expected: {
          items: [entitiesMap.c.toJSON()],
          total: 3,
          current_page: 2,
          last_page: 2,
          per_page: 2,
        },
      },
      // test #6
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: "is_active",
          filter: { is_active: true },
        },
        expected: {
          items: [entitiesMap.a.toJSON(), entitiesMap.b.toJSON()],
          total: 2,
          current_page: 1,
          last_page: 1,
          per_page: 2,
        },
      },
    ];
    return { arrange, entitiesMap };
  }
}
