import { localize } from '@deriv-com/translations';

const ProAnalysis = () => {
    return (
        <div style={{ height: 'calc(100vh - 84px)', width: '100%', overflow: 'hidden' }}>
            <iframe
                src='https://v0-profithubdtradesversion22-phi.vercel.app/'
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={localize('Pro Analysis')}
            />
        </div>
    );
};

export default ProAnalysis;
