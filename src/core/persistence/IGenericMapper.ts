export interface IGenericMapper<TDomain, TEntity> {
  toDomain: (entity: TEntity) => TDomain;
  toEntity: (domain: TDomain) => TEntity;
}
