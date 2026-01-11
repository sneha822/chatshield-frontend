import React, { useMemo } from 'react';
import { pie, arc } from 'd3';
import { ClientTooltip, TooltipTrigger, TooltipContent } from './Tooltip';

const GRADIENT_PAIRS = [
    { from: "text-emerald-400", to: "text-emerald-500" },
    { from: "text-blue-400", to: "text-blue-500" },
    { from: "text-indigo-400", to: "text-indigo-500" },
    { from: "text-purple-400", to: "text-purple-500" },
    { from: "text-pink-400", to: "text-pink-500" },
    { from: "text-amber-400", to: "text-amber-500" },
];

const RosenDonutChart = ({ data, labelKey, valueKey }) => {
    if (!data || data.length === 0) return null;

    // Transform data to match snippet expectation (adding colors)
    const processedData = useMemo(() => {
        return data.map((d, i) => ({
            name: d[labelKey],
            value: d[valueKey],
            colorFrom: GRADIENT_PAIRS[i % GRADIENT_PAIRS.length].from,
            colorTo: GRADIENT_PAIRS[i % GRADIENT_PAIRS.length].to,
        }));
    }, [data, labelKey, valueKey]);

    // Chart dimensions
    const radius = Math.PI * 100;
    const gap = 0.02; // Gap between slices

    // Pie layout and arc generator
    const pieLayout = pie()
        .sort(null)
        .value((d) => d.value)
        .padAngle(gap);

    const arcGenerator = arc()
        .innerRadius(20)
        .outerRadius(radius)
        .cornerRadius(8);

    const labelRadius = radius * 0.8;
    const arcLabel = arc().innerRadius(labelRadius).outerRadius(labelRadius);

    const arcs = pieLayout(processedData);

    // Calculate the angle for each slice
    const computeAngle = (d) => {
        return ((d.endAngle - d.startAngle) * 180) / Math.PI;
    };

    // Minimum angle to display text
    const MIN_ANGLE = 20;

    return (
        <div className="p-2 sm:p-4 w-full flex justify-center">
            <div className="relative w-full max-w-[20rem]">
                <svg
                    viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
                    className="overflow-visible w-full h-auto"
                >
                    <defs>
                        {arcs.map((d, i) => {
                            const midAngle = (d.startAngle + d.endAngle) / 2;
                            return (
                                <linearGradient
                                    key={`gradient-${i}`}
                                    id={`pieColors-${i}`}
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                    gradientTransform={`rotate(${(midAngle * 180) / Math.PI - 90}, 0.5, 0.5)`}
                                >
                                    <stop offset="0%" stopColor="currentColor" className={d.data.colorFrom} />
                                    <stop offset="100%" stopColor="currentColor" className={d.data.colorTo} />
                                </linearGradient>
                            );
                        })}
                    </defs>

                    {/* Slices */}
                    {arcs.map((d, i) => (
                        <ClientTooltip key={i}>
                            <TooltipTrigger as="g">
                                <path
                                    fill={`url(#pieColors-${i})`}
                                    d={arcGenerator(d)}
                                    className="transition-opacity hover:opacity-90 cursor-pointer"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex gap-2.5 items-center">
                                    <div className={`w-1 h-8 ${d.data.colorFrom} bg-current rounded-full`}></div>
                                    <div>
                                        <div className="font-medium text-text-main">{d.data.name}</div>
                                        <div className="text-text-muted text-sm/5">{d.data.value.toLocaleString()}</div>
                                    </div>
                                </div>
                            </TooltipContent>
                        </ClientTooltip>
                    ))}
                </svg>

                {/* Labels as absolutely positioned divs */}
                <div className="absolute inset-0 pointer-events-none">
                    {arcs.map((d, i) => {
                        const angle = computeAngle(d);
                        if (angle <= MIN_ANGLE) return null;

                        // Get pie center position
                        const [x, y] = arcLabel.centroid(d);
                        const CENTER_PCT = 50;

                        // Convert to percentage positions
                        const nameLeft = `${CENTER_PCT + (x / radius) * 40}%`;
                        const nameTop = `${CENTER_PCT + (y / radius) * 40}%`;

                        const valueLeft = `${CENTER_PCT + (x / radius) * 72}%`;
                        const valueTop = `${CENTER_PCT + (y / radius) * 70}%`;

                        return (
                            <div key={i}>
                                <div
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-text-main"
                                    style={{ left: valueLeft, top: valueTop }}
                                >
                                    {d.data.value}
                                </div>
                                <div
                                    className="absolute max-w-[80px] text-white truncate text-center text-xs font-medium px-1 py-0.5 rounded bg-black/20 backdrop-blur-[2px]"
                                    style={{
                                        left: nameLeft,
                                        top: nameTop,
                                        transform: "translate(-50%, -50%)",
                                        marginLeft: x > 0 ? "2px" : "-2px",
                                        marginTop: y > 0 ? "2px" : "-2px",
                                    }}
                                >
                                    {d.data.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RosenDonutChart;
