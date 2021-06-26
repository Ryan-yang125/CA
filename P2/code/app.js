const canvas = document.querySelector(".mycanvas");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);
const ctx = canvas.getContext("2d");

var points = []; //单个图形坐标数组

var graphs = []; //初始和结束图形数组

var startVec = []; //初始向量数组
var interVecs = []; //插值向量数组
var endVec = []; //结束向量数组
var interPoints = []; //插值点数组
var gifMode = false; //动画模式
document
  .getElementById("graphGenerate")
  .addEventListener("click", graphGenerate);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("clearPoints").addEventListener("click", clearPoints);
document
  .getElementById("linearPoint")
  .addEventListener("click", getlinearPoint);
document.getElementById("star").addEventListener("click", drawStar);
document.getElementById("pencil").addEventListener("click", drawPencil);
document.getElementById("clockwise").addEventListener("click", clockwise);
document
  .getElementById("anticlockwise")
  .addEventListener("click", anticlockwise);

var mode = document.getElementById("playMode");
mode.addEventListener("click", () => {
  gifMode = !gifMode;
  if (gifMode) mode.value = "动画模式";
  else mode.value = "图片模式";
});
//计算矢量线性插值
function calcVec() {
  //calc start Vec
  startVec = [];
  for (let i = 1; i < graphs[0].length; i++) {
    let dy = graphs[0][i][1] - graphs[0][i - 1][1];
    let dx = graphs[0][i][0] - graphs[0][i - 1][0];
    let r = calcLength(dy, dx); //计算x,y之间的距离r
    let a = Math.atan2(dy, dx); //反正切计算角度a
    startVec.push([r, a]);
  }
  endVec = [];
  //calc end Vec
  for (let i = 1; i < graphs[1].length; i++) {
    let dy = graphs[1][i][1] - graphs[1][i - 1][1];
    let dx = graphs[1][i][0] - graphs[1][i - 1][0];
    let r = calcLength(dy, dx);
    let a = Math.atan2(dy, dx);
    endVec.push([r, a]);
  }
}
//首尾连接向量
function connectVecs() {
  //connect the vecs and draw
  let num = interVecs.length;
  interPoints = [];
  for (let i = 1; i <= num; i++) {
    let t = i / num;
    points = [];
    let x = t * graphs[1][0][0] + (1 - t) * graphs[0][0][0];
    let y = t * graphs[1][0][1] + (1 - t) * graphs[0][0][1];
    points.push([x, y]);
    for (let j = 1; j <= interVecs[0].length; j++) {
      let x =
        points[j - 1][0] +
        interVecs[i - 1][j - 1][0] * Math.cos(interVecs[i - 1][j - 1][1]);
      let y =
        points[j - 1][1] +
        interVecs[i - 1][j - 1][0] * Math.sin(interVecs[i - 1][j - 1][1]);
      points.push([x, y]);
    }
    if (!gifMode) GraphGenerate();
    interPoints.push(points);
  }
  if (gifMode) gifMake();
}
//顺时针矢量线性插值
function clockwise() {
  //calc starVecs and endVecs
  calcVec();
  //calc interVecs
  let num = 6;
  interVecs = [];
  for (let i = 1; i <= num; i++) {
    let t = i / num;
    let interVec = [];
    for (let j = 0; j < startVec.length; j++) {
      let r = t * endVec[j][0] + (1 - t) * startVec[j][0];
      let a = t * endVec[j][1] + (1 - t) * startVec[j][1];
      if (endVec[j][1] - startVec[j][1] < 0) {
        a += t * 2 * Math.PI; //保证旋转后的角度始终大于初始角度
      }
      interVec.push([r, a]);
    }
    interVecs.push(interVec);
  }
  connectVecs();
}
//逆时针矢量插值
function anticlockwise() {
  //calc starVecs and endVecs
  calcVec();
  //calc interVecs
  let num = 6;
  interVecs = [];
  for (let i = 1; i <= num; i++) {
    let t = i / num;
    let interVec = [];
    for (let j = 0; j < startVec.length; j++) {
      let r = t * endVec[j][0] + (1 - t) * startVec[j][0];
      let a = t * endVec[j][1] + (1 - t) * startVec[j][1];
      if (endVec[j][1] - startVec[j][1] > 0) {
        a += (1 - t) * 2 * Math.PI;
      }
      interVec.push([r, a]);
    }
    interVecs.push(interVec);
  }
  connectVecs();
}
//生成动画
function gifMake() {
  let i = 0;
  let fps = 2;
  animate();
  function animate() {
    setTimeout(function () {
      ctx.clearRect(0, 0, width, height);
      points = interPoints[i];
      GraphGenerate();
      i++;
      if (i < interPoints.length) requestAnimationFrame(animate);
    }, 1000 / fps);
  }
}
//计算线性插值点
function getlinearPoint() {
  let num = 5;
  interPoints = [];
  for (let i = 1; i <= num; i++) {
    t = i / num;
    // console.log(t);
    points = [];
    for (let j = 0; j < graphs[0].length; j++) {
      let x = t * graphs[1][j][0] + (1 - t) * graphs[0][j][0];
      let y = t * graphs[1][j][1] + (1 - t) * graphs[0][j][1];
      points.push([x, y]);
    }
    if (!gifMode) GraphGenerate();
    interPoints.push(points);
  }
  if (gifMode) gifMake();
}
function calcLength(a, b) {
  return Math.sqrt(a * a + b * b);
}
//绘制基本图形⭐️
function drawStar() {
  //大⭐️
  points = [
    [0, 85],
    [75, 75],
    [100, 10],
    [125, 75],
    [200, 85],
    [150, 125],
    [160, 190],
    [100, 150],
    [40, 190],
    [50, 125],
    [0, 85],
  ];
  graphs.push(points);
  GraphGenerate();
  //小⭐️
  let tmp = [];
  for (let point of points) {
    tmp.push([point[0] * 0.5 + 500, point[1] * 0.5 + 100]);
  }
  graphs.push(tmp);
  points = tmp;
  GraphGenerate();
  points = [];
}
//绘制基本图形铅笔
function drawPencil() {
  //first
  points = [
    [160, 220],
    [160, 240],
    [230, 240],
    [230, 250],
    [260, 230],
    [230, 210],
    [230, 220],
  ];
  if (!graphs.length) graphs.push(points);
  GraphGenerate();
  points = [
    [530, 250],
    [550, 250],
    [550, 180],
    [560, 180],
    [540, 150],
    [520, 180],
    [530, 180],
  ];
  if (graphs.length == 1) graphs.push(points);
  GraphGenerate();
  points = [];
}
//绘制👋TODO
function drawHand() {
  let space = 30;
  points = [
    [500, 500],
    [500 - 2 * space, 500 + 0.5 * space],
    [500 - 3 * space, 500 - 0.5 * space],
    [500 - 3.5 * space, 500 - 4.5 * space],
    [500 - 4 * space, 500 - 5.5 * space],
    [500 - 4 * space, 500 - 7.5 * space],
    [500 - 3.7 * space, 500 - 6 * space],
    [500 - 3.3 * space, 500 - 8 * space],
    [500 - 3 * space, 500 - 6 * space],
    [500 - 2.7 * space, 500 - 8.5 * space],
    [500 - 2.3 * space, 500 - 6 * space],
    [500 - 2 * space, 500 - 8 * space],
    [500 - 2 * space, 500 - 5.5 * space],
    [500 - space, 500 - 6.5 * space],
    [500 - 1.5 * space, 500 - 5 * space],
    [500 - 2 * space, 500 - 4.5 * space],
    [500 - 1.5 * space, 500 - space],
    [500, 500 - space],
  ];
  graphs.push(points);
  GraphGenerate();
  points = [[]];
}
//
function graphGenerate() {
  graphs.push(points);
  GraphGenerate();
  points = [];
}
//生成几何图形
function GraphGenerate() {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.lineTo(points[0][0], points[0][1]);
  ctx.stroke();
}
//监听画布点击事件
canvas.addEventListener("click", function (event) {
  getMousePositon(canvas, event);
});
//获取点击坐标并画点
function getMousePositon(canvas, event) {
  //1
  var rect = canvas.getBoundingClientRect();
  //2
  var x = event.clientX - rect.left * (canvas.width / rect.width);
  var y = event.clientY - rect.top * (canvas.height / rect.height);
  points.push([x, y]);
  DrawPoint(x, y);
  console.log("x:" + x + ",y:" + y);
}
//画单个点
function DrawPoint(x, y) {
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(x - 2, y - 2, 4, 4);
}
//画单个圆点
function drawRedPoint(x, y) {
  ctx.fillStyle = "rgb(255,0,0)";
  ctx.arc(x - 1, y - 1, 2, 0, 2 * Math.PI);
  ctx.fill();
}
//清空画布
function clearAll() {
  ctx.clearRect(0, 0, width, height);
  points = [];
}
//清空画布和坐标
function clearPoints() {
  ctx.clearRect(0, 0, width, height);
  points = [];
  graphs = [];
  startVec = [];
  endVec = [];
  interVecs = [];
  interPoints = [];
}
