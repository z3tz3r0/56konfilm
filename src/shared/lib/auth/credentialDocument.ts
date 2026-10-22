/** No environment reads here: shared by server helpers and operator tooling. */
export const CMS_CREDENTIALS_ID = 'private.cms-credentials';
export const LEGACY_CMS_CREDENTIALS_ID = 'cms-credentials';
export const CMS_CREDENTIALS_TYPE = 'cmsCredentials';

export interface CmsCredentials {
  username: string;
  password: string;
}

export interface CredentialDocument extends CmsCredentials {
  _id: string;
  _type: string;
  _rev: string;
  _createdAt?: string;
  _updatedAt?: string;
  updatedAt?: string;
}

/** Check stored bcrypt data without rehashing it or exposing it in errors. */
export function hasCredentialValues(value: CmsCredentials): boolean {
  return (
    typeof value.username === 'string' &&
    value.username.trim().length > 0 &&
    typeof value.password === 'string' &&
    /^\$2[aby]\$(0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/.test(value.password)
  );
}
