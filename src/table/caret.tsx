import React from "react";

const DEFAULT_SRC: string = (function () {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <polyline points="10,70 50,30 90,70" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="10"/>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
})();

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
export default function Caret(props: CaretProps) {
    let { orientation, src, alt, style, ...passThrough } = props;

    orientation = orientation || "down";
    src = src || DEFAULT_SRC;
    alt = alt || `A caret pointing ${orientation}`;
    if (style === undefined) style = {};
    style.transform = `rotate(${ROTATIONS[orientation]}deg)`;

    return <img className="caret" src={src} alt={alt} style={style} {...passThrough} />;
}
