import UseCaseInterface from "../../../@seedwork/application/use-case";
import PlayerRepository from "../../domain/repository/player.repository";
import { PlayerOutput, PlayerOutputMapper } from "../dto/player-output";

export namespace DeletePlayerUseCase {
  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private playerRepo: PlayerRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.playerRepo.findById(input.id);
      await this.playerRepo.delete(entity.id);
      return PlayerOutputMapper.toOutput(entity);
    }
  }

  export type Input = {
    id: string;
  };

  export type Output = PlayerOutput;
}

export default DeletePlayerUseCase;
