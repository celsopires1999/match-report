import AggregateRoot from "@/backend/@seedwork/domain/entities/aggregate-root";
import { EntityValidationError } from "@/backend/@seedwork/domain/errors/validation.error";
import UniqueEntityId from "@/backend/@seedwork/domain/value-objects/unique-entity-id.vo";
import { PlayerFakeBuilder } from "@/backend/player/domain/entities/player-fake-builder";
import PlayerValidatorFactory from "@/backend/player/domain/validators/player.validator";

export type PlayerProps = {
  name: string;
  is_active?: boolean;
};

export type PlayerPropsJson = Required<{ id: string } & PlayerProps>;

export class PlayerId extends UniqueEntityId { }

export class Player extends AggregateRoot<
  PlayerId,
  PlayerProps,
  PlayerPropsJson
> {
  constructor(public readonly props: PlayerProps, entityId?: PlayerId) {
    Player.validate(props);
    super(props, entityId ?? new PlayerId());
    this.name = props.name;
    this.is_active = props.is_active ?? true;
  }

  get name(): string {
    return this.props.name;
  }

  private set name(value: string) {
    this.props.name = value;
  }

  get is_active(): boolean {
    return this.props.is_active ?? true;
  }

  private set is_active(value: boolean) {
    this.props.is_active = value ?? true;
  }

  update(name: string) {
    Player.validate({ ...this.props, name });
    this.name = name;
  }

  activate() {
    this.props.is_active = true;
  }

  deactivate() {
    this.props.is_active = false;
  }

  static validate(props: PlayerProps) {
    const validator = PlayerValidatorFactory.create();
    const isValid = validator.validate(props);
    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  static fake() {
    return PlayerFakeBuilder;
  }

  toJSON(): PlayerPropsJson {
    return {
      id: this.id.toString(),
      ...this.props,
    } as PlayerPropsJson;
  }
}
