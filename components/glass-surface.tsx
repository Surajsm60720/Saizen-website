'use client';

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { useEdgeGlow } from '@/lib/edge-glow';
import { EdgeLight } from './edge-light';

type GlassSurfaceProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/**
 * Attaches the BorderGlow-derived edge-light tracking (see lib/edge-glow.ts)
 * to whatever element and className the caller passes. Server components
 * (TopBar, Hero, Pipeline, Features) compose this without themselves needing
 * to become Client Components — the interactivity is isolated to this one
 * leaf. Include "glass" in className when the surface should also get the
 * flat translucent fill (globals.css `.glass`) — the top bar deliberately
 * doesn't, since it already has its own blur/translucency treatment.
 */
export function GlassSurface<T extends ElementType = 'div'>({
  as,
  className = '',
  children,
  ...rest
}: GlassSurfaceProps<T>) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useEdgeGlow<HTMLElement>();

  return (
    <Tag ref={ref} className={className} {...rest}>
      <EdgeLight />
      {children}
    </Tag>
  );
}
