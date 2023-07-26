import QueryString from "qs";

const convertQueryToList = (
  query:
    | string
    | string[]
    | QueryString.ParsedQs
    | QueryString.ParsedQs[]
    | undefined
): string[] => {
  let result: string[] = [];
  if (!query) {
    result = [];
  } else if (!Array.isArray(query)) {
    result = [query as string];
  } else {
    result = query as Array<string>;
  }
  return result;
};

const convertOrderQueryToOrderObject = (
  orderBy: string | undefined
): object => {
  if (!orderBy) {
    return {};
  } else if (orderBy == "bookmarks") {
    return {
      bookmarkedBy: {
        _count: "desc",
      },
    };
  } else if (orderBy == "upvotes") {
    return {
      upvotes: {
        _count: "desc",
      },
    };
  } else {
    return {};
  }
};

const alterRequestQueryToUseArrays = (queryObject: QueryString.ParsedQs) => {
  Object.keys(queryObject).forEach((key: string) => {
    const param = queryObject[key as keyof QueryString.ParsedQs];
    if (typeof param === "string" && param.includes(",")) {
      queryObject[key as keyof QueryString.ParsedQs] = param.split(",");
    }
  });
  return queryObject;
};

export {
  convertQueryToList,
  convertOrderQueryToOrderObject,
  alterRequestQueryToUseArrays,
};
