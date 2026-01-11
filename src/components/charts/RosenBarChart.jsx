import React from 'react';
import { scaleBand, scaleLinear, max } from 'd3';
import { ClientTooltip, TooltipTrigger, TooltipContent } from './Tooltip';

const RosenBarChart = ({
    data,
    valueKey,
    labelKey,
    colorScheme = 'purple',
    height = 300
}) => {
    if (!data || data.length === 0) return null;

    // Use spread syntax for immutability and compatibility
    const sortedData = [...data].sort((a, b) => b[valueKey] - a[valueKey]);

    // Scales
    const yScale = scaleBand()
        .domain(sortedData.map((d) => d[labelKey]))
        .range([0, 100])
        .padding(0.175);

    const xScale = scaleLinear()
        .domain([0, max(sortedData.map((d) => d[valueKey])) ?? 0])
        .range([0, 100]);

    const longestWord = max(sortedData.map((d) => d[labelKey].length)) || 1;

    // Determine generic color class
    const getColorClass = () => {
        if (colorScheme === 'red') return 'from-red-400 to-red-500';
        if (colorScheme === 'emerald') return 'from-emerald-400 to-emerald-500';
        return 'from-purple-400 to-purple-500';
    };

    const barColorClass = getColorClass();

    return (
        <div
            className="relative w-full text-sm"
            style={{
                height: `${Math.max(height, sortedData.length * 40)}px`,
                "--marginTop": "0px",
                "--marginRight": "0px",
                "--marginBottom": "16px",
                "--marginLeft": `${longestWord * 7}px`,
            }}
        >
            {/* Chart Area */}
            <div
                className="absolute inset-0
                    z-10
                    h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                    w-[calc(100%_-_var(--marginLeft)_-_var(--marginRight))]
                    translate-x-(--marginLeft)
                    translate-y-(--marginTop)
                    overflow-visible
                "
            >
                {/* Bars with Rounded Right Corners */}
                {sortedData.map((d, index) => {
                    const barWidth = xScale(d[valueKey]);
                    const barHeight = yScale.bandwidth();

                    return (
                        <ClientTooltip key={index}>
                            <TooltipTrigger as="div">
                                <div
                                    style={{
                                        left: "0",
                                        top: `${yScale(d[labelKey])}%`,
                                        width: `${barWidth}%`,
                                        height: `${barHeight}%`,
                                        borderRadius: "0 6px 6px 0",
                                    }}
                                    className={`absolute bg-gradient-to-b ${barColorClass} transition-opacity hover:opacity-80`}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex gap-2.5 items-center">
                                    <div className={`w-1 h-8 bg-gradient-to-b ${barColorClass} rounded-full`}></div>
                                    <div>
                                        <div className="font-medium text-text-main">{d[labelKey]}</div>
                                        <div className="text-text-muted text-sm/5">{d[valueKey].toLocaleString()}</div>
                                    </div>
                                </div>
                            </TooltipContent>
                        </ClientTooltip>
                    );
                })}

                <svg className="h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {xScale
                        .ticks(8)
                        .map(xScale.tickFormat(8, "d"))
                        .map((active, i) => (
                            <g
                                transform={`translate(${xScale(+active)},0)`}
                                className="text-gray-300/80 dark:text-gray-800/80"
                                key={i}
                            >
                                <line
                                    y1={0}
                                    y2={100}
                                    stroke="currentColor"
                                    strokeDasharray="6,5"
                                    strokeWidth={0.5}
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        ))}
                </svg>

                {/* X Axis (Values) */}
                {xScale.ticks(4).map((value, i) => (
                    <div
                        key={i}
                        style={{
                            left: `${xScale(value)}%`,
                            top: "100%",
                        }}
                        className="absolute text-xs -translate-x-1/2 tabular-nums text-text-muted mt-2"
                    >
                        {value}
                    </div>
                ))}
            </div>

            {/* Y Axis (Letters) */}
            <div
                className="
                    h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                    w-(--marginLeft)
                    translate-y-(--marginTop)
                    overflow-visible absolute top-0 left-0"
            >
                {sortedData.map((entry, i) => (
                    <span
                        key={i}
                        style={{
                            left: "-8px",
                            top: `${yScale(entry[labelKey]) + yScale.bandwidth() / 2}%`,
                        }}
                        className="absolute text-xs text-text-muted -translate-y-1/2 w-full text-right truncate pr-2"
                    >
                        {entry[labelKey]}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default RosenBarChart;
