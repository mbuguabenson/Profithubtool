import React from 'react';
import ProfithubLogo from '../shared/profithub-logo/profithub-logo';
import './loader.scss';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='profithub-loader-wrapper'>
            <div className='loader-content'>
                <div className='logo-container'>
                    <ProfithubLogo variant='horizontal' height={40} />
                </div>
                
                <div className='loading-animation'>
                    <div className='ring'></div>
                </div>

                <div className='load-message'>{message || 'Loading ProfiHub...'}</div>
            </div>
        </div>
    );
}
