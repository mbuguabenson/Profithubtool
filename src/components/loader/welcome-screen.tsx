import React from 'react';
import { BrandDerivWordmarkWhiteIcon } from '@deriv/quill-icons/Logo';
import { Localize } from '@deriv-com/translations';
import './welcome-screen.scss';

type TWelcomeScreenProps = {
    message?: string;
};

const WelcomeScreen = ({ message }: TWelcomeScreenProps) => {
    // Optional: Add some logic here if we want to change loading messages periodically

    return (
        <div className='welcome-screen'>
            <div className='welcome-screen__content'>
                {/* Optional Robot Icon could go here */}

                <h1 className='welcome-screen__title'>
                    <Localize i18n_default_text='Welcome to Profithub Tool' />
                </h1>

                <p className='welcome-screen__subtitle'>
                    {message || <Localize i18n_default_text='Preparing your dashboard...' />}
                </p>

                <div className='welcome-screen__loader' />
            </div>

            <div className='welcome-screen__footer'>
                <span className='welcome-screen__footer-text'>
                    <Localize i18n_default_text='Powered by' />
                </span>
                <BrandDerivWordmarkWhiteIcon
                    height={24}
                    width={72} // Adjusted approx width for 24px height
                    className='welcome-screen__footer-logo'
                />
            </div>
        </div>
    );
};

export default WelcomeScreen;
