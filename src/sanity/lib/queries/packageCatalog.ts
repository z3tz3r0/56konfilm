/** Shared rules for Studio catalog reads and public projections. */
export const PUBLISHED_CATALOG_FILTER =
  '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';

export const CATALOG_SERVICE_ORDER = '_createdAt asc, _id asc';

export const PACKAGE_REFERENCE_FILTER = `
  @->_type == "package" && @->siteMode == $mode &&
  !(@->_id in path("drafts.**")) && !(@->_id in path("versions.**"))
`;

export const PUBLISHED_PACKAGES_QUERY = `
  *[_type == "package" && siteMode == $mode && ${PUBLISHED_CATALOG_FILTER}]
    | order(${CATALOG_SERVICE_ORDER}) { _id, title }
`;

export const GROUP_SERVICES_QUERY = `
  *[_type == "packageService" && siteMode == $mode && ${PUBLISHED_CATALOG_FILTER} &&
    count(packages[_ref in *[
      _type == "package" && siteMode == $mode && _id in $packageIds &&
      ${PUBLISHED_CATALOG_FILTER}
    ]._id]) > 0
  ] | order(${CATALOG_SERVICE_ORDER}) { _id, _createdAt, title }
`;
