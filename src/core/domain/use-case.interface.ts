export interface UseCase<Args, Response> {
    execute(props: Args): Promise<Response>;
  }
  