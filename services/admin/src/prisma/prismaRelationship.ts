export const prismaRelationship = {
  connectOneOrThrow,
  connectOne,
  connectOrDisconnectOne,
  connectMany,
  setMany,
};

function connectOne(id?: string | null) {
  if (id === undefined) {
    return undefined;
  }

  if (id === null) {
    return undefined;
  }

  return {
    connect: { id },
  };
}

function connectOneOrThrow(id?: string | null) {
  if (!id) {
    throw new Error('id is required');
  }

  return {
    connect: { id },
  };
}

function connectOrDisconnectOne(id?: string | null) {
  if (id === undefined) {
    return undefined;
  }

  if (id === null) {
    return { disconnect: true };
  }

  return {
    connect: { id },
  };
}

function connectMany(ids: string[] | undefined) {
  if (ids == undefined) {
    return undefined;
  }

  if (ids.length == 0) {
    return undefined;
  }

  return {
    connect: ids.map((id) => ({
      id,
    })),
  };
}

function setMany(ids: string[] | undefined) {
  if (!ids) {
    return undefined;
  }

  if (ids.length == 0) {
    return { set: [] };
  }

  return {
    set: ids.map((id) => ({
      id,
    })),
  };
}
