// src/components/oportunidades/SituacionBadge.tsx
import { cn } from '@/lib/utils';
import { getSituacionConfig } from '@/lib/utils';
import type { Situacion } from '@/types';

interface SituacionBadgeProps {
    situacion: Situacion;
    size?: 'sm' | 'default';
}

export function SituacionBadge({ situacion, size = 'default' }: SituacionBadgeProps) {
    const config = getSituacionConfig(situacion);

    return (
        <span
            className={cn(
                'badge-situation font-medium',
                size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs'
            )}
            style={{
                backgroundColor: config.bgColor,
                color: config.textColor,
            }}
        >
            {config.label}
        </span>
    );
}
