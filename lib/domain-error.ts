export class DomainError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "DomainError";
  }
}

export function errorResponse(error: unknown) {
  const domain = error instanceof DomainError ? error : new DomainError("服务器暂时无法完成该操作", 500);
  return Response.json({ message: domain.message }, { status: domain.status });
}
