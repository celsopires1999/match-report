import ClassValidatorFields from "../../../@seedwork/domain/validators/class-validator-fields";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { PlayerProps } from "../entities/player";

export class PlayerRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  is_active!: boolean;

  constructor({ name, is_active }: PlayerProps) {
    Object.assign(this, { name, is_active });
  }
}

export class PlayerValidator extends ClassValidatorFields<PlayerRules> {
  validate(data: PlayerProps): boolean {
    return super.validate(new PlayerRules(data ?? ({} as any)));
  }
}

export class PlayerValidatorFactory {
  static create() {
    return new PlayerValidator();
  }
}

export default PlayerValidatorFactory;
