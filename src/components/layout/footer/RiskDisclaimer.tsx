import { useState } from 'react';
import Dialog from '@/components/shared_ui/dialog';
import { useTranslations } from '@deriv-com/translations';
import { Text } from '@deriv-com/ui';

const RiskDisclaimer = () => {
    const { localize } = useTranslations();
    const [is_open, setIsOpen] = useState(false);

    return (
        <>
            <div
                className='footer-item'
                onClick={() => setIsOpen(true)}
                style={{ cursor: 'pointer', marginLeft: '1.6rem', color: 'var(--text-general)' }}
            >
                <Text size='xs' weight='bold'>
                    {localize('Risk Disclaimer')}
                </Text>
            </div>

            <Dialog
                is_visible={is_open}
                title={localize('Risk Disclaimer')}
                confirm_button_text={localize('I understand the Risks')}
                onConfirm={() => setIsOpen(false)}
                onClose={() => setIsOpen(false)}
                is_closed_on_cancel={false}
                has_close_icon={true}
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <Text as='p' size='sm' className='risk-text'>
                        {localize('Deriv Trading Risk Disclaimer')}
                    </Text>
                    <br />
                    <Text as='p' size='xs'>
                        {localize(
                            'Trading multipliers and other derivative products on Deriv involves significant risk of loss and is not suitable for all investors. Before deciding to trade, carefully consider your financial situation and experience level.'
                        )}
                    </Text>
                    <br />
                    <Text as='h4' weight='bold' size='xs'>
                        {localize('Key Risks:')}
                    </Text>
                    <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                        <li>
                            <Text size='xs'>
                                <strong>{localize('Leverage Risk:')}</strong>{' '}
                                {localize(
                                    "Deriv's multiplier products allow you to multiply potential gains, but also magnify potential losses."
                                )}
                            </Text>
                        </li>
                        <li>
                            <Text size='xs'>
                                <strong>{localize('Market Risk:')}</strong>{' '}
                                {localize(
                                    'Financial markets are volatile and can move rapidly in unexpected directions.'
                                )}
                            </Text>
                        </li>
                        <li>
                            <Text size='xs'>
                                <strong>{localize('Liquidity Risk:')}</strong>{' '}
                                {localize('Some markets may become illiquid, making it difficult to close positions.')}
                            </Text>
                        </li>
                        <li>
                            <Text size='xs'>
                                <strong>{localize('Technical Risk:')}</strong>{' '}
                                {localize(
                                    'System failures, internet connectivity issues, or other technical problems may prevent order execution.'
                                )}
                            </Text>
                        </li>
                        <li>
                            <Text size='xs'>
                                <strong>{localize('Regulatory Risk:')}</strong>{' '}
                                {localize(
                                    'Deriv operates under different regulatory frameworks which may affect your rights as a trader.'
                                )}
                            </Text>
                        </li>
                    </ul>
                    <br />
                    <Text as='h4' weight='bold' size='xs'>
                        {localize('Important Considerations:')}
                    </Text>
                    <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                        <li>
                            <Text size='xs'>{localize('You could lose some or all of your invested capital.')}</Text>
                        </li>
                        <li>
                            <Text size='xs'>{localize('Never trade with money you cannot afford to lose.')}</Text>
                        </li>
                        <li>
                            <Text size='xs'>{localize('Past performance is not indicative of future results.')}</Text>
                        </li>
                        <li>
                            <Text size='xs'>
                                {localize(
                                    'Seek independent financial advice if you have any doubts about your understanding of these risks.'
                                )}
                            </Text>
                        </li>
                    </ul>
                    <br />
                    <Text as='p' size='xs' weight='bold'>
                        {localize(
                            'By continuing to use this platform, you acknowledge that you have read, understood, and accept these risks associated with trading on Deriv.'
                        )}
                    </Text>
                </div>
            </Dialog>
        </>
    );
};

export default RiskDisclaimer;
