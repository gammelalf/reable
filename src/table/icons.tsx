import React from "react";

function genSrc(svg: string) {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
}

const CARET_SRC: string = genSrc(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <polyline points="10,70 50,30 90,70" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="10"/>
</svg>
`);

const GROUP_BY_SRC: string = genSrc(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="black">
    <rect x="0" y="5" width="90" height="10"/>
    <rect x="20" y="25" width="70" height="10"/>
    <rect x="20" y="45" width="70" height="10"/>
    <rect x="0" y="65" width="90" height="10"/>
    <rect x="20" y="85" width="70" height="10"/>
</svg>
`);

type CaretProps = {
    orientation?: "up" | "down" | "left" | "right";
} & React.HTMLProps<HTMLImageElement>;

const ROTATIONS = {
    up: 0,
    right: 90,
    down: 180,
    left: 270,
};

/**
 * A simple `<img />` showing a rotatable caret
 */
export function Caret(props: CaretProps) {
    let { orientation, src, alt, style, ...passThrough } = props;

    orientation = orientation || "down";
    src = src || CARET_SRC;
    alt = alt || `A caret pointing ${orientation}`;
    if (style === undefined) style = {};
    style.transform = `rotate(${ROTATIONS[orientation]}deg)`;

    return <img className="icon" src={src} alt={alt} style={style} {...passThrough} />;
}

function iconFactory(
    name: string,
    defaultProps: Partial<React.HTMLProps<HTMLImageElement>>
) {
    const component = function (props: React.HTMLProps<HTMLImageElement>) {
        return <img {...defaultProps} {...props} />;
    };
    component.displayName = name;
    return component;
}
export const GroupBy = iconFactory("GroupBy", {
    className: "icon",
    src: GROUP_BY_SRC,
    alt: "Toggle group tree view",
});
