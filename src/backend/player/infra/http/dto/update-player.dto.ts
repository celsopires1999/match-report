import { UpdatePlayerUseCase } from "../../../application/use-cases/update-player.use-case";
import { CreatePlayerDto } from "./create-player.dto";
export class UpdatePlayerDto
  extends CreatePlayerDto
  implements Omit<UpdatePlayerUseCase.Input, "id"> {}
