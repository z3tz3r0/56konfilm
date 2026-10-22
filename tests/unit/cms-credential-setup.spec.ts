// @vitest-environment node
import type { SanityClient } from 'next-sanity';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  runCredentialSetup,
  type CredentialSetupMode,
} from '../../scripts/utils/cmsCredentials';
import {
  CMS_CREDENTIALS_ID,
  CMS_CREDENTIALS_TYPE,
} from '@shared/lib/auth/credentialDocument';

const { hash, compare } = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));
vi.mock('bcryptjs', () => ({ default: { hash, compare } }));
const oldHash = '$2b$12$' + 'a'.repeat(53);
const nextHash = '$2b$12$' + 'b'.repeat(53);
const record = () => ({
  _id: CMS_CREDENTIALS_ID,
  _type: CMS_CREDENTIALS_TYPE,
  _rev: 'rev-before-prompt',
  username: 'editor',
  password: oldHash,
});

function fixture(documents: unknown[] = []) {
  const commit = vi.fn().mockResolvedValue(undefined);
  const chain = { ifRevisionId: vi.fn(), set: vi.fn(), commit };
  chain.ifRevisionId.mockReturnValue(chain);
  chain.set.mockReturnValue(chain);
  const transaction = { patch: vi.fn(), delete: vi.fn(), commit };
  transaction.patch.mockImplementation((_id, configure) => {
    configure(chain);
    return transaction;
  });
  transaction.delete.mockReturnValue(transaction);
  const sdk = {
    fetch: vi.fn().mockResolvedValue(documents),
    patch: vi.fn().mockReturnValue(chain),
    create: vi.fn().mockResolvedValue(undefined),
    transaction: vi.fn().mockReturnValue(transaction),
  };
  const prompts = { question: vi.fn(), hidden: vi.fn(), log: vi.fn() };
  // Replace only the injected SDK boundary; no real client, env loader or HTTP.
  const run = (mode: CredentialSetupMode) =>
    runCredentialSetup(sdk as unknown as SanityClient, mode, prompts);
  return { sdk, chain, transaction, commit, prompts, run };
}
beforeEach(() => {
  hash.mockReset().mockResolvedValue(nextHash);
  compare.mockReset().mockResolvedValue(true);
});

describe('Protected credential operator workflow', () => {
  it('strictly creates only the protected ID using bcrypt12 after all prompts', async () => {
    const { run, prompts, sdk } = fixture();
    prompts.question.mockResolvedValue(' editor ');
    prompts.hidden.mockResolvedValue('new-password');
    await run('--create');
    expect(hash).toHaveBeenCalledExactlyOnceWith('new-password', 12);
    expect(sdk.create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        _id: CMS_CREDENTIALS_ID,
        _type: CMS_CREDENTIALS_TYPE,
        username: 'editor',
        password: nextHash,
      }),
      { returnDocuments: false }
    );
    expect(sdk.patch).not.toHaveBeenCalled();
    expect(JSON.stringify(prompts.log.mock.calls)).not.toContain(nextHash);
    expect(JSON.stringify(prompts.log.mock.calls)).not.toContain('editor');
  });

  it('resets with a guarded update, without deleting the existing account', async () => {
    const { run, prompts, sdk, chain, commit } = fixture([record()]);
    prompts.question
      .mockResolvedValueOnce('y')
      .mockResolvedValueOnce('new-editor');
    prompts.hidden.mockImplementation(async () => {
      expect(commit).not.toHaveBeenCalled();
      return 'new-password';
    });
    await run('--reset');
    expect(sdk.patch).toHaveBeenCalledExactlyOnceWith(CMS_CREDENTIALS_ID);
    expect(chain.ifRevisionId).toHaveBeenCalledExactlyOnceWith(
      'rev-before-prompt'
    );
    expect(chain.set).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'new-editor', password: nextHash })
    );
    expect(sdk.transaction).not.toHaveBeenCalled();
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it.each(['--create', '--reset'] as const)(
    'cancels %s without writes',
    async (mode) => {
      const { run, prompts, sdk, commit } = fixture([record()]);
      prompts.question.mockResolvedValue('n');
      await run(mode);
      expect(prompts.hidden).not.toHaveBeenCalled();
      expect(sdk.patch).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    }
  );

  it.each(['mismatch', 'cancelled prompt'] as const)(
    'leaves the account intact after reset %s',
    async (failure) => {
      const { run, prompts, sdk, commit } = fixture([record()]);
      prompts.question
        .mockResolvedValueOnce('y')
        .mockResolvedValueOnce('editor');
      prompts.hidden.mockResolvedValueOnce('a');
      if (failure === 'mismatch') prompts.hidden.mockResolvedValueOnce('b');
      else
        prompts.hidden.mockRejectedValueOnce(
          new Error('sensitive terminal input')
        );
      await expect(run('--reset')).rejects.toThrow(
        failure === 'mismatch'
          ? 'Passwords do not match'
          : 'Credential operation failed'
      );
      expect(sdk.patch).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    }
  );

  it('updates only after verifying the current password', async () => {
    const { run, prompts, chain } = fixture([record()]);
    prompts.hidden
      .mockResolvedValueOnce('old-password')
      .mockResolvedValue('new-password');
    prompts.question
      .mockResolvedValueOnce('y')
      .mockResolvedValueOnce('renamed')
      .mockResolvedValueOnce('y');
    await run('--update');
    expect(compare).toHaveBeenCalledExactlyOnceWith('old-password', oldHash);
    expect(chain.ifRevisionId).toHaveBeenCalledWith('rev-before-prompt');
    expect(chain.set).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'renamed', password: nextHash })
    );
  });

  it('does not change the hash when only updating the username', async () => {
    const { run, prompts, chain } = fixture([record()]);
    prompts.hidden.mockResolvedValue('old-password');
    prompts.question
      .mockResolvedValueOnce('y')
      .mockResolvedValueOnce('renamed')
      .mockResolvedValueOnce('n');
    await run('--update');
    expect(hash).not.toHaveBeenCalled();
    expect(chain.set).toHaveBeenCalledWith(
      expect.objectContaining({ password: oldHash })
    );
  });

  it('guards deletion in the same transaction and never deletes a public ID', async () => {
    const { run, prompts, transaction, chain, commit } = fixture([record()]);
    prompts.question.mockResolvedValue('y');
    await run('--delete');
    expect(chain.ifRevisionId).toHaveBeenCalledWith('rev-before-prompt');
    expect(transaction.delete).toHaveBeenCalledExactlyOnceWith(
      CMS_CREDENTIALS_ID
    );
    expect(commit).toHaveBeenCalledExactlyOnceWith({ returnDocuments: false });
  });

  it.each(['--create', '--update', '--reset', '--delete'] as const)(
    '%s refuses legacy and unexpected documents before prompting',
    async (mode) => {
      for (const id of [
        'cms-credentials',
        'drafts.cms-credentials',
        'versions.release.cms-credentials',
        'unexpected',
      ]) {
        const { run, prompts, sdk } = fixture([{ ...record(), _id: id }]);
        await expect(run(mode)).rejects.toThrow(
          'Run protect-cms-credentials migration first'
        );
        expect(prompts.question).not.toHaveBeenCalled();
        expect(sdk.patch).not.toHaveBeenCalled();
        expect(sdk.create).not.toHaveBeenCalled();
      }
    }
  );

  it('rejects invalid stored data and wrong current passwords', async () => {
    const invalid = fixture([{ ...record(), password: 'not-bcrypt' }]);
    await expect(invalid.run('--update')).rejects.toThrow(
      'Stored credentials are invalid'
    );
    const existing = fixture([record()]);
    compare.mockResolvedValue(false);
    existing.prompts.hidden.mockResolvedValue('wrong');
    await expect(existing.run('--update')).rejects.toThrow(
      'Current password is incorrect'
    );
    expect(existing.sdk.patch).not.toHaveBeenCalled();
  });

  it('does not overwrite a record created concurrently or expose SDK payloads', async () => {
    const { run, prompts, sdk } = fixture();
    prompts.question.mockResolvedValue('editor');
    prompts.hidden.mockResolvedValue('new-password');
    sdk.create.mockRejectedValue(
      new Error(`conflict: ${nextHash}; bearer secret-token`)
    );
    await expect(run('--create')).rejects.toThrow(
      'Credential operation failed'
    );
    expect(sdk.patch).not.toHaveBeenCalled();
    expect(prompts.log).not.toHaveBeenCalled();
  });

  it('cannot fall back to public credentials when its authenticated read fails', async () => {
    const { run, sdk, prompts } = fixture();
    sdk.fetch.mockRejectedValue(new Error('token secret-token'));
    await expect(run('--create')).rejects.toThrow(
      'Credential operation failed'
    );
    expect(sdk.fetch).toHaveBeenCalledOnce();
    expect(prompts.question).not.toHaveBeenCalled();
  });
});
