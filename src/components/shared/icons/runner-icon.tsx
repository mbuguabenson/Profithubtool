type TRunnerIconProps = {
    className?: string;
    width?: number;
    height?: number;
    fill?: string;
};

const RunnerIcon = ({ className, width = 48, height = 48, fill }: TRunnerIconProps) => {
    const isMonochrome = fill && fill !== 'none';
    const style = isMonochrome ? { filter: 'grayscale(100%) opacity(0.6)' } : {};

    return (
        <img src='/runner-icon.png' className={className} width={width} height={height} alt='Runner' style={style} />
    );
};

export default RunnerIcon;
