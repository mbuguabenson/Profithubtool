import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;
    return (
        <div className='app-header__logo' style={{ display: 'flex', alignItems: 'center' }}>
            <img src='/profithub-logo.png' alt='Profithub' style={{ height: '50px', objectFit: 'contain' }} />
        </div>
    );
};
