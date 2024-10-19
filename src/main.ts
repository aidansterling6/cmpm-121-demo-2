import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

function AddHTMLElement(type: string, innerHTML: string | null = null): HTMLElement{
    const tmp = document.createElement(type);
    app.append(tmp);
    if(innerHTML !== null){
        tmp.innerHTML = innerHTML;
    }
    return tmp;
}

document.title = APP_NAME;
const header = AddHTMLElement("h1", APP_NAME);
const canvas = document.createElement("canvas");
app.append(canvas);
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
const clearButton = AddHTMLElement("button", "clear");
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
let lastx = 0;
let lasty = 0;
let mouseDown = false;
canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
});
canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
});
canvas.addEventListener("mousemove", (event) => {
    if(ctx !== null && mouseDown){
        DrawLine(ctx, lastx, lasty, event.offsetX, event.offsetY);
    }
    lastx = event.offsetX;
    lasty = event.offsetY;
});
clearButton.addEventListener("click", (event) => {
    if(ctx !== null){
        ctx.reset();
    }
});

function DrawLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number){
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}