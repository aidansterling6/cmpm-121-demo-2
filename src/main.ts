import "./style.css";


const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

interface Button {
    type: string; 
    innerHTML: string | null;
    ClickFunction: (event: MouseEvent) => void;
}
let Buttons: Button[] = [
    {
        type: "button",
        innerHTML: "clear", 
        ClickFunction: (event) => {
            MarkBuffer.splice(0, MarkBuffer.length);
            RedoBuffer.splice(0, RedoBuffer.length);
            document.dispatchEvent(drawingChanged);
        }
    },
    {
        type: "button",
        innerHTML: "undo", 
        ClickFunction: (event) => {
            StackTopExchange(MarkBuffer, RedoBuffer);
            document.dispatchEvent(drawingChanged);
        }
    },
    {
        type: "button",
        innerHTML: "redo", 
        ClickFunction: (event) => {
            StackTopExchange(RedoBuffer, MarkBuffer);
            document.dispatchEvent(drawingChanged);
        }
    },
    {
        type: "button",
        innerHTML: "thin", 
        ClickFunction: (event) => {
            markType = "thin";
        }
    },
    {
        type: "button",
        innerHTML: "thick", 
        ClickFunction: (event) => {
            markType = "thick";
        }
    },
    {
        type: "button",
        innerHTML: "export", 
        ClickFunction: (event) => {
            const canvas = document.createElement("canvas");
            const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
            canvas.id = "export canvas";
            canvas.width = 1024;
            canvas.height = 1024;
            if(ctx !== null){
                ctx.reset();
                ctx.scale(4, 4);
                for(let i = 0; i < MarkBuffer.length; i++){
                    MarkBuffer[i].draw(ctx);
                }
            }
            const anchor = document.createElement("a");
            anchor.href = canvas.toDataURL("image/png");
            anchor.download = "sketchpad.png";
            anchor.click();
        }
    },
    {
        type: "button",
        innerHTML: "Add Sticker", 
        ClickFunction: (event) => {
            let tmp: string | null = prompt("enter an emoji", "");
            if(tmp !== null){
                Stickers.push({txt: tmp, bAdded: false});
                updateStickerButtons();
            }
        }
    }
];

interface Sticker {
    txt: string;
    bAdded: boolean;
}

let Stickers: Sticker[] = [
    {txt: "😀", bAdded: false},
    {txt: "😶", bAdded: false},
    {txt: "🙃", bAdded: false},
];
function addSticker(sticker: Sticker){
    AddHTMLButton({type: "button", innerHTML: sticker.txt, ClickFunction: (event) => {
        markType = sticker.txt;
    }});
    sticker.bAdded = true;
}
function updateStickerButtons(){
    for(const sticker of Stickers){
        if(!sticker.bAdded){
            addSticker(sticker);
        }
    }
}

let markType: string = "thin";
let CurrentMarkType: string = "thin";
interface Mark
{
    draw: (ctx: CanvasRenderingContext2D) => void;
}
interface Point
{
    x: number;
    y: number;
}
const PointBuffer: Point[] = [];
const Tool: Mark = {draw: (ctx: CanvasRenderingContext2D) => {}};
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

for(const button of Buttons){
    AddHTMLButton(button);
}
updateStickerButtons();

let EventParameter: MouseEvent;
const drawingChanged = new Event("drawing-changed");
document.addEventListener("drawing-changed", Redraw);

const ToolMoved = new Event("tool-moved");
document.addEventListener("tool-moved", Redraw);

let bCreateNewLineSegment = true;
let mouseDown = false;
canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    Draw(event);
});
canvas.addEventListener("mouseup", (event) => {
    mouseDown = false;
    bCreateNewLineSegment = true;
    PointBuffer.splice(0, PointBuffer.length);
});
canvas.addEventListener("mousemove", (event) => {
    if(mouseDown){
        Draw(event);
    }
    else{
        DrawTool(event);
    }
});

function Draw(event: MouseEvent){
    if(bCreateNewLineSegment){
        MarkBuffer.push({draw: (ctx: CanvasRenderingContext2D) => {}});
        CurrentMarkType = markType;
    }
    PointBuffer.push({x: event.offsetX, y: event.offsetY});
    let tmp: Point[] = [];
    for(let i = 0; i < PointBuffer.length; i++){
        tmp.push({x: PointBuffer[i].x, y: PointBuffer[i].y});
    }
    if(CurrentMarkType === "thin"){
        MarkBuffer[MarkBuffer.length - 1].draw = (ctx: CanvasRenderingContext2D) => {
            DrawLine(ctx, tmp, 1);
        };
    } else if(CurrentMarkType === "thick"){
        MarkBuffer[MarkBuffer.length - 1].draw = (ctx: CanvasRenderingContext2D) => {
            DrawLine(ctx, tmp, 4);
        };
    }
    else {
        let tmpTxt = String(CurrentMarkType);
        MarkBuffer[MarkBuffer.length - 1].draw = (ctx: CanvasRenderingContext2D) => {
            DrawText(ctx, tmpTxt, {x: event.offsetX, y: event.offsetY});
        };
    }
    RedoBuffer.splice(0, RedoBuffer.length);
    bCreateNewLineSegment = false;
    Tool.draw = (ctx: CanvasRenderingContext2D) => {};
    document.dispatchEvent(drawingChanged);
}
function DrawTool(event: MouseEvent){
    if(markType === "thin"){
        Tool.draw = (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.ellipse(event.offsetX, event.offsetY, 0.5, 0.5, 0, 0, 360);
            ctx.fill();
        };
    } else if(markType === "thick"){
        Tool.draw = (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.ellipse(event.offsetX, event.offsetY, 2, 2, 0, 0, 360);
            ctx.fill();
        };
    }
    else {
        let tmpTxt = String(markType);
        Tool.draw = (ctx: CanvasRenderingContext2D) => {
            DrawText(ctx, tmpTxt, {x: event.offsetX, y: event.offsetY});
        };
    }
    document.dispatchEvent(ToolMoved);
}

function AddHTMLElement(type: string, innerHTML: string | null = null): HTMLElement{
    const tmp = document.createElement(type);
    app.append(tmp);
    if(innerHTML !== null){
        tmp.innerHTML = innerHTML;
    }
    return tmp;
}
function AddHTMLButton(button: Button): HTMLElement{
    const tmp = AddHTMLElement(button.type, button.innerHTML);
    tmp.addEventListener("click", button.ClickFunction);
    return tmp;
}
function StackTopExchange(buffer1: any[], buffer2: any[]){
    let tmp: any | undefined = buffer1.pop();
    if(tmp !== undefined){
        buffer2.push(tmp);
    }
}
function DrawText(ctx: CanvasRenderingContext2D, txt: string, pos: Point){
    ctx.save();
    ctx.beginPath();
    ctx.translate(pos.x, pos.y + 9);
    ctx.scale(3.0, 3.0);
    ctx.translate(-pos.x, -pos.y - 9);
    ctx.textAlign = "center";
    ctx.fillText(txt, pos.x, pos.y + 9);
    ctx.fill();
    ctx.resetTransform();
    ctx.restore();
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
            MarkBuffer[i].draw(ctx);
        }
        Tool.draw(ctx);
    }
}