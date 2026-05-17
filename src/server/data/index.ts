import { SqliteCantinaRepository } from "./sqlite-repository";

let repository: SqliteCantinaRepository | null = null;

export function getCantinaRepository() {
  repository ??= new SqliteCantinaRepository();
  return repository;
}
