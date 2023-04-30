import { CreatePlayerUseCase } from "../../../application/use-cases/create-player.use-case";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
export class CreatePlayerDto implements CreatePlayerUseCase.Input {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
