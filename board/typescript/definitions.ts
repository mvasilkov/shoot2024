'use strict'

import type { IVec2 } from '../node_modules/natlib/Vec2'
import { ShortBool, type ExtendedBool } from '../node_modules/natlib/prelude.js'
import { Mulberry32 } from '../node_modules/natlib/prng/Mulberry32.js'
import { randomUint32LessThan, type IPrng32 } from '../node_modules/natlib/prng/prng.js'

export const enum Settings {
    boardWidth = 4,
    boardHeight = 4,
    kingValue = 10,
    outOfBounds = 9,
    alwaysTake = 7,
}

export const enum PieceSpecies {
    knight = 1,
    bishop,
    rook,
    queen,
    king,
}

type ReadonlyVec2 = Readonly<IVec2>
type Optional<T> = T | null | undefined
type Piece = { species: PieceSpecies, value: number }
type BoardRow<T> = [Optional<T>, Optional<T>, Optional<T>, Optional<T>]
export type Board<T> = [BoardRow<T>, BoardRow<T>, BoardRow<T>, BoardRow<T>]

const createBoard = <T>(): Board<T> => {
    return [
        [, , , ,],
        [, , , ,],
        [, , , ,],
        [, , , ,],
    ]
}

export let board: Board<Piece>
/** Selected cell */
export let selected: Optional<ReadonlyVec2>
/** Cell vacated in the last turn */
export let vacated: Optional<ReadonlyVec2>
/** Cell occupied in the last turn */
export let occupied: Optional<ReadonlyVec2>
/** Position of the last spawned piece */
export let spawned: Optional<ReadonlyVec2>
let ended: ExtendedBool
let prng: IPrng32

export const reset = (seed?: number) => {
    board = createBoard()
    selected = null
    vacated = null
    occupied = null
    spawned = null
    ended = ShortBool.FALSE
    prng = new Mulberry32(seed ?? Date.now())
}

reset()

const getRandomElement = <T>(array: T[]): Optional<T> => {
    switch (array.length) {
        case 0: return
        case 1: return array[0]
    }
    return array[randomUint32LessThan(prng, array.length)]
}

export const spawn = () => {
    const vacant: ReadonlyVec2[] = []

    for (let y = 0; y < Settings.boardHeight; ++y) {
        for (let x = 0; x < Settings.boardWidth; ++x) {
            if (!board[y]![x]) {
                vacant.push({ x, y })
            }
        }
    }

    if (!vacant.length) {
        ended = ShortBool.TRUE
        return
    }

    const { x, y } = getRandomElement(vacant)!

    if (vacated && vacated.x === x && vacated.y === y) {
        const { x, y } = getRandomElement(vacant)!
        board[y]![x] = { species: PieceSpecies.knight, value: 1 }
        spawned = { x, y }
        return
    }

    board[y]![x] = { species: PieceSpecies.knight, value: 1 }
    spawned = { x, y }
}

export const setSpawned = (x: number, y: number) => {
    spawned = { x, y }
}

export const getMoves = (x0: number, y0: number): ReadonlyVec2[] => {
    const moves: ReadonlyVec2[] = []

    const putMove = (Δx: number, Δy: number): ExtendedBool => {
        const x = x0 + Δx
        const y = y0 + Δy

        let passable: boolean

        if (x >= 0 && x < Settings.boardWidth &&
            y >= 0 && y < Settings.boardHeight &&
            ((passable = !board[y]![x]) || board[y]![x].value === board[y0]![x0]?.value)) {

            moves.push({ x, y })

            return passable
        }

        return
    }

    const piece = board[y0]![x0]
    if (!piece) return moves

    const { species } = piece

    switch (species) {
        case PieceSpecies.knight:
            putMove(-2, -1)
            putMove(-2, 1)
            putMove(-1, -2)
            putMove(-1, 2)
            putMove(1, -2)
            putMove(1, 2)
            putMove(2, -1)
            putMove(2, 1)
            break

        case PieceSpecies.bishop:
            putMove(-1, -1) && putMove(-2, -2) && putMove(-3, -3)
            putMove(-1, 1) && putMove(-2, 2) && putMove(-3, 3)
            putMove(1, -1) && putMove(2, -2) && putMove(3, -3)
            putMove(1, 1) && putMove(2, 2) && putMove(3, 3)
            break

        case PieceSpecies.rook:
            putMove(-1, 0) && putMove(-2, 0) && putMove(-3, 0)
            putMove(0, -1) && putMove(0, -2) && putMove(0, -3)
            putMove(1, 0) && putMove(2, 0) && putMove(3, 0)
            putMove(0, 1) && putMove(0, 2) && putMove(0, 3)
            break

        case PieceSpecies.queen:
            putMove(-1, -1) && putMove(-2, -2) && putMove(-3, -3)
            putMove(-1, 1) && putMove(-2, 2) && putMove(-3, 3)
            putMove(1, -1) && putMove(2, -2) && putMove(3, -3)
            putMove(1, 1) && putMove(2, 2) && putMove(3, 3)

            putMove(-1, 0) && putMove(-2, 0) && putMove(-3, 0)
            putMove(0, -1) && putMove(0, -2) && putMove(0, -3)
            putMove(1, 0) && putMove(2, 0) && putMove(3, 0)
            putMove(0, 1) && putMove(0, 2) && putMove(0, 3)
    }

    return moves
}

export const getMovesTable = (x0: number, y0: number): Board<ShortBool> => {
    const moves = createBoard<ShortBool>()

    getMoves(x0, y0).forEach(({ x, y }) => {
        moves[y]![x] = ShortBool.TRUE
    })

    return moves
}

export const interact = (x: number, y: number) => {
    // Select
    if (!selected) {
        if (board[y]![x]) selected = { x, y }
    }

    // Deselect
    else if (selected.x === x && selected.y === y) {
        selected = null
    }

    // Move
    else if (!board[y]![x]) {
        const moves = getMovesTable(selected.x, selected.y)

        if (moves[y]![x]) {
            board[y]![x] = board[selected.y]![selected.x]
            board[selected.y]![selected.x] = null
            vacated = selected
            occupied = { x, y }
            selected = null

            spawn()

            playKing()
        }
        else {
            // Move isn't possible, deselect instead
            selected = null
        }
    }

    // Merge
    else if (board[y]![x].value === board[selected.y]![selected.x]?.value) {
        const moves = getMovesTable(selected.x, selected.y)

        if (moves[y]![x]) {
            const value = ++board[y]![x].value
            board[selected.y]![selected.x] = null
            vacated = selected
            occupied = { x, y }
            selected = null

            const nextMove = getMoves(x, y).some(move => board[move.y]![move.x]?.value === value)
            if (nextMove) {
                // The piece can continue the chain. Select it
                // and don't spawn new pieces.
                selected = { x, y }
            }
            else {
                spawn()
            }

            playKing()
        }
        else {
            // Merge isn't possible, select instead
            selected = { x, y }
        }
    }

    // Select
    else if (board[y]![x]) {
        selected = { x, y }
    }
}

export const playKing = () => {
    let x0: number = Settings.outOfBounds
    let y0: number = Settings.outOfBounds
    let boardFull = ShortBool.TRUE

    for (let y = 0; y < Settings.boardHeight; ++y) {
        for (let x = 0; x < Settings.boardWidth; ++x) {
            const piece = board[y]![x]
            if (!piece) {
                boardFull = ShortBool.FALSE
            }
            else if (piece.value === Settings.kingValue) {
                x0 = x
                y0 = y
            }
        }
    }

    if (x0 === Settings.outOfBounds) return // King not found

    const possibleMoves: IVec2[] = []
    let possibleTakes: (IVec2 & { value: number })[] = []

    const putMove = (Δx: number, Δy: number) => {
        const x = x0 + Δx
        const y = y0 + Δy

        if (x >= 0 && x < Settings.boardWidth &&
            y >= 0 && y < Settings.boardHeight) {

            const piece = board[y]![x]
            if (!piece) {
                possibleMoves.push({ x, y })
            }
            else {
                // Move is still in progress, don't take the piece
                if (occupied && occupied.x === x && occupied.y === y) return

                possibleTakes.push({ x, y, value: piece.value })
            }
        }
    }

    putMove(-1, -1)
    putMove(-1, 0)
    putMove(-1, 1)
    putMove(0, -1)
    putMove(0, 1)
    putMove(1, -1)
    putMove(1, 0)
    putMove(1, 1)

    // Sort by value, descending
    possibleTakes.sort((a, b) => b.value - a.value)

    const highestValue = possibleTakes[0]?.value ?? 0

    possibleTakes = possibleTakes.filter(({ value }) => value === highestValue)

    // Take only when the target piece is valuable, OR
    // the target piece is present, AND the king is surrounded, AND the board isn't full.
    if (highestValue >= Settings.alwaysTake ||
        (highestValue && !possibleMoves.length && !boardFull)) {

        const { x, y } = getRandomElement(possibleTakes)!

        if (selected && selected.x === x && selected.y === y) selected = null

        board[y]![x] = board[y0]![x0]
        board[y0]![x0] = null
    }
    else if (possibleMoves.length) {
        const { x, y } = getRandomElement(possibleMoves)!

        board[y]![x] = board[y0]![x0]
        board[y0]![x0] = null
    }
}
