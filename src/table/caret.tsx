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
    src?: string;
};

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
    const orientation = props.orientation || "down";
    const src = props.src || DEFAULT_SRC;
    return (
        <img
            className="caret"
            src={src}
            alt={`A caret pointing ${orientation}`}
            style={{ transform: `rotate(${ROTATIONS[orientation]}deg)` }}
        />
    );
}
