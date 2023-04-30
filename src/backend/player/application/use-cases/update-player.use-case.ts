import UseCaseInterface from "../../../@seedwork/application/use-case";
import PlayerRepository from "../../domain/repository/player.repository";
import { PlayerOutput, PlayerOutputMapper } from "../dto/player-output";
import PlayerExistsError from "./errors/player-exists.error";

export namespace UpdatePlayerUseCase {
  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private playerRepo: PlayerRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.playerRepo.findById(input.id);
      const oldName = entity.name;
      entity.update(input.name);
      input.is_active ? entity.activate() : entity.deactivate();

      await this.validateExistsName(input.name, oldName);

      await this.playerRepo.update(entity);
      return PlayerOutputMapper.toOutput(entity);
    }

    private async validateExistsName(
      newName: string,
      oldName: string
    ): Promise<void> {
      if (newName === oldName) {
        return;
      }

      if (await this.playerRepo.exists(newName)) {
        throw new PlayerExistsError(
          `${newName} exists already in the players collection`
        );
      }
    }
  }

  export type Input = {
    id: string;
    name: string;
    is_active?: boolean;
  };

  export type Output = PlayerOutput;
}

export default UpdatePlayerUseCase;
