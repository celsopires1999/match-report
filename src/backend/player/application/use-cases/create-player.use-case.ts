import { Player } from "../../domain/entities/player";
import { PlayerRepository } from "../../domain/repository/player.repository";
import { PlayerOutput, PlayerOutputMapper } from "../dto/player-output";
import UseCaseInterface from "../../../@seedwork/application/use-case";
import PlayerExistsError from "./errors/player-exists.error";

export namespace CreatePlayerUseCase {
  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private playerRepo: PlayerRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = new Player(input);
      await this.validateExistsName(input.name);
      await this.playerRepo.insert(entity);
      return PlayerOutputMapper.toOutput(entity);
    }

    private async validateExistsName(name: string): Promise<void> {
      if (await this.playerRepo.exists(name)) {
        throw new PlayerExistsError(
          `${name} exists already in the players collection`
        );
      }
    }
  }

  export type Input = {
    name: string;
  };

  export type Output = PlayerOutput;
}

export default CreatePlayerUseCase;
