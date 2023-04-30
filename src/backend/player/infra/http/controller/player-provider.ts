import CreatePlayerUseCase from "../../../application/use-cases/create-player.use-case";
import DeletePlayerUseCase from "../../../application/use-cases/delete-player.use-case";
import GetPlayerUseCase from "../../../application/use-cases/get-player.use-case";
import ListPlayersUseCase from "../../../application/use-cases/list-player.use-case";
import UpdatePlayerUseCase from "../../../application/use-cases/update-player.use-case";
import { PlayerPrisma } from "../../db/prisma/player-prisma";
import { PlayerController } from "./player-controller";

const repository = new PlayerPrisma.PlayerRepository();
export const createUseCase = new CreatePlayerUseCase.UseCase(repository);
export const updateUseCase = new UpdatePlayerUseCase.UseCase(repository);
export const deleteUseCase = new DeletePlayerUseCase.UseCase(repository);
export const getUseCase = new GetPlayerUseCase.UseCase(repository);
export const listUseCase = new ListPlayersUseCase.UseCase(repository);
export const controller = new PlayerController();
