'use strict';
import { generateReverb } from './reverbgen.js'
const TEMPO_MUL = 120 / 118;
function noteFreq(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
}
export let ac;
export let out;
let songStart;
export function audioInit() {
    ac = new AudioContext;
    out = ac.createGain();
    out.gain.value = 0.3333;
    // out.connect(ac.destination)
    // return Promise.resolve()
    return reverb();
}
export function playNote(n, start, end) {
    const freq = noteFreq(n);
    start *= TEMPO_MUL;
    end *= TEMPO_MUL;
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;
    decay(osc, start).connect(out);
    osc.start(songStart + start);
    osc.stop(songStart + end);
}
function decay(osc, start) {
    const env = ac.createGain();
    env.gain.setValueAtTime(0.5, songStart + start);
    env.gain.exponentialRampToValueAtTime(0.00001, songStart + start + 1.5 * TEMPO_MUL);
    osc.connect(env);
    return env;
}
/* --- Experimental --- */
function reverb() {
    const conv = ac.createConvolver();
    const dry = ac.createGain();
    const wet = ac.createGain();
    dry.gain.value = 2 / 3;
    wet.gain.value = 1 / 3;
    out.connect(conv);
    out.connect(dry);
    conv.connect(wet);
    dry.connect(ac.destination);
    wet.connect(ac.destination);
    return new Promise(function (resolve) {
        generateReverb({
            audioContext: ac,
            fadeIn: 0.00001,
            decay: 1.5 * TEMPO_MUL,
            lpFreqStart: 16000,
            lpFreqEnd: 1000,
        }, function (buf) {
            conv.buffer = buf;
            resolve();
        });
    });
}

// Oborona

function playPart(n) {
    const hbar = n > 51 ? (n - 8) % 44 + 8 : n;
    // console.log(`playPart n=${n} hbar=${hbar}`)
    switch (hbar) {
        case 0: // half-bar 1
            playNote(57, n + 0.0, n + 0.25);
            playNote(45, n + 0.0, n + 2.0);
            playNote(60, n + 0.25, n + 0.5);
            playNote(57, n + 0.5, n + 0.75);
            playNote(64, n + 0.75, n + 1.25);
            break;
        case 1: // half-bar 2
            playNote(60, n + 0.25, n + 0.75);
            playNote(60, n + 0.75, n + 1.0);
            break;
        case 2: // half-bar 3
            playNote(52, n + 0.0, n + 1.0);
            playNote(60, n + 0.25, n + 0.5);
            playNote(57, n + 0.5, n + 0.75);
            playNote(64, n + 0.75, n + 1.25);
            break;
        case 3: // half-bar 4
            playNote(52, n + 0.0, n + 0.75);
            playNote(60, n + 0.25, n + 0.75);
            playNote(60, n + 0.75, n + 1.0);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 4: // half-bar 5
            playNote(45, n + 0.0, n + 1.75);
            playNote(57, n + 0.25, n + 0.5);
            playNote(60, n + 0.5, n + 0.75);
            playNote(64, n + 0.75, n + 1.25);
            playNote(57, n + 0.75, n + 1.25);
            break;
        case 5: // half-bar 6
            playNote(57, n + 0.25, n + 0.5);
            playNote(60, n + 0.5, n + 1.0);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 6: // half-bar 7
            playNote(60, n + 0.0, n + 1.0);
            playNote(52, n + 0.0, n + 0.5);
            playNote(52, n + 0.5, n + 1.5);
            break;
        case 7: // half-bar 8
            playNote(64, n + 0.0, n + 1.0);
            playNote(52, n + 0.5, n + 0.75);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 8: // half-bar 9
            playNote(57, n + 0.0, n + 0.25);
            playNote(45, n + 0.0, n + 0.75);
            playNote(57, n + 0.25, n + 0.5);
            playNote(57, n + 0.5, n + 0.75);
            playNote(60, n + 0.75, n + 1.25);
            playNote(52, n + 0.75, n + 1.75);
            break;
        case 9: // half-bar 10
            playNote(69, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(69, n + 0.75, n + 1.0);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 10: // half-bar 11
            playNote(69, n + 0.0, n + 0.75);
            playNote(41, n + 0.0, n + 0.25);
            playNote(48, n + 0.25, n + 0.5);
            playNote(55, n + 0.5, n + 1.5);
            playNote(57, n + 0.75, n + 1.75);
            break;
        case 11: // half-bar 12
            playNote(55, n + 0.5, n + 0.75);
            playNote(67, n + 0.75, n + 1.0);
            playNote(50, n + 0.75, n + 1.0);
            break;
        case 12: // half-bar 13
            playNote(67, n + 0.0, n + 0.25);
            playNote(55, n + 0.0, n + 0.75);
            playNote(67, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(66, n + 0.75, n + 1.25);
            playNote(57, n + 0.75, n + 1.75);
            playNote(54, n + 0.75, n + 1.75);
            break;
        case 13: // half-bar 14
            playNote(67, n + 0.25, n + 0.5);
            playNote(66, n + 0.5, n + 0.75);
            playNote(64, n + 0.75, n + 1.0);
            playNote(47, n + 0.75, n + 1.0);
            break;
        case 14: // half-bar 15
            playNote(52, n + 0.0, n + 0.25);
            playNote(47, n + 0.0, n + 2.0);
            playNote(54, n + 0.25, n + 0.5);
            playNote(56, n + 0.5, n + 0.75);
            playNote(59, n + 0.75, n + 1.75);
            break;
        case 15: // half-bar 16
            playNote(57, n + 0.75, n + 1.0);
            break;
        case 16: // half-bar 17
            playNote(57, n + 0.0, n + 0.25);
            playNote(45, n + 0.0, n + 0.75);
            playNote(57, n + 0.25, n + 0.5);
            playNote(57, n + 0.5, n + 0.75);
            playNote(60, n + 0.75, n + 1.25);
            playNote(52, n + 0.75, n + 1.25);
            break;
        case 17: // half-bar 18
            playNote(69, n + 0.25, n + 0.5);
            playNote(57, n + 0.25, n + 1.0);
            playNote(67, n + 0.5, n + 0.75);
            playNote(69, n + 0.75, n + 1.0);
            break;
        case 18: // half-bar 19
            playNote(69, n + 0.0, n + 0.75);
            playNote(57, n + 0.0, n + 0.25);
            playNote(53, n + 0.0, n + 0.25);
            playNote(48, n + 0.0, n + 0.25);
            playNote(48, n + 0.25, n + 0.5);
            playNote(55, n + 0.5, n + 0.75);
            playNote(65, n + 0.75, n + 1.75);
            playNote(57, n + 0.75, n + 1.25);
            break;
        case 19: // half-bar 20
            playNote(57, n + 0.25, n + 0.5);
            playNote(60, n + 0.5, n + 1.0);
            playNote(67, n + 0.75, n + 1.0);
            break;
        case 20: // half-bar 21
            playNote(67, n + 0.0, n + 0.25);
            playNote(43, n + 0.0, n + 0.5);
            playNote(59, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(50, n + 0.5, n + 0.75);
            playNote(66, n + 0.75, n + 1.25);
            playNote(47, n + 0.75, n + 1.75);
            break;
        case 21: // half-bar 22
            playNote(67, n + 0.25, n + 0.5);
            playNote(66, n + 0.5, n + 0.75);
            playNote(64, n + 0.75, n + 1.0);
            playNote(47, n + 0.75, n + 1.0);
            break;
        case 22: // half-bar 23
            playNote(52, n + 0.0, n + 0.25);
            playNote(47, n + 0.0, n + 2.0);
            playNote(54, n + 0.25, n + 0.5);
            playNote(56, n + 0.5, n + 0.75);
            playNote(59, n + 0.75, n + 1.75);
            break;
        case 23: // half-bar 24
            playNote(67, n + 0.75, n + 1.0);
            break;
        case 24: // half-bar 25
            playNote(67, n + 0.0, n + 0.25);
            playNote(59, n + 0.0, n + 0.5);
            playNote(55, n + 0.0, n + 0.5);
            playNote(62, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(59, n + 0.5, n + 0.75);
            playNote(67, n + 0.75, n + 1.25);
            playNote(57, n + 0.75, n + 1.25);
            break;
        case 25: // half-bar 26
            playNote(67, n + 0.25, n + 0.5);
            playNote(50, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(43, n + 0.5, n + 1.0);
            playNote(68, n + 0.75, n + 1.0);
            playNote(64, n + 0.75, n + 1.0);
            break;
        case 26: // half-bar 27
            playNote(68, n + 0.0, n + 0.25);
            playNote(64, n + 0.0, n + 0.25);
            playNote(40, n + 0.0, n + 0.5);
            playNote(64, n + 0.25, n + 0.5);
            playNote(62, n + 0.5, n + 0.75);
            playNote(47, n + 0.5, n + 0.75);
            playNote(62, n + 0.75, n + 1.25);
            playNote(52, n + 0.75, n + 1.5);
            break;
        case 27: // half-bar 28
            playNote(60, n + 0.25, n + 0.75);
            playNote(52, n + 0.5, n + 0.75);
            playNote(57, n + 0.75, n + 1.0);
            playNote(47, n + 0.75, n + 1.0);
            break;
        case 28: // half-bar 29
            playNote(60, n + 0.0, n + 0.5);
            playNote(45, n + 0.0, n + 0.5);
            playNote(72, n + 0.5, n + 1.0);
            playNote(64, n + 0.5, n + 1.0);
            playNote(57, n + 0.5, n + 0.75);
            playNote(48, n + 0.75, n + 1.0);
            break;
        case 29: // half-bar 30
            playNote(60, n + 0.0, n + 0.25);
            playNote(57, n + 0.0, n + 0.75);
            playNote(53, n + 0.0, n + 0.75);
            playNote(65, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.0);
            playNote(43, n + 0.75, n + 1.0);
            break;
        case 30: // half-bar 31
            playNote(72, n + 0.0, n + 0.25);
            playNote(64, n + 0.0, n + 0.25);
            playNote(60, n + 0.0, n + 0.25);
            playNote(48, n + 0.0, n + 0.5);
            playNote(36, n + 0.0, n + 0.5);
            playNote(72, n + 0.25, n + 0.5);
            playNote(64, n + 0.25, n + 0.5);
            playNote(60, n + 0.25, n + 0.5);
            playNote(72, n + 0.5, n + 0.75);
            playNote(64, n + 0.5, n + 0.75);
            playNote(60, n + 0.5, n + 0.75);
            playNote(55, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.25);
            playNote(64, n + 0.75, n + 1.25);
            playNote(60, n + 0.75, n + 1.25);
            playNote(50, n + 0.75, n + 1.5);
            break;
        case 31: // half-bar 32
            playNote(71, n + 0.25, n + 1.0);
            playNote(62, n + 0.25, n + 1.0);
            playNote(59, n + 0.25, n + 1.0);
            playNote(57, n + 0.5, n + 0.75);
            playNote(50, n + 0.75, n + 1.0);
            break;
        case 32: // half-bar 33
            playNote(72, n + 0.0, n + 0.25);
            playNote(64, n + 0.0, n + 0.25);
            playNote(60, n + 0.0, n + 0.25);
            playNote(57, n + 0.0, n + 0.5);
            playNote(52, n + 0.0, n + 0.5);
            playNote(45, n + 0.0, n + 0.5);
            playNote(72, n + 0.25, n + 0.5);
            playNote(72, n + 0.5, n + 0.75);
            playNote(59, n + 0.5, n + 1.0);
            playNote(72, n + 0.75, n + 1.25);
            break;
        case 33: // half-bar 34
            playNote(57, n + 0.0, n + 0.5);
            playNote(53, n + 0.0, n + 0.5);
            playNote(48, n + 0.0, n + 0.5);
            playNote(71, n + 0.25, n + 0.5);
            playNote(69, n + 0.5, n + 0.75);
            playNote(48, n + 0.5, n + 1.0);
            playNote(67, n + 0.75, n + 1.0);
            playNote(64, n + 0.75, n + 1.0);
            playNote(60, n + 0.75, n + 1.0);
            break;
        case 34: // half-bar 35
            playNote(67, n + 0.0, n + 0.25);
            playNote(64, n + 0.0, n + 0.25);
            playNote(60, n + 0.0, n + 0.25);
            playNote(36, n + 0.0, n + 0.5);
            playNote(69, n + 0.25, n + 0.5);
            playNote(71, n + 0.5, n + 0.75);
            playNote(43, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.25);
            playNote(68, n + 0.75, n + 1.25);
            playNote(64, n + 0.75, n + 1.25);
            playNote(48, n + 0.75, n + 1.0);
            break;
        case 35: // half-bar 36
            playNote(40, n + 0.0, n + 0.5);
            playNote(71, n + 0.25, n + 1.0);
            playNote(56, n + 0.5, n + 0.75);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 36: // half-bar 37
            playNote(60, n + 0.0, n + 0.5);
            playNote(45, n + 0.0, n + 0.25);
            playNote(52, n + 0.25, n + 0.5);
            playNote(72, n + 0.5, n + 1.0);
            playNote(64, n + 0.5, n + 1.0);
            playNote(60, n + 0.5, n + 1.0);
            playNote(57, n + 0.5, n + 1.0);
            break;
        case 37: // half-bar 38
            playNote(60, n + 0.0, n + 0.25);
            playNote(57, n + 0.0, n + 0.5);
            playNote(53, n + 0.0, n + 0.5);
            playNote(65, n + 0.25, n + 0.5);
            playNote(67, n + 0.5, n + 0.75);
            playNote(48, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.0);
            playNote(60, n + 0.75, n + 1.0);
            playNote(43, n + 0.75, n + 1.0);
            break;
        case 38: // half-bar 39
            playNote(72, n + 0.0, n + 0.25);
            playNote(67, n + 0.0, n + 0.25);
            playNote(60, n + 0.0, n + 0.25);
            playNote(48, n + 0.0, n + 0.5);
            playNote(72, n + 0.25, n + 0.5);
            playNote(60, n + 0.25, n + 0.5);
            playNote(72, n + 0.5, n + 0.75);
            playNote(60, n + 0.5, n + 0.75);
            playNote(55, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.25);
            playNote(67, n + 0.75, n + 1.25);
            playNote(62, n + 0.75, n + 1.25);
            playNote(50, n + 0.75, n + 1.0);
            break;
        case 39: // half-bar 40
            playNote(43, n + 0.0, n + 0.25);
            playNote(71, n + 0.25, n + 0.75);
            playNote(67, n + 0.25, n + 0.75);
            playNote(62, n + 0.25, n + 0.75);
            playNote(50, n + 0.25, n + 0.5);
            playNote(57, n + 0.5, n + 1.0);
            playNote(59, n + 0.75, n + 1.0);
            break;
        case 40: // half-bar 41
            playNote(72, n + 0.0, n + 0.5);
            playNote(64, n + 0.0, n + 0.5);
            playNote(60, n + 0.0, n + 0.5);
            playNote(52, n + 0.0, n + 0.5);
            playNote(45, n + 0.0, n + 0.5);
            playNote(72, n + 0.5, n + 0.75);
            playNote(64, n + 0.5, n + 0.75);
            playNote(60, n + 0.5, n + 0.75);
            playNote(57, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.25);
            playNote(67, n + 0.75, n + 1.25);
            playNote(60, n + 0.75, n + 1.25);
            playNote(48, n + 0.75, n + 1.0);
            break;
        case 41: // half-bar 42
            playNote(57, n + 0.0, n + 0.5);
            playNote(53, n + 0.0, n + 0.5);
            playNote(48, n + 0.0, n + 0.5);
            playNote(71, n + 0.25, n + 0.5);
            playNote(69, n + 0.5, n + 0.75);
            playNote(60, n + 0.5, n + 0.75);
            playNote(57, n + 0.5, n + 0.75);
            playNote(67, n + 0.75, n + 1.0);
            playNote(53, n + 0.75, n + 1.0);
            break;
        case 42: // half-bar 43
            playNote(67, n + 0.0, n + 0.25);
            playNote(48, n + 0.0, n + 0.25);
            playNote(36, n + 0.0, n + 0.25);
            playNote(69, n + 0.25, n + 0.5);
            playNote(43, n + 0.25, n + 0.5);
            playNote(71, n + 0.5, n + 0.75);
            playNote(48, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.25);
            playNote(68, n + 0.75, n + 1.25);
            playNote(64, n + 0.75, n + 1.25);
            playNote(60, n + 0.75, n + 1.25);
            playNote(44, n + 0.75, n + 1.0);
            break;
        case 43: // half-bar 44
            playNote(52, n + 0.0, n + 0.25);
            playNote(71, n + 0.25, n + 1.0);
            playNote(68, n + 0.25, n + 1.0);
            playNote(64, n + 0.25, n + 1.0);
            playNote(47, n + 0.25, n + 0.5);
            playNote(56, n + 0.5, n + 0.75);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 44: // half-bar 45
            playNote(72, n + 0.0, n + 0.5);
            playNote(64, n + 0.0, n + 0.5);
            playNote(60, n + 0.0, n + 0.5);
            playNote(57, n + 0.0, n + 0.25);
            playNote(45, n + 0.0, n + 0.25);
            playNote(52, n + 0.25, n + 0.5);
            playNote(72, n + 0.5, n + 0.75);
            playNote(60, n + 0.5, n + 0.75);
            playNote(57, n + 0.5, n + 0.75);
            playNote(72, n + 0.75, n + 1.25);
            playNote(67, n + 0.75, n + 1.25);
            playNote(60, n + 0.75, n + 1.25);
            playNote(48, n + 0.75, n + 1.0);
            break;
        case 45: // half-bar 46
            playNote(57, n + 0.0, n + 0.25);
            playNote(53, n + 0.0, n + 0.25);
            playNote(71, n + 0.25, n + 0.5);
            playNote(55, n + 0.25, n + 0.5);
            playNote(69, n + 0.5, n + 0.75);
            playNote(48, n + 0.5, n + 1.0);
            playNote(67, n + 0.75, n + 1.0);
            playNote(64, n + 0.75, n + 1.0);
            playNote(60, n + 0.75, n + 1.0);
            break;
        case 46: // half-bar 47
            playNote(67, n + 0.0, n + 0.25);
            playNote(64, n + 0.0, n + 0.25);
            playNote(60, n + 0.0, n + 0.25);
            playNote(48, n + 0.0, n + 0.25);
            playNote(36, n + 0.0, n + 0.25);
            playNote(69, n + 0.25, n + 0.5);
            playNote(43, n + 0.25, n + 0.5);
            playNote(71, n + 0.5, n + 0.75);
            playNote(48, n + 0.5, n + 1.0);
            playNote(72, n + 0.75, n + 1.25);
            playNote(68, n + 0.75, n + 1.25);
            playNote(60, n + 0.75, n + 1.25);
            break;
        case 47: // half-bar 48
            playNote(52, n + 0.0, n + 0.5);
            playNote(40, n + 0.0, n + 0.5);
            playNote(71, n + 0.25, n + 1.0);
            playNote(68, n + 0.25, n + 1.0);
            playNote(62, n + 0.25, n + 1.0);
            playNote(47, n + 0.5, n + 0.75);
            playNote(52, n + 0.75, n + 1.0);
            break;
        case 48: // half-bar 49
            playNote(71, n + 0.0, n + 2.0);
            playNote(68, n + 0.0, n + 2.0);
            playNote(62, n + 0.0, n + 2.0);
            playNote(52, n + 0.0, n + 0.25);
            playNote(54, n + 0.25, n + 0.75);
            playNote(56, n + 0.75, n + 1.25);
            break;
        case 49: // half-bar 50
            playNote(54, n + 0.25, n + 0.5);
            playNote(56, n + 0.5, n + 1.0);
            break;
        case 50: // half-bar 51
            playNote(64, n + 0.0, n + 1.75);
            break;
        case 51: // half-bar 52
            playNote(52, n + 0.75, n + 1.0);
            break;
    }
}
let prevPart = -1;
function enqueue() {
    let bufferWanted = ac.currentTime - songStart + 4;
    let queued = (prevPart + 1) * TEMPO_MUL;
    if (queued > bufferWanted)
        return;
    bufferWanted += 4;
    while (queued < bufferWanted) {
        playPart(++prevPart);
        queued += TEMPO_MUL;
    }
}
export function playLoop() {
    songStart = ac.currentTime + 0.05;
    enqueue();
    setInterval(enqueue, 999);
}
