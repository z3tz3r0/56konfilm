'use client';

import { useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import {
  useFormValue,
  type ArrayOfObjectsInputProps,
  type Reference,
} from 'sanity';
import {
  catalogReferenceIds,
  orderedCatalogServices,
  reorderCatalogReferences,
} from '../../lib/packageCatalog';
import { GROUP_SERVICES_QUERY } from '../../lib/queries/packageCatalog';
import { catalogEntryLabel, usePackageCatalog } from './usePackageCatalog';

export function PackageGroupServiceOrderInput(props: ArrayOfObjectsInputProps) {
  const mode = useFormValue(['siteMode']);
  const packageIds = catalogReferenceIds(useFormValue(['packages']));
  const { entries, loading, error, retry } = usePackageCatalog(
    GROUP_SERVICES_QUERY,
    { mode, packageIds },
    ['package', 'packageService']
  );
  const value = props.value as Reference[] | undefined;
  const services = orderedCatalogServices(entries, value);
  const disabled = Boolean(props.readOnly || loading || error);
  const draggedId = useRef<string | null>(null);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const instructionsId = useId();
  const [announcement, setAnnouncement] = useState('');

  function move(serviceId: string, to: number) {
    if (disabled || to < 0 || to >= services.length) return;
    const from = services.findIndex((service) => service._id === serviceId);
    if (from < 0 || from === to) return;
    const ids = services.map((service) => service._id);
    ids.splice(from, 1);
    ids.splice(to, 0, serviceId);
    props.onChange(reorderCatalogReferences(value, ids));
    setAnnouncement(
      `ย้าย ${catalogEntryLabel(services[from])} ไปที่ลำดับ ${to + 1}`
    );
    requestAnimationFrame(() =>
      handles.current.get(serviceId)?.focus({ preventScroll: true })
    );
  }

  return (
    <Stack space={3}>
      <Text id={instructionsId} size={1} muted>
        ลากที่จับเพื่อจัดลำดับ หรือโฟกัสที่จับแล้วใช้ลูกศรขึ้น/ลง และ Home/End
        จากนั้น Publish กลุ่มเพื่อใช้ลำดับใหม่บนหน้าเว็บ
      </Text>
      {loading ? <Spinner aria-label='กำลังโหลดรายการเปรียบเทียบ' /> : null}
      {error ? (
        <Card padding={3} tone='critical' radius={2}>
          <Stack space={3}>
            <Text size={1}>
              ยังโหลดรายการเปรียบเทียบไม่ได้ ลำดับที่บันทึกไว้ยังคงเดิม
            </Text>
            <Button text='ลองอีกครั้ง' mode='ghost' onClick={retry} />
          </Stack>
        </Card>
      ) : null}
      {!loading && !error && services.length === 0 ? (
        <Text size={1} muted>
          ยังไม่มีบริการที่เผยแพร่แล้วในแพ็กเกจของกลุ่มนี้
        </Text>
      ) : null}
      <Stack
        as='ol'
        space={2}
        aria-label='รายการเปรียบเทียบ'
        style={{ margin: 0, padding: 0, listStyle: 'none' }}
      >
        {services.map((service, index) => (
          <Card
            as='li'
            key={service._id}
            padding={2}
            radius={2}
            border
            onDragOver={(event) => {
              if (!disabled && draggedId.current) event.preventDefault();
            }}
            onDrop={(event) => {
              if (disabled || !draggedId.current) return;
              event.preventDefault();
              move(draggedId.current, index);
              draggedId.current = null;
            }}
          >
            <Flex align='center' gap={2}>
              <Button
                ref={(node) => {
                  if (node) handles.current.set(service._id, node);
                  else handles.current.delete(service._id);
                }}
                icon={GripVertical}
                mode='bleed'
                aria-label={`จัดลำดับ ${catalogEntryLabel(service)}`}
                aria-describedby={instructionsId}
                aria-keyshortcuts='ArrowUp ArrowDown Home End'
                disabled={disabled || services.length < 2}
                draggable={!disabled && services.length > 1}
                onDragStart={(event) => {
                  if (disabled) {
                    event.preventDefault();
                    return;
                  }
                  draggedId.current = service._id;
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', service._id);
                }}
                onDragEnd={() => {
                  draggedId.current = null;
                }}
                onKeyDown={(event) => {
                  const target = {
                    ArrowUp: index - 1,
                    ArrowDown: index + 1,
                    Home: 0,
                    End: services.length - 1,
                  }[event.key];
                  if (target === undefined || disabled) return;
                  event.preventDefault();
                  move(service._id, target);
                }}
              />
              <Text size={1} style={{ flex: 1 }}>
                {catalogEntryLabel(service)}
              </Text>
              <Button
                icon={ArrowUp}
                mode='bleed'
                aria-label={`เลื่อน ${catalogEntryLabel(service)} ขึ้น`}
                disabled={disabled || index === 0}
                onClick={() => move(service._id, index - 1)}
              />
              <Button
                icon={ArrowDown}
                mode='bleed'
                aria-label={`เลื่อน ${catalogEntryLabel(service)} ลง`}
                disabled={disabled || index === services.length - 1}
                onClick={() => move(service._id, index + 1)}
              />
            </Flex>
          </Card>
        ))}
      </Stack>
      <Text size={1} role='status' aria-live='polite'>
        {announcement}
      </Text>
    </Stack>
  );
}
