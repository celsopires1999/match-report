import PlayerRepository from "../../domain/repository/player.repository";
import { PlayerOutput, PlayerOutputMapper } from "../dto/player-output";
import UseCaseInterface from "../../../@seedwork/application/use-case";

export namespace GetPlayerUseCase {
  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private categoryRepo: PlayerRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.categoryRepo.findById(input.id);
      return PlayerOutputMapper.toOutput(entity);
    }
  }

  export type Input = {
    id: string;
  };

  export type Output = PlayerOutput;
}

export default GetPlayerUseCase;
