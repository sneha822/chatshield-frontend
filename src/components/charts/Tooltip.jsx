import React, { createContext, useContext, useState, useRef, useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";

/* -------------------------------------------------------------------------------------------------
 * This is a basic tooltip created for the chart demos. Customize as needed or bring your own solution.
 * -----------------------------------------------------------------------------------------------*/

const TooltipContext = createContext(undefined);

function useTooltipContext(componentName) {
    const context = useContext(TooltipContext);
    if (!context) {
        throw new Error("Tooltip must be used within a Tooltip Context");
    }
    return context;
}

/* -------------------------------------------------------------------------------------------------
 * Tooltip
 * -----------------------------------------------------------------------------------------------*/

const ClientTooltip = ({ children }) => {
    const [tooltip, setTooltip] = useState();

    return (
        <TooltipContext.Provider value={{ tooltip, setTooltip }}>
            {children}
        </TooltipContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "TooltipTrigger";

const TooltipTrigger = forwardRef((props, forwardedRef) => {
    const { children, as: Component = "g", ...rest } = props; // Polymorphic 'as' prop
    const context = useTooltipContext(TRIGGER_NAME);
    const triggerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target)) {
                context.setTooltip(undefined);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [context]);

    return (
        <Component
            ref={(node) => {
                // Maintain both refs
                triggerRef.current = node;
                if (typeof forwardedRef === "function") {
                    forwardedRef(node);
                } else if (forwardedRef) {
                    forwardedRef.current = node;
                }
            }}
            onPointerMove={(event) => {
                // Only handle mouse events, not touch
                if (event.pointerType === "mouse") {
                    context.setTooltip({ x: event.clientX, y: event.clientY });
                }
            }}
            onPointerLeave={(event) => {
                // Only handle mouse events, not touch
                if (event.pointerType === "mouse") {
                    context.setTooltip(undefined);
                }
            }}
            onTouchStart={(event) => {
                // On mobile, trigger when clicked instead of hover. Change as needed.
                if (event.touches && event.touches[0]) {
                    context.setTooltip({ x: event.touches[0].clientX, y: event.touches[0].clientY });
                    setTimeout(() => {
                        context.setTooltip(undefined);
                    }, 2000);
                }
            }}
            {...rest}
        >
            {children}
        </Component>
    );
}
);

TooltipTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "TooltipContent";

const TooltipContent = forwardRef((props, forwardedRef) => {
    const { children } = props;
    const context = useTooltipContext(CONTENT_NAME);
    const runningOnClient = typeof document !== "undefined";
    const tooltipRef = useRef(null);

    // Calculate position based on viewport
    const getTooltipPosition = () => {
        if (!tooltipRef.current || !context.tooltip) return {};

        const tooltipWidth = tooltipRef.current.offsetWidth;
        const viewportWidth = window.innerWidth;
        const willOverflowRight = context.tooltip.x + tooltipWidth + 10 > viewportWidth;

        return {
            top: context.tooltip.y - 20,
            left: willOverflowRight ? context.tooltip.x - tooltipWidth - 10 : context.tooltip.x + 10,
        };
    };

    if (!context.tooltip || !runningOnClient) {
        return null;
    }

    const isMobile = window.innerWidth < 768;

    return createPortal(
        isMobile ? (
            <div
                className="fixed h-fit z-50 w-fit rounded-lg bg-bg-surface border border-border-base p-3 pointer-events-none shadow-xl"
                style={{
                    top: context.tooltip.y,
                    left: context.tooltip.x + 20,
                }}
            >
                {children}
            </div>
        ) : (
            <div
                ref={tooltipRef}
                className="bg-bg-surface border border-border-base px-3.5 py-2 rounded-lg shadow-xl fixed z-50 text-sm pointer-events-none"
                style={getTooltipPosition()}
            >
                {children}
            </div>
        ),
        document.body
    );
});

TooltipContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export { ClientTooltip, TooltipTrigger, TooltipContent };
