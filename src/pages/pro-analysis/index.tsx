import React from 'react';

const ProAnalysis = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 85px)', overflow: 'hidden' }}>
            <iframe
                src="https://v0-profithubdtradesversion22-phi.vercel.app/"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
                title="Pro Analysis"
            />
        </div>
    );
};

export default ProAnalysis;
