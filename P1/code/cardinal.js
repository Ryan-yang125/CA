const canvas = document.querySelector(".Mycanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

//
var points = [];
var Spline = [];
var line_colors = ["black","green", "red", "blue", "purple", "yellow", "orange"];
var color_index = 0;
var point_show = false;
//设置button
document.getElementById("PointsButton").addEventListener("click",ShowPoints);
document.getElementById("ClearButton").addEventListener("click",Clear);
document.getElementById("PathButton").addEventListener("click", CardinalGenerate);
document.getElementById("CarMove").addEventListener("click",CarMove);

//设置Tension滑块
var Tslider = document.getElementById("TensionRange");
var Toutput = document.getElementById("TensionShow");
Toutput.innerHTML = "Tension:" + Tslider.value / 100.0; 
Tslider.oninput = function() {
    Toutput.innerHTML = "Tension:" + this.value / 100.0;
    ctx.clearRect(0,0,width, height);
    Spline = [];
    CubicSpline(Gslider.value * 3, this.value / 100.0);
    if (point_show) ShowPoints();
}
//设置Grain滑块
var Gslider = document.getElementById("GrainRange");
var Goutput = document.getElementById("GrainShow");
Goutput.innerHTML = "Grain:" + Gslider.value; 
Gslider.oninput = function() {
    Goutput.innerHTML = "Grain:" + this.value;
    ctx.clearRect(0,0,width, height);
    Spline = [];
    CubicSpline(this.value * 3,Tslider.value / 100.0);
    if (point_show) ShowPoints();
}
// 设置速度滑块
var Sslider = document.getElementById("SpeedRange");
var Soutput = document.getElementById("SpeedShow");
Soutput.innerHTML = "Speed:" + Sslider.value; 
Sslider.oninput = function() {
    Soutput.innerHTML = "Speed:" + this.value;
}
//显示插值点
function ShowPoints() {
    point_show = true;
    for (var i = 0; i < Spline.length; i += 3) {
        DrawPoint(Spline[i][0], Spline[i][1]);
    }
}

//绘制黑色单个圆点
function DrawPoint(x, y) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(x-1,y-1,2,2);
}
//绘制红色单个粗圆点 
function DrawRedPoint(x, y) {
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.fillRect(x-2, y-2, 4, 4);
}
// 监听画布点击事件
canvas.addEventListener("click", function(event) {
    getMousePos(canvas, event);
});

// 获得鼠标位置并绘制单个圆点
function getMousePos(canvas, event) {
    //1
    var rect = canvas.getBoundingClientRect();
    //2
    var x = event.clientX - rect.left * (canvas.width / rect.width);
    var y = event.clientY - rect.top * (canvas.height / rect.height);
    var pos = [x,y];
    points.push(pos);
    DrawRedPoint(x,y);
    // console.log("x:"+x+",y:"+y);
}

//生成cardinal曲线
function CardinalGenerate() {
    ctx.clearRect(0,0,width,height);
    Spline = [];
    CubicSpline(document.getElementById("GrainRange").value*3, 
    document.getElementById("TensionRange").value/100.0);
}
//计算矩阵    
function GetCardinalMatrix (a1) {
    var m = new Array(16);
    m[0]=-a1; m[1]=2.0-a1; m[2]=a1-2.; m[3]=a1;                 
    m[4]=2.*a1; m[5]=a1-3.; m[8]=-a1; m[9]=0.;
    m[12]=0.; m[13]=1.; m[6]=3.-2*a1; m[7]=-a1;
    m[10]=a1; m[11]=0.; m[14]=0.; m[15]=0.;
    return m;
} 

//
function Matrix (p0, p1, p2, p3, u, m) { 
    //求解系数
    var a, b, c, d;
    a=m[0]*p0+m[1]*p1+m[2]*p2+m[3]*p3;    
    b=m[4]*p0+m[5]*p1+m[6]*p2+m[7]*p3; 
    c=m[8]*p0+m[9]*p1+m[10]*p2+m[11]*p3; 
    d=m[12]*p0+m[13]*p1+m[14]*p2+m[15]*p3; 
    return(d+u*(c+u*(b+u*a))); //au^3+bu^2+cu+d
}
//计算曲线控制点
function CubicSpline (grain, tension) {
    var jd = new Array(100);  //用户输入的控制点位置数组，临时变量存储
    var n0=points.length;   //控制点个数
    
    //添加起始点和终点
    for(var i=1; i<=n0; i++){
        　　jd[i] = points[i - 1];   //内部点
    }
    jd[0] = points[0];  //补上隐含的整条曲线起始点
    jd[n0+1] = points[n0-1];    //补上隐含的整条曲线终止点
    var knots = jd;
    
    //计算
    var alpha = new Array(50);
    var k0, kml, k1, k2;
        //获取Mc矩阵
    var m = GetCardinalMatrix(tension);
        //对每两个关键点之间的插值点进行参数化到0～1之间
    for(var i=0; i<grain; i++){
        alpha[i]=i*1.0/grain;
    }
    //从最开始的四个点开始，给第一段曲线插值
    kml = 0;
    k0 = 1;
    k1 = 2;
    k2 = 3;
        //两次循环第一次对输入的控制点遍历，第二次对每两个控制点之间插值，分别计算xy分量上得出的插值后的函数值，k值分别＋1
    for(var i =1; i<n0; i++){
        for(var j=0; j<grain; j++){
            var cpx = Matrix(knots[kml][0], knots[k0][0], knots[k1][0], knots[k2][0], alpha[j], m);
            var cpy = Matrix(knots[kml][1], knots[k0][1], knots[k1][1], knots[k2][1], alpha[j], m);
            Spline.push(new Array(cpx, cpy));
        }
        kml++; k0++; k1++; k2++;
    }
    DrawCardinal();
}
function DrawCardinal() {
    for (var point of points) {
        DrawRedPoint(point[0], point[1]);
    }
    ctx.beginPath();
    ctx.moveTo(Spline[0][0], Spline[0][1]);
    for (var i = 1; i < Spline.length; i++) {
        ctx.lineTo(Spline[i][0], Spline[i][1]);
    }
    // ctx.strokeStyle = line_colors[color_index++];
    // color_index = color_index < line_colors.length ? color_index : 0;
    ctx.stroke();
}
function LineCompute(n) {
    return (Spline[n+1][1] - Spline[n][1])/(Spline[n+1][0] - Spline[n][0]);
}
function CarMove() {
    var imgTag = new Image();
    var pos_now = 0;
    imgTag.onload = animate;
    imgTag.src = "https://s1.ax1x.com/2020/09/28/0VYJE9.md.png";   // load image
    var num = Math.ceil(document.getElementById("SpeedRange").value / 10);
    function animate() {
        ctx.clearRect(0, 0, width, height);  // clear canvas
        DrawCardinal();
        ctx.save();
        var x = Spline[pos_now][0];
        var y = Spline[pos_now][1];
        var w = 100;
        var h = 100;
        ctx.translate(x+w/2, y+h/2);
        ctx.rotate(LineCompute(pos_now)*20*Math.PI/180.0);
        ctx.translate(-x-w/2, -y-h/2);
        ctx.drawImage(imgTag, x-w/2, y-h/2, w, h);                   // draw image at current position
        ctx.restore();
        pos_now += num;//use point nums to control speed
        if (pos_now < Spline.length && Spline[pos_now][0] < width)
            requestAnimationFrame(animate);      // loop
    }
}


//清空画布和坐标数组
function Clear() {
    ctx.clearRect(0,0,width, height);
    points = [];
    Spline = [];
}