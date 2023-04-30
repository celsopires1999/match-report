import { Player } from "../../../player/domain/entities/player";
import { PlayerOutputMapper } from "./player-output";

describe("PlayerOutputMapper Unit Tests", () => {
  it("should convert a cast member in output", () => {
    const entity = new Player({ name: "John Doe" });

    const spyToJSON = jest.spyOn(entity, "toJSON");
    const output = PlayerOutputMapper.toOutput(entity);
    expect(spyToJSON).toHaveBeenCalled();
    expect(output).toStrictEqual({
      id: entity.id,
      name: entity.name,
      is_active: entity.is_active,
    });
  });
});
