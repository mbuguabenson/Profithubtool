import { useEffect, useState } from 'react';
import { LegacyDerivIcon } from '@deriv/quill-icons/Legacy';
import './welcome-screen.scss';

const STEPS = [
    'Connecting to Deriv API',
    'Initializing market data',
    'Setting up data from servers',
    'Connecting accounts',
    'Finalizing setup',
];

export default function WelcomeScreen() {
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // Simulate progress for visual engagement
        // We assume real loading takes ~3-5 seconds based on previous observation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) {
                    clearInterval(interval);
                    return 99; // Wait for actual app to unmount this component
                }
                const increment = Math.random() * 2; // Random speed
                return Math.min(prev + increment, 99);
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Sync steps with progress milestones
        const step = Math.floor((progress / 100) * STEPS.length);
        setCurrentStepIndex(Math.min(step, STEPS.length - 1));
    }, [progress]);

    return (
        <div className='welcome-screen'>
            <div className='welcome-screen__content-wrapper'>
                {/* <h1 className='welcome-screen__title'>Profit Hub</h1> */}{' '}
                {/* Removing title if screenshot doesn't imply big title, but keeping it is safer for branding unless asked to remove. Screenshot has text at top. */}
                <p className='welcome-screen__subtitle'>
                    Smart Analysis tools, High accuracy strategies, Signals, Advanced Trading Engines, Automation
                    <br />
                    Setting up your trading environment...
                </p>
                {/* Progress Bar Section */}
                <div className='welcome-screen__progress-container'>
                    <div className='welcome-screen__progress-bar-wrapper'>
                        <div className='welcome-screen__progress-bar' style={{ width: `${progress}%` }} />
                    </div>
                    <div className='welcome-screen__percentage'>{Math.round(progress)}%</div>
                </div>
                <div className='welcome-screen__steps-container'>
                    {/* <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.6rem' }}>
                        <AppLogo />
                    </div> */}
                    {/* Screenshot doesn't show logo inside the steps box, usually. Keeping it out. */}

                    <h3 className='welcome-screen__steps-title'>Initialization Progress</h3>
                    {STEPS.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isActive = index === currentStepIndex;

                        return (
                            <div
                                key={step}
                                className={`welcome-screen__step ${isActive ? 'welcome-screen__step--active' : ''} ${
                                    isCompleted ? 'welcome-screen__step--completed' : ''
                                }`}
                            >
                                <div className='welcome-screen__step-icon' />
                                <span className='welcome-screen__step-text'>{step}</span>
                                {isCompleted && <span className='welcome-screen__step-check'>✓</span>}
                                {isActive && <span className='welcome-screen__step-loading'>Loading...</span>}
                            </div>
                        );
                    })}
                </div>
                <div className='welcome-screen__footer'>
                    <h3>Contact & Support</h3>
                    <div className='welcome-screen__footer-content'>
                        <div className='welcome-screen__contact-item'>
                            <span>Email</span>
                            <span>mbuguabenson2020@gmail.com</span>
                        </div>
                        <div className='welcome-screen__contact-item welcome-screen__contact-item--right'>
                            <span>WhatsApp</span>
                            <span>+254757722344</span>
                        </div>
                    </div>
                    <div className='welcome-screen__support-text'>24/7 Support Available</div>
                </div>
                <div className='welcome-screen__powered-by'>
                    <span>Powered by</span>
                    <LegacyDerivIcon iconSize='sm' fill='var(--text-prominent)' />
                    <span style={{ fontWeight: 700, marginLeft: '4px' }}>DERIV</span>
                </div>
            </div>
        </div>
    );
}
