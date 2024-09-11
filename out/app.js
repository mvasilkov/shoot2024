'use strict'

import { CanvasHandle } from '../node_modules/natlib/canvas/CanvasHandle.js'
import { startMainloop } from '../node_modules/natlib/scheduling/mainloop.js'

import { ac, audioInit, out, out2, playLoop } from './audio/audio.js'
import { zzfxMicro, zzfxR } from './audio/ZzFX.js'
import { createParticles } from './debug/debug.js'
import { scene } from './prelude.js'

let started = false
let bulletsShot = 0
let bulletsHit = 0
let musicOn = true

AFRAME.registerComponent('dakka', {
    init() {
        this.targets = document.querySelectorAll('.target')

        const titles = document.querySelectorAll('.title')
        this.title1 = titles[0]
        this.title2 = titles[1]

        this.aliveText = document.querySelector('.alive')
        this.accuracyText = document.querySelector('.accuracy')
        this.thanksText = document.querySelector('.thanks')

        const blast = event => {
            const visible = this.el.getAttribute('visible')
            if (!visible) return

            // Bullet start position
            const origin = this.el.components.raycaster.data.origin
            const startPos = new THREE.Vector3(origin.x, origin.y, origin.z)
            this.el.object3D.localToWorld(startPos)

            // Bullet end position and distance
            const { object, point: endPos, distance, uv } = event.detail.intersection

            // Bullet entity
            const bullet = document.createElement('a-entity')
            bullet.setAttribute('geometry', {
                primitive: 'sphere',
                radius: 0.05,
            })
            bullet.setAttribute('material', {
                color: '#ff0044',
            })
            bullet.setAttribute('position', startPos)
            bullet.setAttribute('animation', {
                property: 'position',
                to: endPos,
                dur: 50 * distance,
                easing: 'linear',
            })
            this.el.sceneEl.appendChild(bullet)

            // Bullet hit
            bullet.addEventListener('animationcomplete', () => {
                bullet.parentNode.removeChild(bullet)

                this.bulletHit(object, uv)
            })

            if (!started && object.el.id === 'screen') {
                started = true
                bulletsShot = 0
                bulletsHit = 0

                this.title1.setAttribute('visible', false)
                this.title2.setAttribute('visible', false)

                this.aliveText.setAttribute('visible', true)
            }

            sound(sndGun)
        }

        this.el.addEventListener('click', blast)
        this.el.addEventListener('triggerdown', blast)
    },

    bulletHit(object, uv) {
        switch (object.el.id) {
            case 'screen':
                const x = 960 * (1 - uv.x)
                const y = 540 * (1 - uv.y)

                let killed = false
                let aliveCount = 0

                scene.vertices.forEach(v => {
                    if (v.dead) return

                    const dx = v.position.x - x
                    const dy = v.position.y - y
                    const distanceSquared = (dx * dx + dy * dy)

                    if (distanceSquared < 484) {
                        // Kill
                        killed = v.dead = true

                        this.headshot(this.targets[v.index])
                    }
                    else ++aliveCount
                })

                if (killed) {
                    ++bulletsHit
                    this.aliveText.setAttribute('text', { value: 'NOMSTERS ALIVE: ' + aliveCount })
                }

                if (aliveCount === 0) {
                    const accuracy = Math.round(100 * bulletsHit / bulletsShot)

                    this.accuracyText.setAttribute('visible', true)
                    this.accuracyText.setAttribute('text', { value: `ACCURACY: ${accuracy}%` })

                    this.thanksText.setAttribute('visible', true)

                    if (killed) sound(sndWin)
                }
                else ++bulletsShot
                break

            case 'reset':
                started = false

                this.aliveText.setAttribute('visible', false)
                this.aliveText.setAttribute('text', { value: 'NOMSTERS ALIVE: 13' })

                this.accuracyText.setAttribute('visible', false)
                this.accuracyText.setAttribute('text', { value: 'ACCURACY: 100%' })

                this.thanksText.setAttribute('visible', false)

                this.title1.setAttribute('visible', true)
                this.title2.setAttribute('visible', true)

                requestAnimationFrame(() => {
                    this.targets.forEach(target => {
                        target.setAttribute('visible', true)
                    })
                })

                createParticles()

                sound(sndButton)
                break

            case 'music':
                musicOn = !musicOn
                out.gain.value = musicOn ? 0.3333 : 0

                sound(sndButton)
        }

        // con.fillStyle = '#f00'
        // con.fillRect(x - 4, y - 4, 8, 8)
    },

    headshot(target) {
        target.setAttribute('visible', false)

        const dir = new THREE.Vector3(0, 1.69, 0)
        dir.sub(target.object3D.position).normalize().multiplyScalar(2.5)

        // Explosion
        for (let n = 0; n < 13; ++n) {
            const particle = document.createElement('a-entity')
            particle.setAttribute('geometry', {
                primitive: 'sphere',
                radius: 0.1,
            })
            particle.setAttribute('material', {
                color: target.components.material.data.color,
                emissive: target.components.material.data.emissive,
                emissiveIntensity: target.components.material.data.emissiveIntensity,
                opacity: 1,
                transparent: true,
            })
            particle.setAttribute('position', target.object3D.position.clone())
            particle.setAttribute('animation__pos', {
                property: 'position',
                to: {
                    x: dir.x + target.object3D.position.x + 2 * (Math.random() - 0.5),
                    y: dir.y + target.object3D.position.y + 2 * (Math.random() - 0.5),
                    z: dir.z + target.object3D.position.z + 2 * (Math.random() - 0.5),
                },
                dur: 600,
                easing: 'easeOutQuad',
            })
            particle.setAttribute('animation__trans', {
                property: 'material.opacity',
                to: 0,
                dur: 600,
                easing: 'easeInQuad',
            })
            this.el.sceneEl.appendChild(particle)

            particle.addEventListener('animationcomplete', event => {
                if (event.detail.name === 'animation__trans') {
                    particle.parentNode.removeChild(particle)
                }
            })
        }

        sound(sndHit)
    },
})

AFRAME.registerComponent('unfuck-direction', {
    init() {
        this._initialized = false
    },

    tick() {
        let parent

        if (this._initialized || !(parent = this.el.parentNode).components['laser-controls'].modelReady) return

        const parentOrigin = parent.components.raycaster.data.origin
        const parentDirection = parent.components.raycaster.data.direction

        const direction = new THREE.Vector3(parentDirection.x, parentDirection.y, parentDirection.z)
        direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), -0.1 * Math.PI)

        const origin = direction.clone().multiplyScalar(0.15).add(parentOrigin)
        const offset = direction.clone().multiplyScalar(0.1).add(parentOrigin)

        parent.setAttribute('raycaster', { direction, origin })

        this.el.object3D.position.copy(offset)
        this.el.object3D.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction)

        const controllerModel = parent.getObject3D('mesh')
        if (controllerModel) controllerModel.visible = false

        this.el.setAttribute('visible', true)

        this._initialized = true
    },
})

const unproject = (x0, y0) => {
    // The screen is 960 by 540 curved,
    // height="9" radius="7.6394" theta-length="120" == 0.6666 pi radians
    // 1 pixel == 0.01666 units

    const theta = x0 / 960 * 0.6666 * Math.PI + 1.1666 * Math.PI

    const x = 7.6394 * Math.cos(theta)
    const y = 0.01666 * (540 - y0)
    const z = 7.6394 * Math.sin(theta)

    return [x, y, z, theta]
}

AFRAME.registerComponent('canvas-screen', {
    init() {
        const targets = document.querySelectorAll('.target')
        targets.forEach(target => {
            target.setAttribute('visible', true)
        })

        const eyes = document.querySelectorAll('.target > a-entity')

        const update = () => {
            if (started) scene.update()
        }

        const render = t => {
            scene.vertices.forEach(v => v.interpolate(t));

            // con.beginPath();
            scene.vertices.forEach(p => {
                // con.moveTo(p.interpolated.x + p.radius, p.interpolated.y);
                // con.arc(p.interpolated.x, p.interpolated.y, p.radius, 0, 2 * Math.PI);
                const [x, y, z, theta] = unproject(p.interpolated.x, p.interpolated.y)
                targets[p.index].object3D.position.set(x, y, z)
                // Look at the player
                targets[p.index].object3D.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -theta - 0.5 * Math.PI)

                eyes[p.index].object3D.position.set(
                    0.01 * (p.position.x - p.oldPosition.x),
                    0.01 * (p.position.y - p.oldPosition.y),
                    0.3666)
            });
            // con.fillStyle = '#fff';
            // con.fill();
        }

        createParticles()
        startMainloop(update, render)

        // con.fillStyle = '#000'
        // con.fillRect(0, 0, 960, 540)

        const screenModel = this.el.getObject3D('mesh')
        if (screenModel) screenModel.visible = false
    },

    tick() {
        // const texture = this.el.getObject3D('mesh').material.map
        // if (texture) texture.needsUpdate = true
    },
})

AFRAME.registerComponent('grid-floor', {
    init() {
        const con = new CanvasHandle(document.querySelector('#canvas'), 256, 256, 1, (con, width, height) => {
            con.fillStyle = '#f4f4f4'
            con.fillRect(0, 0, width, height)

            con.fillStyle = '#1a1c2c'
            con.fillRect(0, 0, 4, height)
            con.fillRect(0, 0, height, 4)
        }).con
    },
})

// Audio

function sound(snd) {
    try {
        if (snd.buf === null) {
            snd.buf = ac.createBuffer(1, snd.raw.length, zzfxR)
            snd.buf.getChannelData(0).set(snd.raw)
        }
        const bufs = ac.createBufferSource()
        bufs.buffer = snd.buf
        bufs.connect(out2)
        bufs.start()
    }
    catch (err) {
    }
}

const sndWin = {
    raw: zzfxMicro.apply(null, [, , 345, .01, .17, .87, 1, 1.05, .2, , 67, .03, .02, , -0.2, , , .79, , .04]),
    buf: null,
}

const sndButton = {
    raw: zzfxMicro.apply(null, [, , 417, , .01, .01, , .94, -0.1, 2.5, -9, , , , , , , , .07, .01]),
    buf: null,
}

const sndGun = {
    // raw: zzfxMicro.apply(null, [.8, , 39, .01, .02, .27, 4, 1.7, , 1, , , , .7, , .3, , .79, , , 1477]),
    raw: zzfxMicro.apply(null, [.8, 0, 40, .01, .02, .28, 4, 1.6, , 1, -50, , -0.01, .7, , .3, , .69, , , 1478]),
    buf: null,
}

const sndHit = {
    raw: zzfxMicro.apply(null, [, , 134, .08, .19, .34, , 1.8, , -87, 126, .06, .06, , , .1, , .84, .1]),
    buf: null,
}

let audioInitialized = false

function initializeAudio() {
    try {
        audioInit().then(playLoop)
        audioInitialized = true
    }
    catch (err) {
    }
}

// https://html.spec.whatwg.org/multipage/interaction.html#activation-triggering-input-event

document.addEventListener('mousedown', () => {
    if (audioInitialized) return
    initializeAudio()
}, { once: true })

document.addEventListener('touchend', () => {
    if (audioInitialized) return
    initializeAudio()
}, { once: true })
