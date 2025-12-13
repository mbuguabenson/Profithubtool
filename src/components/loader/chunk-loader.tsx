import './loader.scss';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='profithub-loader-wrapper'>
            <div className='bouncing-loader'>
                <div />
                <div />
                <div />
                <div />
            </div>
            <div className='load-message'>{message}</div>
        </div>
    );
}
