const container = document.getElementById("container");

let board = [
    [false, false, false, false, true],
    [false, false, false, false, false],
    [false, false, false, false, true],
    [false, false, false, false, false],
    [true, false, true, false, false],
];

const generateBoard = () => {
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            Math.floor(Math.random() * 3) == 1 ? board[x][y] = true : board[x][y] = false;
        }
    }
}
// generateBoard();

let jugadas = [];

let banderitas = [];

const showBoard = (board) => {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board.length; y++) {
            let button = document.createElement("button");
            button.classList.add("board__cell");
            button.id = `${x}${y}`;
            container.appendChild(button);
        }
    }
}

const completeBoard = () => {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board.length; y++) {
            if (board[x][y] == true) {
                let cell = document.getElementById(`${x}${y}`);
                cell.classList.add("lose__cell");
                cell.innerText = minasAdyacentes(board, [x, y]);
            } else {
                let cell = document.getElementById(`${x}${y}`);
                jugarPlus(board, banderitas, [x, y], jugadas);
                cell.innerText = minasAdyacentes(board, [x, y]);
                cell.classList.remove("recommend");
                cell.classList.remove("flag");
            }
        }
    }
}

const showLose = () => {
    let h2 = document.getElementById("lose");
    h2.style.display = "block";
}
const showWin = () => {
    let h2 = document.getElementById("win");
    h2.style.display = "block";
}

const reset = () => {
    jugadas = [];
    banderitas = [];
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board.length; y++) {
            let cell = document.getElementById(`${x}${y}`);
            cell.innerText = '';
            cell.classList.remove("lose__cell");
            cell.classList.remove("recommend");
            cell.classList.remove("flag");
            let lose = document.getElementById("lose");
            lose.style.display = "none";
            let win = document.getElementById("win");
            win.style.display = "none";
        }
    }
    generateBoard();
}

showBoard(board);

document.addEventListener("click", e => {
    if (e.target.matches("button.board__cell")) {
        let pos = [parseInt(e.target.id[0]), parseInt(e.target.id[1])];
        if(!posicionEnBanderitas(pos, banderitas)){
            jugarPlus(board, banderitas, pos, jugadas);
        }
        for (let jugada of jugadas) {
            let button = document.getElementById(`${jugada[0][0]}${jugada[0][1]}`);
            button.innerText = minasAdyacentes(board, jugada[0]);
        }
        if (gano(board, jugadas)) {
            showWin();
        }
        if (perdio(board, jugadas)) {
            completeBoard();
            showLose();
        }
        sugerirAutomatico121(board, banderitas, jugadas);
    }
    if (e.target.matches("button.reset")) reset();
    if (e.target.matches("button.recommend")) e.target.classList.remove("recommend");
})

document.addEventListener('contextmenu', e => {
    e.preventDefault();
    if(e.target.matches('button.board__cell')){
        cambiarBanderita(board, jugadas, [e.target.id[0], e.target.id[1]], banderitas);
    }
    return false;
}, false);


const minasAdyacentes = (t, p) => {
    let minas = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (posicionValida([p[0] + i, p[1] + j], t.length) && (i != 0 || j != 0)) {
                if (t[p[0] + i][p[1] + j]) minas++;
            }
        }
    }

    return minas;
}

const cambiarBanderita = (t, j, p, b) => {
    let cell = document.getElementById(`${p[0]}${p[1]}`);
    let banderitaYaEstaba = false;

    for (let i = 0; i < b.length; i++) {
        if (b[i][0] == p[0] && b[i][1] == p[1]) {
            banderitaYaEstaba = true;
            // b.erase(b.begin() + i);
            banderitas = b.filter(pos => pos[0] != p[0] && pos[1] != p[1]);
            cell.classList.remove("flag");
            console.log(banderitas);
        }
    }

    if (!banderitaYaEstaba) {
        b.push(p);
        cell.classList.add("flag");
    }
    

}

const perdio = (t, j) => {
    let res = false;
    let posicionActual;

    // Iteramos sobre la lista de jugadas: O(j)
    for (let i = 0; i < j.length; i++) {
        posicionActual = j[i][0];
        if (t[posicionActual[0]][posicionActual[1]] == true) {
            res = true;
        }
    }
    return res;
}

const gano = (t, j) => {
    let res = false;
    let cantidadMinas = 0;
    // Iteramos sobre cada fila y por cada fila iteramos sobre cada columna del tablero: O(t²)
    for (let i = 0; i < t.length; i++) {
        for (let j = 0; j < t.length; j++) {
            if (t[i][j]) cantidadMinas++;
        }
    }

    let pisamosMinas = false;
    let posicionActual;
    // Iteramos sobre la lista de jugadas: O(j)
    for (let k = 0; k < j.length; k++) {
        posicionActual = j[k][0];
        if (t[posicionActual[0]][posicionActual[1]]) pisamosMinas = true;
    }

    if (!pisamosMinas && j.length == t.length * t.length - cantidadMinas) {
        res = true;
    } else {
        res = false;
    }
    return res;
}

const jugarPlus = (t, b, p, j) => {
    if (minasAdyacentes(t, p) > 0 || t[p[0]][p[1]]) {
        // la posicion jugada es una mina o tiene minas adyacentes
        j.push([p, minasAdyacentes(t, p)]);
    } else {
        // la posicion jugada no tiene minas adyacentes y no es una mina
        let posicionesARecorrer = [p];
        let posicionActual;

        while (posicionesARecorrer.length > 0) {

            posicionActual = posicionesARecorrer[0];
            posicionesARecorrer.shift();
            j.push([posicionActual, minasAdyacentes(t, posicionActual)]);
            if (minasAdyacentes(t, posicionActual) == 0) {
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        let adyacente = [posicionActual[0] + x, posicionActual[1] + y];
                        if (posicionValida(adyacente, t.length) && (x != 0 || y != 0)) {
                            if (adyacenteValido(adyacente, j, b, posicionesARecorrer)) {
                                posicionesARecorrer.push(adyacente);
                            }
                        }
                    }
                }
            }
        }
    }
    
}

const sugerirAutomatico121 = (t, b, j) => {
    // buscamos 121Horizontal
    let hay = false;
    let p = [0, 0];
    for (let x = 0; x < t.length; x++) {
        for (let y = 1; y < t.length - 1; y++) {
            if (!hay && jugadaEnJugadas([[x, y - 1], 1], j) && jugadaEnJugadas([[x, y], 2], j) && jugadaEnJugadas([[x, y + 1], 1], j)){
                if(sePuedeJugar([x - 1, y], t, j, b) == true) {
                    hay = true;
                    p = [x - 1, y];
                } else if(sePuedeJugar([x + 1, y], t, j, b) == true) {
                    hay = true;
                    p = [x + 1, y];
                }
            }
        }
    }
    for (let y = 0; y < t.length; y++) {
        for (let x = 1; x < t.length - 1; x++) {
            if (!hay && jugadaEnJugadas([[x - 1, y], 1], j) && jugadaEnJugadas([[x, y], 2], j) && jugadaEnJugadas([[x + 1, y], 1], j)){
                if (sePuedeJugar([x, y - 1], t, j, b) == true) {
                    hay = true;
                    p = [x, y - 1];
                } 
                if (sePuedeJugar([x, y + 1], t, j, b) == true) {
                    hay = true;
                    p = [x, y + 1];
                }
            }
        }
    }
    if (!hay) {
        p = [0, 0];
    } else {
        let recommend = document.getElementById(`${p[0]}${p[1]}`);
        recommend.classList.add("recommend");
    }
    return hay;
}

const posicionValida = (p, n) => {
    return p[0] < n && p[1] < n && p[0] >= 0 && p[1] >= 0;
}

const adyacenteValido = (adyacente, j, b, lista) => {
    let estaEnJugadas = false;
    let estaEnBanderitas = false;
    let estaEnLaLista = false;

    // vemos si esta en el listado de jugadas
    for (let i = 0; i < j.length; i++) {

        if (j[i][0][0] == adyacente[0] && j[i][0][1] == adyacente[1]) estaEnJugadas = true;

    }

    // vemos si esta en el listado de banderitas
    for (let i = 0; i < b.length; i++) {
        if (b[i][0] == adyacente[0] && b[i][1] == adyacente[1]) estaEnBanderitas = true;
    }

    // vemos si esta en el listado de posiciones a recorrer actual
    for (let i = 0; i < lista.length; i++) {
        if (lista[i][0] == adyacente[0] && lista[i][1] == adyacente[1]) estaEnLaLista = true;
    }

    return (!estaEnJugadas && !estaEnBanderitas && !estaEnLaLista);
}

const jugadaEnJugadas = (jugada, j) => {
    let esta = false;
    for (let i = 0; i < j.length; i++) {
        if (j[i][0][0] == jugada[0][0] && j[i][0][1] == jugada[0][1] && j[i][1] == jugada[1]) esta = true;
    }
    return esta;
}

const posicionEnJugadas = (posicion, j) => {
    let esta = false;
    for (let i = 0; i < j.length; i++) {
        if (j[i][0][0] == posicion[0] && j[i][0][1] == posicion[1]) esta = true;
    }
    return esta;
}

const posicionEnBanderitas = (posicion, b) => {
    let esta = false;
    for (let i = 0; i < b.length; i++) {
        if (b[i][0] == posicion[0] && b[i][1] == posicion[1]) esta = true;
    }
    return esta;
}

const sePuedeJugar = (posicion, t, j, b) => {
    return posicionValida(posicion, t.length) && !posicionEnJugadas(posicion, j) && !posicionEnBanderitas(posicion, b);
}



