export interface UseCaseInterface<Input, Output> {
  execute(input: Input): Output | Promise<Output>;
}

export default UseCaseInterface;
