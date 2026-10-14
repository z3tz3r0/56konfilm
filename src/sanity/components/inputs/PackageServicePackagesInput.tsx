'use client';

import { useId } from 'react';
import { Button, Card, Checkbox, Flex, Spinner, Stack, Text } from '@sanity/ui';
import {
  useFormValue,
  type ArrayOfObjectsInputProps,
  type Reference,
} from 'sanity';
import {
  catalogReferenceIds,
  toggleCatalogReference,
} from '../../lib/packageCatalog';
import { PUBLISHED_PACKAGES_QUERY } from '../../lib/queries/packageCatalog';
import { catalogEntryLabel, usePackageCatalog } from './usePackageCatalog';

export function PackageServicePackagesInput(props: ArrayOfObjectsInputProps) {
  const mode = useFormValue(['siteMode']);
  const id = useId();
  const { entries, loading, error, retry } = usePackageCatalog(
    PUBLISHED_PACKAGES_QUERY,
    { mode },
    ['package']
  );
  const value = props.value as Reference[] | undefined;
  const selectedIds = catalogReferenceIds(value);
  const disabled = Boolean(props.readOnly || loading || error);
  const unavailableIds = [...new Set(selectedIds)].filter(
    (selectedId) => !entries.some((entry) => entry._id === selectedId)
  );

  function toggle(packageId: string, checked: boolean) {
    if (disabled) return;
    const patches = toggleCatalogReference(value, packageId, checked);
    if (patches.length) props.onChange(patches);
  }

  return (
    <Stack space={3}>
      {loading ? <Spinner aria-label='กำลังโหลดแพ็กเกจ' /> : null}
      {error ? (
        <Card padding={3} tone='critical' radius={2}>
          <Stack space={3}>
            <Text size={1}>
              ยังโหลดแพ็กเกจไม่ได้ กรุณาลองอีกครั้ง รายการที่เลือกไว้ยังคงเดิม
            </Text>
            <Button text='ลองอีกครั้ง' mode='ghost' onClick={retry} />
          </Stack>
        </Card>
      ) : null}
      {!loading && !error && entries.length === 0 ? (
        <Text size={1} muted>
          ยังไม่มีแพ็กเกจที่เผยแพร่แล้วในโหมดนี้ กรุณาสร้างและ Publish
          แพ็กเกจก่อน
        </Text>
      ) : null}
      {entries.map((entry) => (
        <Card key={entry._id} padding={3} radius={2} border>
          <Flex align='center' gap={3}>
            <Checkbox
              id={`${id}-${entry._id}`}
              checked={selectedIds.includes(entry._id)}
              disabled={disabled}
              onChange={(event) =>
                toggle(entry._id, event.currentTarget.checked)
              }
            />
            <Text as='label' htmlFor={`${id}-${entry._id}`} size={1}>
              {catalogEntryLabel(entry)}
            </Text>
          </Flex>
        </Card>
      ))}
      {!loading && !error && unavailableIds.length > 0 ? (
        <Card padding={3} tone='caution' radius={2}>
          <Stack space={3}>
            <Text size={1}>
              มีแพ็กเกจอ้างอิงที่ใช้ไม่ได้
              กรุณาลบรายการเหล่านี้แล้วเลือกแพ็กเกจที่เผยแพร่แล้วของโหมดนี้
            </Text>
            {unavailableIds.map((packageId) => (
              <Flex
                key={packageId}
                align='center'
                gap={3}
                justify='space-between'
              >
                <Text size={1}>{packageId}</Text>
                <Button
                  text='ลบรายการอ้างอิง'
                  aria-label={`ลบรายการอ้างอิง ${packageId}`}
                  mode='ghost'
                  disabled={disabled}
                  onClick={() => toggle(packageId, false)}
                />
              </Flex>
            ))}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
