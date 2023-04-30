import DuplicatedError from "@/backend/@seedwork/domain/errors/duplicated.error";
import { PlayerModel, Prisma } from "@prisma/client";
import { LoadEntityError } from "../../../../@seedwork/domain/errors/load-entity.error";
import NotFoundError from "../../../../@seedwork/domain/errors/not-found.error";
import { EntityValidationError } from "../../../../@seedwork/domain/errors/validation.error";
import prisma from "../../../../@seedwork/utils/db";
import { Player, PlayerId } from "../../../domain/entities/player";
import { PlayerRepository as PlayerRepositoryContract } from "../../../domain/repository/player.repository";

export namespace PlayerPrisma {
  export class PlayerRepository implements PlayerRepositoryContract.Repository {
    sortableFields: string[] = ["name", "is_active"];

    async insert(entity: Player): Promise<void> {
      try {
        await prisma.playerModel.create({
          data: entity.toJSON(),
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new DuplicatedError(`Entity duplicated with ID ${entity.id}`);
        } else {
          throw e;
        }
      }
    }

    async bulkInsert(entities: Player[]): Promise<void> {
      const data = entities.map((e) => e.toJSON());
      const batchPayload = await prisma.playerModel.createMany({
        data,
      });

      if (batchPayload.count !== data.length) {
        throw new Error(
          `Not all players have been created. Requested: ${data.length}, Done: ${batchPayload.count}`
        );
      }
    }

    async update(entity: Player): Promise<void> {
      try {
        await prisma.playerModel.update({
          where: { id: entity.id },
          data: { ...entity.toJSON() },
        });
      } catch (e) {
        throw this.checkNotFoundError(entity.id, e);
      }
    }

    async delete(id: string | PlayerId): Promise<void> {
      const _id = typeof id === "string" ? id : id.value;
      try {
        await prisma.playerModel.delete({ where: { id: _id } });
      } catch (e) {
        throw this.checkNotFoundError(_id, e);
      }
    }

    async findById(id: string | PlayerId): Promise<Player> {
      let _id = `${id}`;
      if (typeof id !== "string") {
        _id = id.value;
      }
      const model = await this._get(_id);
      return PlayerModelMapper.toEntity(model);
    }

    private async _get(id: string) {
      try {
        return await prisma.playerModel.findUniqueOrThrow({
          where: { id },
        });
      } catch (e) {
        throw this.checkNotFoundError(id, e);
      }
    }

    private checkNotFoundError(id: string, e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        return new NotFoundError(`Entity not found using ID ${id}`);
      } else {
        return e;
      }
    }

    async findAll(): Promise<Player[]> {
      const models = await prisma.playerModel.findMany();
      return models.map((m) => PlayerModelMapper.toEntity(m));
    }

    async exists(name: string): Promise<boolean> {
      const model = await prisma.playerModel.findFirst({ where: { name } });
      return model ? true : false;
    }

    async search(
      props: PlayerRepositoryContract.SearchParams
    ): Promise<PlayerRepositoryContract.SearchResult> {
      const offset = (props.page - 1) * props.per_page;
      const limit = props.per_page;

      let where: any = {};
      let orderBy: any = {};

      if (props.filter) {
        where = {
          ...(props.filter.name && {
            name: { mode: "insensitive", contains: props.filter.name },
          }),
          ...(typeof props.filter.is_active === "boolean" && {
            is_active: { equals: props.filter.is_active },
          }),
        };
      }

      orderBy =
        props.sort && this.sortableFields.includes(props.sort)
          ? { [props.sort]: props.sort_dir }
          : { name: "asc" };

      const [count, models] = await prisma.$transaction([
        prisma.playerModel.count({
          where,
        }),
        prisma.playerModel.findMany({
          skip: offset,
          take: limit,
          where,
          orderBy,
        }),
      ]);

      return new PlayerRepositoryContract.SearchResult({
        items: models.map((m) => PlayerModelMapper.toEntity(m)),
        current_page: props.page,
        per_page: props.per_page,
        total: count,
        filter: props.filter,
        sort: props.sort,
        sort_dir: props.sort_dir,
      });
    }
  }

  export class PlayerModelMapper {
    static toEntity(model: PlayerModel) {
      const { id, name, is_active } = model;
      try {
        return new Player({ name, is_active }, new PlayerId(id));
      } catch (e) {
        if (e instanceof EntityValidationError) {
          throw new LoadEntityError(e.error);
        }

        throw e;
      }
    }
  }
}
