import React from 'react';

type TRobotIconProps = {
    className?: string;
    height?: number | string;
    width?: number | string;
    fill?: string;
};

const RobotIcon = ({ className, height = 16, width = 16, fill = 'currentColor' }: TRobotIconProps) => (
    <svg
        className={className}
        height={height}
        width={width}
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M12 2C13.1046 2 14 2.89543 14 4V6H17C18.1046 6 19 6.89543 19 8V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V8C5 6.89543 5.89543 6 7 6H10V4C10 2.89543 10.8954 2 12 2ZM7 8V18H17V8H7ZM9 12C9.55228 12 10 12.4477 10 13C10 13.5523 9.55228 14 9 14C8.44772 14 8 13.5523 8 13C8 12.4477 8.44772 12 9 12ZM15 12C15.5523 12 16 12.4477 16 13C16 13.5523 15.5523 14 15 14C14.4477 14 14 13.5523 14 13C14 12.4477 14.4477 12 15 12ZM7 10H17V11H7V10Z'
            fill={fill}
        />
        <circle cx='12' cy='4' r='1.5' fill={fill} />
        <path d='M4 10H2V14H4V10Z' fill={fill} />
        <path d='M22 10H20V14H22V10Z' fill={fill} />
    </svg>
);

export default RobotIcon;
