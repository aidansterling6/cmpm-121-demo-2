import "./style.css";


const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;
interface Color {
    red: number;
    green: number;
    blue: number;
}
const color: Color = {red: 0, green: 0, blue:0};

// Divs to hold buttons, so as to keep them organized
const actionButtons = document.createElement("div");
const lineButtons = document.createElement("div");
const stickerButtons = document.createElement("div");

interface Button {
    type: string; 
    innerHTML: string | null;
    ClickFunction: (event: MouseEvent) => void;
    parent: HTMLElement;
}
const Buttons: Button[] = [
    {
        type: "button",
        innerHTML: "clear", 
        ClickFunction: () => {
            MarkBuffer.splice(0, MarkBuffer.length);
            RedoBuffer.splice(0, RedoBuffer.length);
            document.dispatchEvent(drawingChanged);
        },
        parent: actionButtons
    },
    {
        type: "button",
        innerHTML: "undo", 
        ClickFunction: () => {
            StackTopExchange(MarkBuffer, RedoBuffer);
            document.dispatchEvent(drawingChanged);
        },
        parent: actionButtons
    },
    {
        type: "button",
        innerHTML: "redo", 
        ClickFunction: () => {
            StackTopExchange(RedoBuffer, MarkBuffer);
            document.dispatchEvent(drawingChanged);
        }, 
        parent: actionButtons
    },
    {
        type: "button",
        innerHTML: "thin", 
        ClickFunction: () => {
            markType = "thin";
        },
        parent: lineButtons
    },
    {
        type: "button",
        innerHTML: "thick", 
        ClickFunction: () => {
            markType = "thick";
        },
        parent: lineButtons
    },
    {
        type: "button",
        innerHTML: "color", 
        ClickFunction: () => {
            const tmpRed: string | null = prompt("red", "0");
            if(tmpRed){
                color.red = Number(tmpRed);
            }
            const tmpGreen: string | null = prompt("green", "0");
            if(tmpGreen){
                color.green = Number(tmpGreen);
            }
            const tmpBlue: string | null = prompt("blue", "0");
            if(tmpBlue){
                color.blue = Number(tmpBlue);
            }
        },
        parent: lineButtons
    },
    {
        type: "button",
        innerHTML: "export", 
        ClickFunction: () => {
            const canvas = document.createElement("canvas");
            const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
            canvas.id = "export canvas";
            canvas.width = 1024;
            canvas.height = 1024;
            if(ctx !== null){
                ctx.reset();
                ctx.scale(4, 4);
                ctx.beginPath();
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.fillRect(-20, -20, 500, 500);
                ctx.fill();
        
                for(let i = 0; i < MarkBuffer.length; i++){
                    MarkBuffer[i].draw(ctx);
                }
            }
            const anchor = document.createElement("a");
            anchor.href = canvas.toDataURL("image/png");
            anchor.download = "sketchpad.png";
            anchor.click();
        },
        parent: actionButtons
    },
    {
        type: "button",
        innerHTML: "Add Sticker", 
        ClickFunction: () => {
            const tmp: string | null = prompt("enter an emoji", "");
            if(tmp !== null){
                addSticker(tmp);
            }
        },
        parent: stickerButtons
    }
];

type Sticker = string;
const Stickers: Sticker[] = ["🐉", "🌲", "🦦", "🌌"];
function addSticker(sticker: Sticker){
    AddHTMLButton({type: "button", parent: stickerButtons, innerHTML: sticker, ClickFunction: () => {
        markType = sticker;
    }});
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
AddHTMLElement("h1", app, APP_NAME);
const canvas = document.createElement("canvas");
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
app.append(canvas);
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;

AddHTMLElement("div", app);

app.append(actionButtons);
app.append(lineButtons);
app.append(stickerButtons);

for(const button of Buttons){
    AddHTMLButton(button);
}
for (const sticker of Stickers) {
    addSticker(sticker);
}

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
canvas.addEventListener("mouseup", () => {
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
    const tmp: Point[] = [];
    for(let i = 0; i < PointBuffer.length; i++){
        tmp.push({x: PointBuffer[i].x, y: PointBuffer[i].y});
    }
    const tmpCol: Color = {red: color.red, green: color.green, blue: color.blue};
    if(CurrentMarkType === "thin"){
        MarkBuffer[MarkBuffer.length - 1].draw = (ctx: CanvasRenderingContext2D) => {
            DrawLine(ctx, tmp, 1, tmpCol);
        };
    } else if(CurrentMarkType === "thick"){
        MarkBuffer[MarkBuffer.length - 1].draw = (ctx: CanvasRenderingContext2D) => {
            DrawLine(ctx, tmp, 4, tmpCol);
        };
    }
    else {
        const tmpTxt = String(CurrentMarkType);
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
    const tmpCol: Color = {red: color.red, green: color.green, blue: color.blue};
    if(markType === "thin"){
        Tool.draw = (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(" + tmpCol.red + ", " + tmpCol.green + ", " + tmpCol.blue + ")";
            ctx.strokeStyle = "rgb(" + tmpCol.red + ", " + tmpCol.green + ", " + tmpCol.blue + ")";
            ctx.ellipse(event.offsetX, event.offsetY, 0.5, 0.5, 0, 0, 360);
            ctx.fill();
        };
    } else if(markType === "thick"){
        Tool.draw = (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(" + tmpCol.red + ", " + tmpCol.green + ", " + tmpCol.blue + ")";
            ctx.strokeStyle = "rgb(" + tmpCol.red + ", " + tmpCol.green + ", " + tmpCol.blue + ")";
            ctx.ellipse(event.offsetX, event.offsetY, 2, 2, 0, 0, 360);
            ctx.fill();
        };
    }
    else {
        const tmpTxt = String(markType);
        Tool.draw = (ctx: CanvasRenderingContext2D) => {
            DrawText(ctx, tmpTxt, {x: event.offsetX, y: event.offsetY});
        };
    }
    document.dispatchEvent(ToolMoved);
}

function AddHTMLElement(type: string, parent: HTMLElement, innerHTML: string | null = null): HTMLElement{
    const tmp = document.createElement(type);
    parent.append(tmp);
    if(innerHTML !== null){
        tmp.innerHTML = innerHTML;
    }
    return tmp;
}
function AddHTMLButton(button: Button): HTMLElement{
    const tmp = AddHTMLElement(button.type, button.parent, button.innerHTML);
    tmp.addEventListener("click", button.ClickFunction);
    return tmp;
}
function StackTopExchange(buffer1: any[], buffer2: any[]){
    const tmp: any | undefined = buffer1.pop();
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
function DrawLine(ctx: CanvasRenderingContext2D, data: Point[], size: number, col: Color){
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.fillStyle = "rgb(" + col.red + ", " + col.green + ", " + col.blue + ")";
    ctx.strokeStyle = "rgb(" + col.red + ", " + col.green + ", " + col.blue + ")";
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
        ctx.beginPath();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.strokeStyle = "rgb(255, 0, 255)";
        ctx.fillRect(-20, -20, 500, 500);
        ctx.fill();
        
        for(let i = 0; i < MarkBuffer.length; i++){
            MarkBuffer[i].draw(ctx);
        }
        Tool.draw(ctx);
    }
}