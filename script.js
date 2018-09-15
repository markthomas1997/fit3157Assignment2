var canvas = document.querySelector( '#canvas' );
var context = canvas.getContext( '2d' );
var linePoints = [];

var toolMode = 'draw'
var toolSize = 5;
var strokeStyle = "#000000";

var initMouseX = 0;
var initMouseY = 0;
var newMouseX = 0;
var newMouseY = 0;

var undoButton = document.querySelector( '[data-action=undo]' );

var canvasState = [];

context.strokeStyle = "#000000";
context.lineWidth = 5;

canvas.addEventListener( 'mousedown', draw );
canvas.addEventListener( 'touchstart', draw );
window.addEventListener( 'mouseup', stop );
window.addEventListener( 'touchend', stop );

window.addEventListener( 'resize', resizeCanvas );

function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if(canvas.length) updateCanvas();
}

//resize canvas on load
resizeCanvas();

function draw( e ) {
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
  if ( e.which === 1 || e.type === 'touchstart' || e.type === 'touchmove') {
    window.addEventListener( 'mousemove', draw );
    window.addEventListener('touchmove', draw);
    mouseX = e.pageX - canvas.offsetLeft;
    mouseY = e.pageY - canvas.offsetTop;
    var mouseDrag = e.type === 'mousemove';
    if(toolMode != 'drawRect'){
        if(e.type === 'touchstart' || e.type === 'touchmove'){
        mouseX = e.touches[0].pageX - canvas.offsetLeft;
        mouseY = e.touches[0].pageY - canvas.offsetTop;
        mouseDrag = e.type === 'touchmove';
        }
        if ( e.type === 'mousedown' || e.type === 'touchstart' ) saveState();
        linePoints.push( { x: mouseX, y: mouseY, drag: mouseDrag, width: toolSize, color: strokeStyle } );
        updateCanvas();
    }
    else{
        if(e.type === 'touchstart'){
            saveState();
            initMouseX = e.touches[0].pageX - canvas.offsetLeft;
            initMouseY = e.touches[0].pageY - canvas.offsetTop;
            
        }
        if(e.type === 'touchmove'){
            //draw rectangle 
            context.clearRect( 0, 0, canvas.width, canvas.height );
            context.putImageData( canvasState[0], 0, 0 );
            //renderLine();
            
            newMouseX = e.touches[0].pageX - canvas.offsetLeft;
            newMouseY = e.touches[0].pageY - canvas.offsetTop;
            
            context.fillStyle = strokeStyle;
            context.fillRect(initMouseX,initMouseY,newMouseX-initMouseX,newMouseY-initMouseY);
        }
    }
  }
}

function drawSquare(initX, initY){
    canvas.addEventListener('touchmove')
}

function stop( e ) {
  if ( e.which === 1 || e.type === 'touchend') {
    window.removeEventListener('mousemove', draw);
    window.removeEventListener('touchmove', draw);
  }
}

function updateCanvas() {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    context.putImageData( canvasState[0], 0, 0 );
    renderLine();
}

function renderLine() {
  context.lineJoin = "round";
  context.lineCap = "round";
  for ( var i = 0, length = linePoints.length; i < length; i++ ) {
    if ( !linePoints[i].drag ) {
        //context.stroke();
        context.beginPath();
        context.lineWidth = linePoints[i].width;
        context.strokeStyle = linePoints[i].color;
        context.moveTo( linePoints[i].x, linePoints[i].y );
        context.lineTo( linePoints[i].x + 0.5, linePoints[i].y + 0.5 );
    } else {
        context.lineTo( linePoints[i].x, linePoints[i].y );
    }
  }
    if ( toolMode === 'erase' ) {
        context.globalCompositeOperation = 'destination-out';
    } else {
        context.globalCompositeOperation = 'source-over';
    }
  context.stroke();
}

document.querySelector('#tools').addEventListener('click', selectTool);
document.querySelector('#colors').addEventListener('click', selectStroke);

function selectTool(e){
    if ( e.target === e.currentTarget ) return;
    console.log(e);
    if ( !e.target.dataset.action ) {
        toolSize = e.target.dataset.size || toolSize;
        toolMode = e.target.dataset.mode || toolMode;
        highlightButton( e.target );
    }
    if ( e.target === undoButton ) undoState();
    if ( e.target.dataset.action == "delete" ) clearCanvas();
}

function selectStroke(e){
    if ( e.target === e.currentTarget ) return;
    console.log(e);

    strokeStyle = e.target.dataset.color || strokeStyle;
    highlightButton( e.target );
}

function highlightButton( button ) {
    var buttons = button.parentNode.querySelectorAll( 'img' );
    buttons.forEach( function( element ){ element.classList.remove('active') } );
    button.classList.add( 'active' );
}

function saveState() {
    undoButton.classList.remove( 'disabled' );
    canvasState.unshift( context.getImageData( 0, 0, canvas.width, canvas.height ) );
    if ( canvasState.length > 25 ) canvasState.length = 25;
    
    linePoints = [];
}

function undoState() {
    context.putImageData( canvasState.shift(), 0, 0 );
    if ( !canvasState.length ) undoButton.classList.add( 'disabled' );
}

function clearCanvas(){
    if(window.confirm("Are you sure you want to delete the drawing?")){
        context.clearRect( 0, 0, canvas.width, canvas.height );
        canvasState = [];
        if ( !canvasState.length ) undoButton.classList.add( 'disabled' );        
    }
}
