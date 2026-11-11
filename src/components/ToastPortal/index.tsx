'use client';

import { FC, memo, useEffect, useState } from 'react';

import { named } from '../../helpers/component.helper';

import ToastHub, { type ToastHubProps } from '../Toast';

/**
 * `ToastHub`ı montajdan SONRA çizen sarmalayıcı.
 * ⚠ SUNUCUDA ÇİZİLMEMESİ ŞART. `ToastHub` portal kullanıyor ve `document` olmadan çalışamaz
 * `ToastHub`ın bütün prop'larını (`placement`, `inset`, etiketler) olduğu gibi iletir.
 */
const ToastPortal: FC<ToastHubProps> = props => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return <ToastHub {...props} />;
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ToastPortal, 'ToastPortal'),
) as typeof ToastPortal;
