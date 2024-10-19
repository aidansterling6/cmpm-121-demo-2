import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

function AddHTMLElement(type: string): HTMLElement{
    const tmp = document.createElement(type);
    app.append(tmp);
    return tmp;
}

document.title = APP_NAME;
const header = AddHTMLElement("h1");
header.innerHTML = APP_NAME;
const canvas = AddHTMLElement("canvas");
canvas.id = "canvas";
canvas.style.width = "256px";
canvas.style.height = "256px";