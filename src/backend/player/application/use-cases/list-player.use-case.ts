import {
  PaginationOutputDto,
  PaginationOutputMapper,
} from "../../../@seedwork/application/dto/pagination-output";
import { SearchInputDto } from "../../../@seedwork/application/dto/search-input";
import { UseCaseInterface } from "../../../@seedwork/application/use-case";
import { PlayerRepository } from "../../domain/repository/player.repository";
import { PlayerOutput, PlayerOutputMapper } from "../dto/player-output";

export namespace ListPlayersUseCase {
  export class UseCase implements UseCaseInterface<Input, Output> {
    constructor(private playerRepo: PlayerRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const params = PlayerRepository.SearchParams.create(input);
      const searchResult = await this.playerRepo.search(params);
      return this.toOutput(searchResult);
    }

    private toOutput(searchResult: PlayerRepository.SearchResult): Output {
      const items = searchResult.items.map((i) => {
        return PlayerOutputMapper.toOutput(i);
      });
      return PaginationOutputMapper.toOutput(items, searchResult);
    }
  }

  export type Input = SearchInputDto<{ name?: string; is_active?: boolean }>;

  export type Output = PaginationOutputDto<PlayerOutput>;
}

export default ListPlayersUseCase;
