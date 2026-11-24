import type {
  AnyKeys,
  QueryFilter as FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  SortOrder,
  Types,
  UpdateQuery,
} from "mongoose";

type Id = Types.ObjectId | string;

export default abstract class BaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  createNewDocument(data: Partial<TDocument>): Promise<TDocument> {
    return this.model.create(data);
  }

findDocumentById({
  _id,
  projection,
}: {
  _id: Types.ObjectId | string;
  projection?: ProjectionType<TDocument>;
}) {
  return this.model.findById(_id, projection);
}

  findOneDocument(filters: FilterQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findOne(filters);
  }

  findOneAndUpdateDocument(
    filters: FilterQuery<TDocument>,
    updates: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<TDocument | null> {
    return this.model.findOneAndUpdate(filters, updates, options);
  }

  findAllDocument(
    filters: FilterQuery<TDocument> = {},
    {
      select,
      sort,
      limit,
      skip,
    }: {
      select?: string | Record<string, 0 | 1>;
      sort?: string | Record<string, SortOrder>;
      limit?: number;
      skip?: number;
    } = {}
  ) {
    let query = this.model.find(filters);
    if (select) query = query.select(select);
    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    return query;
  }

  findByIdAndDeleteDocument(_id: Id) {
    return this.model.findByIdAndDelete(_id);
  }

updateDocumentById({ _id, updateData, options }: { _id: Types.ObjectId, updateData: UpdateQuery<TDocument>, options: QueryOptions<TDocument> }) {
    return this.model.findByIdAndUpdate(_id, updateData, options)
}

  updateOneDocument(
    filters: FilterQuery<TDocument>,
    data: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ) {
    return this.model.findOneAndUpdate(filters, data, options);
  }



  deleteManyDocuments(filters: FilterQuery<TDocument>) {
    return this.model.deleteMany(filters);
  }

  
}