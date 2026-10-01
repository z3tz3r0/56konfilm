'use client';

import { useToast } from '@sanity/ui';
import { set, type UrlInputProps } from 'sanity';
import type { ClipboardEvent } from 'react';
import { extractGoogleMapsEmbedUrl } from '@shared/utils/url/googleMaps';

export function GoogleMapsEmbedUrlInput(props: UrlInputProps) {
  const toast = useToast();

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (props.readOnly) return;

    const pasted = event.clipboardData.getData('text/plain').trim();
    if (!pasted.startsWith('<')) return;

    event.preventDefault();
    event.stopPropagation();

    const url = extractGoogleMapsEmbedUrl(pasted);
    if (!url) {
      toast.push({
        status: 'error',
        title: 'วางแผนที่ไม่สำเร็จ',
        description:
          'กรุณาคัดลอกโค้ดฝังแผนที่จาก Google Maps แล้วลองอีกครั้ง แผนที่เดิมไม่เปลี่ยน',
      });
      return;
    }

    props.onChange(set(url));
    toast.push({
      status: 'success',
      title: 'เพิ่มแผนที่แล้ว',
      description: 'ระบบบันทึกเฉพาะลิงก์แผนที่',
    });
  }

  return <div onPasteCapture={handlePaste}>{props.renderDefault(props)}</div>;
}
