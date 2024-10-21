import "./style.css";


const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

let markType: string = "thin";
let CurrentMarkType: string = "thin";
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
let PointBuffer: Point[] = [];
const MarkBuffer: Mark[] = [];
const RedoBuffer: Mark[] = [];

document.title = APP_NAME;
const header = AddHTMLElement("h1", APP_NAME);
const canvas = document.createElement("canvas");
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
app.append(canvas);
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;

AddHTMLElement("div");

AddHTMLButton("button", "clear", (event) => {
    MarkBuffer.splice(0, MarkBuffer.length);
    RedoBuffer.splice(0, RedoBuffer.length);
    document.dispatchEvent(drawingChanged);
});
AddHTMLButton("button", "undo", (event) => {
    StackTopExchange(MarkBuffer, RedoBuffer);
    document.dispatchEvent(drawingChanged);
});
AddHTMLButton("button", "redo", (event) => {
    StackTopExchange(RedoBuffer, MarkBuffer);
    document.dispatchEvent(drawingChanged);
});
AddHTMLButton("button", "thin", (event) => {
    markType = "thin";
});
AddHTMLButton("button", "thick", (event) => {
    markType = "thick";
});

const drawingChanged = new Event("drawing-changed");
document.addEventListener("drawing-changed", Redraw);

let bCreateNewLineSegment = true;
let mouseDown = false;
canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
});
canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
    bCreateNewLineSegment = true;
    PointBuffer.splice(0, PointBuffer.length);
});
canvas.addEventListener("mousemove", (event) => {
    if(mouseDown){
        if(bCreateNewLineSegment){
            MarkBuffer.push({display: (ctx: CanvasRenderingContext2D) => {}});
            CurrentMarkType = markType;
        }
        PointBuffer.push({x: event.offsetX, y: event.offsetY});
        let tmp: Point[] = [];
        for(let i = 0; i < PointBuffer.length; i++){
            tmp.push({x: PointBuffer[i].x, y: PointBuffer[i].y});
        }
        if(CurrentMarkType === "thin"){
            MarkBuffer[MarkBuffer.length - 1].display = (ctx: CanvasRenderingContext2D) => {
                DrawLine(ctx, tmp, 1);
            };
        } else if(CurrentMarkType === "thick"){
            MarkBuffer[MarkBuffer.length - 1].display = (ctx: CanvasRenderingContext2D) => {
                DrawLine(ctx, tmp, 4);
            };
        }
        RedoBuffer.splice(0, RedoBuffer.length);
        bCreateNewLineSegment = false;
        document.dispatchEvent(drawingChanged);
    }
});

function AddHTMLElement(type: string, innerHTML: string | null = null): HTMLElement{
    const tmp = document.createElement(type);
    app.append(tmp);
    if(innerHTML !== null){
        tmp.innerHTML = innerHTML;
    }
    return tmp;
}
function AddHTMLButton(type: string, innerHTML: string | null = null, ClickFunction: (event: MouseEvent) => void): HTMLElement{
    const tmp = AddHTMLElement(type, innerHTML);
    tmp.addEventListener("click", ClickFunction);
    return tmp;
}
function StackTopExchange(buffer1: any[], buffer2: any[]){
    let tmp: any | undefined = buffer1.pop();
    if(tmp !== undefined){
        buffer2.push(tmp);
    }
}

function DrawLine(ctx: CanvasRenderingContext2D, data: Point[], size: number){
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.beginPath();
    for(let i = 0; i < data.length; i++){
        if(i === 0){
            ctx.moveTo(data[i].x, data[i].y);
        }
        else{
            ctx.lineTo(data[i].x, data[i].y);
        }
    }
    ctx.stroke();
}

function Redraw(){
    if(ctx !== null){
        ctx.reset();
        for(let i = 0; i < MarkBuffer.length; i++){
            MarkBuffer[i].display(ctx);
        }
    }
}