// src/components/shared/ResponsableAvatar.tsx
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ResponsableAvatarProps {
    nombre: string;
    color?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showName?: boolean;
}

const SIZE_CLASSES = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
};

export function ResponsableAvatar({ nombre, color = '#6366f1', size = 'sm', showName = false }: ResponsableAvatarProps) {
    const bgColor = color + '20'; // 12% opacity
    const textColor = color;

    return (
        <div className="flex items-center gap-2">
            <div
                className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', SIZE_CLASSES[size])}
                style={{ backgroundColor: bgColor, color: textColor }}
                title={nombre}
            >
                {getInitials(nombre)}
            </div>
            {showName && (
                <span className="text-sm text-slate-700 truncate">{nombre}</span>
            )}
        </div>
    );
}
