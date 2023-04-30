import { Player, PlayerId, PlayerProps } from "../player";

describe("Player Unit Test", () => {
  const tester = {
    props: {
      name: "John Doe",
      is_active: false,
    },
  };

  beforeEach(() => {
    Player.validate = jest.fn();
  });
  test("constructor of Player", () => {
    let player = new Player(tester.props);
    let props = player.props;
    expect(Player.validate).toHaveBeenCalled();
    expect(props).toStrictEqual(tester.props);
  });

  describe("id prop", () => {
    const props: PlayerProps = tester.props;

    const arrange = [
      { props },
      { props, id: null as any },
      { props, id: undefined },
      { props, id: new PlayerId() },
    ];
    test.each(arrange)("%#) when props are %j", (item) => {
      const player = new Player(item.props, item.id as any);
      expect(player.id).not.toBeNull();
      expect(player.entityId).toBeInstanceOf(PlayerId);
    });
  });

  test("getter and setter of name prop", () => {
    const player = new Player(tester.props);
    player["name"] = "other name";
    expect(player.name).toBe("other name");
  });

  test("getter and setter of is_active prop", () => {
    const player = new Player(tester.props);
    player["is_active"] = true;
    expect(player.is_active).toBeTruthy();
  });

  it("should update a player", () => {
    const player = new Player(tester.props);

    player.update("Mary Doe");
    expect(Player.validate).toHaveBeenCalledTimes(2);
    expect(player.name).toBe("Mary Doe");
    expect(player.props).toStrictEqual({
      ...tester.props,
      name: "Mary Doe",
    });
  });

  it("should converte to JSON", () => {
    const player = new Player(tester.props);

    expect(player.toJSON()).toEqual({
      id: player.id,
      name: player.name,
      is_active: player.is_active,
    });
  });
});
