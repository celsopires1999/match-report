import { Player, PlayerId } from "./player";
import { Chance } from "chance";

type PropOrFactory<T> = T | ((index: number) => T);

export class PlayerFakeBuilder<TBuild = any> {
  // auto generated in entity
  private _entity_id = undefined;
  private _name: PropOrFactory<string> = (_index) => this.chance.word();
  private _is_active: PropOrFactory<boolean> = (_index) => true;
  private countObjs: number;

  static aPlayer() {
    return new PlayerFakeBuilder<Player>();
  }

  static thePlayers(countObjs: number) {
    return new PlayerFakeBuilder<Player[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withEntityId(valueOrFactory: PropOrFactory<PlayerId>) {
    this._entity_id = valueOrFactory as any;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withInvalidNameEmpty(value: "" | null | undefined) {
    this._name = value as any;
    return this;
  }

  withInvalidNameNotAString(value?: any) {
    this._name = value ?? 5;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 });
    return this;
  }

  activate() {
    this._is_active = true;
    return this;
  }

  deactivate() {
    this._is_active = false;
    return this;
  }

  withInvalidIsActiveEmpty(value: "" | null | undefined) {
    this._is_active = value as any;
    return this;
  }

  withInvalidIsActiveNotABoolean(value: any = "fake boolean") {
    this._is_active = value;
    return this;
  }

  build(): TBuild {
    const players = new Array(this.countObjs).fill(undefined).map(
      (_, index) =>
        new Player(
          {
            name: this.callFactory(this._name, index),
            is_active: this.callFactory(this._is_active, index),
          },
          !this._entity_id
            ? undefined
            : this.callFactory(this._entity_id, index)
        )
    );
    return this.countObjs === 1 ? (players[0] as any) : players;
  }

  get entity_id(): PlayerId {
    return this.getValue("entity_id");
  }

  get name(): string {
    return this.getValue("name");
  }

  get is_active() {
    return this.getValue("is_active");
  }

  private getValue(prop: string) {
    const optional = ["entity_id"];
    const privateProp = `_${prop}`;
    //@ts-expect-error
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} does not have a factory, use "with" method instead`
      );
    }
    //@ts-expect-error
    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number): any {
    if (typeof factoryOrValue === "function") {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}
