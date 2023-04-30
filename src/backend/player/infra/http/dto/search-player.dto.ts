import { SortDirection } from "@/backend/@seedwork/domain/repository/repository-contracts";

export class SearchPlayerDto {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: {
    name?: string;
    is_active?: boolean;
  };

  constructor(searchParams: URLSearchParams) {
    this.page = searchParams.get("page")
      ? (searchParams.get("page") as unknown as number)
      : undefined;
    this.per_page = searchParams.get("per_page")
      ? (searchParams.get("per_page") as unknown as number)
      : undefined;
    this.sort = searchParams.get("sort")
      ? (searchParams.get("sort") as unknown as string)
      : undefined;
    this.sort_dir = searchParams.get("sort_dir")
      ? (searchParams.get("sort_dir") as unknown as SortDirection)
      : undefined;
    this.filter = {
      ...(searchParams.get("filter[name]")
        ? { name: searchParams.get("filter[name]") as unknown as string }
        : undefined),
      ...(searchParams.get("filter[is_active]")
        ? {
            is_active: SearchPlayerDto.handleIsActive(
              searchParams.get("filter[is_active]") as unknown
            ),
          }
        : undefined),
      // ...(searchParams.get('filter[is_active]') ? { is_active: searchParams.get('filter[is_active]') as unknown as boolean } : undefined)
    };
  }

  private static handleIsActive(value: unknown) {
    if (typeof value === "boolean") {
      return value;
    }
    return value === "true";
  }
}
