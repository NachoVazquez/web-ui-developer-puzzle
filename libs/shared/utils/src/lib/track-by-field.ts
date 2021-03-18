export function trackByField(
  idField = 'id'
): (
  index: number,
  entity: { [property: string]: string | number }
) => number | string {
  return (index: number, entity: { [property: string]: string | number }) =>
    entity[idField];
}
