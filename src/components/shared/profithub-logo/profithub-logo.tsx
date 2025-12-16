import React from 'react';
import './profithub-logo.scss';

interface ProfithubLogoProps {
    variant?: 'horizontal' | 'vertical' | 'icon';
    height?: number;
    className?: string;
}

const ProfithubLogo: React.FC<ProfithubLogoProps> = ({ variant = 'horizontal', height = 40, className }) => {
    const logoSrc = {
        horizontal: '/images/profithub-logo-horizontal.png',
        vertical: '/images/profithub-logo-vertical.png',
        icon: '/images/profithub-logo-icon.png',
    };

    return (
        <img
            src={logoSrc[variant]}
            alt='Profithub - Trade smarter, earn faster'
            height={height}
            className={`profithub-logo profithub-logo--${variant} ${className || ''}`}
        />
    );
};

export default ProfithubLogo;
