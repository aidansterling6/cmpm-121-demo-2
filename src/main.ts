import "./style.css";


const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

interface Mark
{
    display: (ctx: CanvasRenderingContext2D) => void;
}
interface Point
{
    x: number;
    y: number;
}
let lastMousePos: Point | undefined;
const MarkBuffer: Mark[][] = [[]];
const RedoBuffer: Mark[][] = [];

document.title = APP_NAME;
const header = AddHTMLElement("h1", APP_NAME);
const canvas = document.createElement("canvas");
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
app.append(canvas);
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;

AddHTMLElement("div");

const clearButton = AddHTMLElement("button", "clear");
const undoButton = AddHTMLElement("button", "undo");
const redoButton = AddHTMLElement("button", "redo");

const drawingChanged = new Event("drawing-changed");
document.addEventListener("drawing-changed", Redraw);

let bCreateNewLineSegment = false;
let mouseDown = false;
canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
});
canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
    bCreateNewLineSegment = true;
});
canvas.addEventListener("mousemove", (event) => {
    if(mouseDown && lastMousePos !== undefined){
        if(bCreateNewLineSegment){
            MarkBuffer.push([]);
        }
        let tmpMousePos = {x: lastMousePos.x, y: lastMousePos.y};
        MarkBuffer[MarkBuffer.length - 1].push({display: (ctx: CanvasRenderingContext2D) => {
            DrawLine(ctx, tmpMousePos.x, tmpMousePos.y, event.offsetX, event.offsetY);
        }});
        RedoBuffer.splice(0, RedoBuffer.length);
        bCreateNewLineSegment = false;
        document.dispatchEvent(drawingChanged);
    }
    lastMousePos = {x:event.offsetX, y:event.offsetY};
});
clearButton.addEventListener("click", (event) => {
    MarkBuffer.splice(0, MarkBuffer.length);
    RedoBuffer.splice(0, RedoBuffer.length);
    document.dispatchEvent(drawingChanged);
});
undoButton.addEventListener("click", (event) => {
    StackTopExchange(MarkBuffer, RedoBuffer);
    document.dispatchEvent(drawingChanged);
});
redoButton.addEventListener("click", (event) => {
    StackTopExchange(RedoBuffer, MarkBuffer);
    document.dispatchEvent(drawingChanged);
});

function AddHTMLElement(type: string, innerHTML: string | null = null): HTMLElement{
    const tmp = document.createElement(type);
    app.append(tmp);
    if(innerHTML !== null){
        tmp.innerHTML = innerHTML;
    }
    return tmp;
}
function StackTopExchange(buffer1: any[][], buffer2: any[][]){
    let tmp: any[] | undefined = buffer1.pop();
    if(tmp !== undefined){
        buffer2.push(tmp);
    }
}

function DrawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number){
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function Redraw(){
    if(ctx !== null){
        ctx.reset();
        for(let i = 0; i < MarkBuffer.length; i++){
            for(let o = 0; o < MarkBuffer[i].length; o++){
                MarkBuffer[i][o].display(ctx);
            }
        }
    }
    console.log(MarkBuffer);
}