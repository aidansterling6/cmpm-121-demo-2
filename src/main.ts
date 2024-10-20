import "./style.css";


const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;
interface Point
{
    x: number;
    y: number;
}
const PointBuffer: Point[][] = [[]];
const RedoBuffer: Point[][] = [];

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

let bJumpTo = false;
let mouseDown = false;
canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
});
canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
    bJumpTo = true;
});
canvas.addEventListener("mousemove", (event) => {
    if(mouseDown){
        if(bJumpTo){
            PointBuffer.push([]);
        }
        PointBuffer[PointBuffer.length - 1].push({x:event.offsetX, y:event.offsetY});
        RedoBuffer.splice(0, RedoBuffer.length);
        bJumpTo = false;
        document.dispatchEvent(drawingChanged);
    }
});
clearButton.addEventListener("click", (event) => {
    PointBuffer.splice(0, PointBuffer.length);
    RedoBuffer.splice(0, RedoBuffer.length);
    document.dispatchEvent(drawingChanged);
});
undoButton.addEventListener("click", (event) => {
    StackTopExchange(PointBuffer, RedoBuffer);
    document.dispatchEvent(drawingChanged);
});
redoButton.addEventListener("click", (event) => {
    StackTopExchange(RedoBuffer, PointBuffer);
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
function Redraw(){
    if(ctx !== null){
        ctx.reset();
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i = 0; i < PointBuffer.length; i++){
            for(let o = 0; o < PointBuffer[i].length; o++){
                if(o === 0){
                    ctx.moveTo(PointBuffer[i][o].x, PointBuffer[i][o].y);
                }
                else{
                    ctx.lineTo(PointBuffer[i][o].x, PointBuffer[i][o].y);
                }
            }
        }
        ctx.stroke();
    }
    console.log(PointBuffer);
}