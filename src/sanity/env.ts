const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-12';

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
);

const sanityApiToken = process.env.SANITY_API_TOKEN;

const sanityCmsSessionSecret = process.env.SANITY_CMS_SESSION_SECRET;

const sanityCmsSessionMaxAge = assertValue(
  parseInt(process.env.SANITY_CMS_SESSION_MAX_AGE || '604800', 10),
  'Missing environment variable: SANITY_CMS_SESSION_MAX_AGE'
); // Default: 7 days

const sanityCmsRememberMaxAge = assertValue(
  parseInt(process.env.SANITY_CMS_REMEMBER_MAX_AGE || '2592000', 10),
  'Missing environment variable: SANITY_CMS_REMEMBER_MAX_AGE'
); // Default: 30 days

const nodeEnv = process.env.NODE_ENV || 'development';

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}

export {
  apiVersion,
  dataset,
  projectId,
  sanityApiToken,
  sanityCmsSessionSecret,
  sanityCmsSessionMaxAge,
  sanityCmsRememberMaxAge,
  nodeEnv,
};
