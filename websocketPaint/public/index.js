function PaintView() {
    this.canvasElement = document.getElementById('canvas');
    this.ctx = this.canvasElement.getContext('2d');
    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = '#000000';
}

PaintView.prototype.drawLine = function (x, y) {
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
};

PaintView.prototype.setLineWidth = function (value) {
    this.ctx.lineWidth = value;
};

PaintView.prototype.setStrokeStyle = function (value) {
    this.ctx.strokeStyle = value;
};

PaintView.prototype.reset = function () {
    this.ctx.beginPath();
};

PaintView.prototype.clearAll = function () {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
};

PaintView.prototype.drawByCoords = function (data) {
    const {lineWidth, strokeStyle, path} = data;
    this.setLineWidth(lineWidth);
    this.setStrokeStyle(strokeStyle);

    for (let i = 0; i < path.length - 1; i += 2) {
        this.drawLine(path[i], path[i + 1]);
    }

    this.reset();
};

function App() {
    this.veiw = new PaintView();
    this.isDrawing = false;
    this.widthInput = document.getElementById('range');
    this.styleInput = document.getElementById('color');
    this.clearButton = document.getElementById('clear');
    this.data = {
        lineWidth: '',
        strokeStyle: '',
        path: []
    }
}

App.prototype.init = function () {
    this.widthInput.addEventListener('change', event => {
        this.veiw.setLineWidth(+event.target.value);
    });

    this.styleInput.addEventListener('change', event => {
        this.veiw.setStrokeStyle(event.target.value);
    });

    this.clearButton.addEventListener('click', () => {
        this.veiw.clearAll();

        sendMessage({
            cmd: 'clear',
            payload: this.data
        })
    });

    this.veiw.canvasElement.addEventListener('mousedown', event => {
        this.isDrawing = true;
        this.veiw.ctx.lineWidth = this.widthInput.value;
        this.veiw.ctx.strokeStyle = this.styleInput.value;
        const {layerX, layerY} = event;
        this.startAddingData(layerX, layerY);

    });

    this.veiw.canvasElement.addEventListener('mousemove', event => {
        if (this.isDrawing) {
            const {layerX, layerY} = event;
            this.sendPath(layerX, layerY);
        }
    });

    document.addEventListener('mouseup', () => {
        this.veiw.reset();
        this.isDrawing = false;

        this.data = {
            lineWidth: '',
            strokeStyle: '',
            path: []
        }
    });

    this.veiw.canvasElement.addEventListener('mouseleave', () => {
        this.isDrawing = false;
        this.veiw.reset();
    });
};

App.prototype.startAddingData = function (x, y) {
    this.data.lineWidth = this.veiw.ctx.lineWidth;
    this.data.strokeStyle = this.veiw.ctx.strokeStyle;
    this.data.path.push(x, y);
    sendMessage({
        cmd: 'startLine',
        payload: this.data
    });

    this.veiw.reset();
};

App.prototype.sendPath = function (x, y) {
    this.data.path.push(x, y);
    sendMessage({
        cmd: 'sendPath',
        payload: {x: x, y: y}
    });
};

const handleMessage = jsonMessage => {
    let message = JSON.parse(jsonMessage);
    const { payload } = message;
    if (payload && payload.length) {
        payload.forEach(data => {
            app.veiw.drawByCoords(data);
        });
    }
};

const ws = new WebSocket('ws://localhost:3000/ws');

const sendMessage = (data) => {
    ws.send(JSON.stringify(data));
};

ws.onopen = () => {
    console.log('onopen');
};

ws.onmessage = message => {
    handleMessage(message.data);
};

ws.onclose = () => {
    console.log('onclose');
};

const app = new App;
app.init();
