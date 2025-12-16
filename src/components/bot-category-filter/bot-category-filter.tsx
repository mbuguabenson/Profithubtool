import React from 'react';
import classNames from 'classnames';
import { BotType } from '@/constants/bot-strategies';
import './bot-category-filter.scss';

export type FilterOption = 'all' | BotType;

interface BotCategoryFilterProps {
    activeFilter: FilterOption;
    onFilterChange: (filter: FilterOption) => void;
    normalCount: number;
    automaticCount: number;
}

const BotCategoryFilter: React.FC<BotCategoryFilterProps> = ({
    activeFilter,
    onFilterChange,
    normalCount,
    automaticCount,
}) => {
    const filters: { value: FilterOption; label: string; count: number }[] = [
        { value: 'all', label: 'All Bots', count: normalCount + automaticCount },
        { value: 'normal', label: 'Normal Bots', count: normalCount },
        { value: 'automatic', label: 'Automatic Bots', count: automaticCount },
    ];

    return (
        <div className='bot-filter'>
            <div className='bot-filter__buttons'>
                {filters.map(filter => (
                    <button
                        key={filter.value}
                        className={classNames('bot-filter__btn', {
                            'bot-filter__btn--active': activeFilter === filter.value,
                            [`bot-filter__btn--${filter.value}`]: activeFilter === filter.value,
                        })}
                        onClick={() => onFilterChange(filter.value)}
                    >
                        <span className='bot-filter__btn-label'>{filter.label}</span>
                        <span className='bot-filter__btn-count'>{filter.count}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BotCategoryFilter;
