const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

let lastTime = 0;
let dropCounter = 0;
let drawInterval = 300;
let permitRotateCounter = 0;
let dropCounterInterval = 100;

context.scale(20,20);

function arenaSweep(){
    outher: for (let y = arena.length - 1; y > 0 ; --y) {
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] === 0){
                continue outher;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
    }
}


function colide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    console.log(player.matrix)
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x) {
            if(m[y][x] !== 0 && 
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0 ){
                    return true;
            }
        }    
    }
    return false;
}

function createPice(type){
    switch(type){
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        break;
        case 'O':
            return [
                [2, 2],
                [2, 2],
            ];
        break;
        case 'L':
            return [
                [0, 0, 3],
                [3, 3, 3],
                [0, 0, 0],
            ];
        break;
        case 'J':
            return [
                [4, 0, 0],
                [4, 4, 4],
                [0, 0, 0],
            ];
        break;
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],                
            ];
        break;                        
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],                
            ];
        break;             
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],                
            ];
        break;             
    }
}

const colors = [
    null,
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink'
]
function createMatrix(w, h){
    const matrix = [];
    while(h--){
         matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function merge(arena, player){
    player.matrix.forEach((row, y) =>{
        row.forEach((value, x) =>{
            if(value !== 0){
                arena[y+player.pos.y][x+ player.pos.x] = value;
            }
        })
    })
}

function draw(){
    context.fillStyle = '#000';
    context.fillRect(0,0,canvas.width, canvas.height);
    
    drawMatrix(arena, {x:0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y+ offset.y, 1, 1);
            }
        });
    });
}

function playerReset(){
    const pices = 'ILJOTSZ';
    let x = pices[pices.length * Math.random() | 0];
    console.log(x)
    player.matrix = createPice(x);
    console.log(player.matrix);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if(colide(arena, player)){
        arena.forEach(row => {
            row.fill(0);
        })
    }
}

const player = {
    pos:  {x:4, y:0},
    matrix: createPice('T')
}

function playerDrop(){
    player.pos.y++;
    if(colide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0; 
}

function playerMove(dir){
    player.pos.x += dir;
    if(colide(arena, player)){
        player.pos.x -= dir
    }

}


function playerRorate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);    
    while(colide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix -dir);
            player.pos.x = pos; 
            return;
        }
    }
}

function rotate(matrix, dir){
    for(let y = 0; y < matrix.length; ++y){
        for(let x = 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x]         
            ] = 
            [
                matrix[y][x],
                matrix[x][y]    
            ];
        }
    }

    if(dir > 0){
        matrix.forEach(row => row.reverse());
    }else{
        matrix.reverse();
    }

}

function update(time = 0){
    const deltaTime = time - lastTime;
    lastTime = time;

    permitRotateCounter += deltaTime; 
    dropCounter += deltaTime;
    if(dropCounter >= drawInterval){
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
document.addEventListener("keydown", event=>{
    console.log(event.keyCode);
    if(event.keyCode === 37){
        playerMove(-1); 
    }else if(event.keyCode === 39){
        playerMove(1);
    }else if(event.keyCode === 40){
        playerDrop();
    }
    if(event.keyCode == 32 && permitRotateCounter >= dropCounterInterval){
        playerRorate(-1);
        permitRotateCounter = 0;
    }
})

update();