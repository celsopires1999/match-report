import { CollectionPresenter } from "@/backend/@seedwork/infra/http/presenters/collection.presenter";
import { PlayerOutput } from "../../../application/dto/player-output";
import ListPlayersUseCase from "../../../application/use-cases/list-player.use-case";

export class PlayerPresenter {
  id: string;
  name: string;
  is_active: boolean;

  constructor(output: PlayerOutput) {
    this.id = output.id;
    this.name = output.name;
    this.is_active = output.is_active;
  }
}

export class PlayerCollectionPresenter extends CollectionPresenter {
  data: PlayerPresenter[];

  constructor(output: ListPlayersUseCase.Output) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new PlayerPresenter(item));
  }
}
