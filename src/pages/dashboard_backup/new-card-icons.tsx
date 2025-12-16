import React from 'react';

type NeonIconProps = {
    width?: number | string;
    height?: number | string;
};

// Common neon effect styles
const neonGlowBlue = { filter: 'drop-shadow(0 0 4px #0072ff)' };
const neonGlowCyan = { filter: 'drop-shadow(0 0 4px #00c6ff)' };
const neonGlowTeal = { filter: 'drop-shadow(0 0 4px #4bb4b3)' };

export const NeonComputerIcon = ({ width = 64, height = 64 }: NeonIconProps) => (
    <svg
        width={width}
        height={height}
        viewBox='0 0 64 64'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={neonGlowBlue}
    >
        <rect x='8' y='10' width='48' height='32' rx='4' stroke='#0072ff' strokeWidth='2' fill='none' />
        <path d='M16 42H48' stroke='#0072ff' strokeWidth='2' strokeLinecap='round' />
        <path d='M28 42L24 52H40L36 42' stroke='#0072ff' strokeWidth='2' strokeLinejoin='round' />
        <rect x='20' y='52' width='24' height='2' rx='1' fill='#0072ff' />
        <circle cx='32' cy='26' r='4' fill='#0072ff' fillOpacity='0.3' />
    </svg>
);

export const NeonDriveIcon = ({ width = 64, height = 64 }: NeonIconProps) => (
    <svg
        width={width}
        height={height}
        viewBox='0 0 64 64'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={neonGlowCyan}
    >
        <path d='M32 10L52 48H12L32 10Z' stroke='#00c6ff' strokeWidth='2' strokeLinejoin='round' fill='none' />
        <path d='M22 29L32 48' stroke='#4bb4b3' strokeWidth='2' strokeLinecap='round' />
        <path d='M42 29H22' stroke='#4bb4b3' strokeWidth='2' strokeLinecap='round' />
        <circle cx='32' cy='34' r='3' fill='#00c6ff' />
    </svg>
);

export const NeonBotBuilderIcon = ({ width = 64, height = 64 }: NeonIconProps) => (
    <svg
        width={width}
        height={height}
        viewBox='0 0 64 64'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={neonGlowBlue}
    >
        <defs>
            <linearGradient id='puzzleGradient' x1='16' y1='16' x2='48' y2='48' gradientUnits='userSpaceOnUse'>
                <stop offset='0%' stopColor='#00c6ff' />
                <stop offset='100%' stopColor='#0072ff' />
            </linearGradient>
        </defs>
        <path
            d='M32 16V24C32 26.2 33.8 28 36 28C38.2 28 40 26.2 40 24V16H48V24C48 26.2 46.2 28 44 28V36C44 38.2 45.8 40 48 40H56V48H48C45.8 48 44 49.8 44 52V60H32V52C32 49.8 30.2 48 28 48C25.8 48 24 49.8 24 52V60H8V52C8 49.8 9.8 48 12 48H20C22.2 48 24 46.2 24 44V36C24 33.8 22.2 32 20 32C17.8 32 16 33.8 16 36V44H8V24C8 26.2 9.8 28 12 28H20C22.2 28 24 26.2 24 24V16H32Z'
            stroke='url(#puzzleGradient)'
            strokeWidth='2'
            fill='none'
        />
        <circle cx='32' cy='38' r='6' stroke='#00c6ff' strokeWidth='1.5' />
    </svg>
);

export const NeonQuickStrategyIcon = ({ width = 64, height = 64 }: NeonIconProps) => (
    <svg
        width={width}
        height={height}
        viewBox='0 0 64 64'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={neonGlowTeal}
    >
        <path d='M20 20H32V32H20V20Z' stroke='#4bb4b3' strokeWidth='2' rx='2' />
        <path d='M36 36H48V48H36V36Z' stroke='#00a79e' strokeWidth='2' rx='2' />
        <path d='M32 26H36' stroke='#4bb4b3' strokeWidth='2' strokeDasharray='4 2' />
        <path d='M26 32V36' stroke='#4bb4b3' strokeWidth='2' strokeDasharray='4 2' />
        <circle cx='26' cy='26' r='2' fill='#4bb4b3' />
        <circle cx='42' cy='42' r='2' fill='#00a79e' />
    </svg>
);
