import { Player, PlayerId } from "../entities/player";
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRepositoryInterface,
  SearchProps,
} from "@/backend/@seedwork/domain/repository/repository-contracts";

export namespace PlayerRepository {
  export type Filter = {
    name?: string;
    is_active?: boolean;
  };

  export class SearchParams extends DefaultSearchParams<Filter> {
    private constructor(props: SearchProps<Filter> = {}) {
      super(props);
    }

    get filter(): Filter | null {
      return this._filter;
    }

    protected set filter(value: Filter | null) {
      const _value =
        !value || (value as unknown) === "" || typeof value !== "object"
          ? null
          : value;

      const filter = {
        ...(_value?.name && { name: `${_value?.name}` }),
        ...(typeof _value?.is_active === "boolean" && {
          is_active: _value?.is_active,
        }),
      };

      this._filter = Object.keys(filter).length === 0 ? null : filter;
    }

    static create(
      props: Omit<SearchProps<Filter>, "filter"> & {
        filter?: {
          name?: string;
          is_active?: boolean;
        } | null;
      } = {}
    ) {
      return new SearchParams({
        ...props,
        filter: {
          name: props.filter?.name,
          is_active: props.filter?.is_active,
        },
      });
    }
  }
  export class SearchResult extends DefaultSearchResult<Player, Filter> {}

  export interface Repository
    extends SearchableRepositoryInterface<
      Player,
      PlayerId,
      Filter,
      SearchParams,
      SearchResult
    > {
    exists(name: string): Promise<boolean>;
  }
}

export default PlayerRepository;
