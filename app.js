'use strict'

import { CanvasHandle } from './node_modules/natlib/canvas/CanvasHandle.js'
import { startMainloop } from './node_modules/natlib/scheduling/mainloop.js'

import { createParticles } from './debug/debug.js'
import { con, scene } from './prelude.js'

AFRAME.registerComponent('dakka', {
    init() {
        const blast = event => {
            const visible = this.el.getAttribute('visible')
            if (!visible) return

            // Bullet start position
            const origin = this.el.components.raycaster.data.origin
            const startPos = new THREE.Vector3(origin.x, origin.y, origin.z)
            this.el.object3D.localToWorld(startPos)

            // Bullet end position and distance
            const { point: endPos, distance, uv } = event.detail.intersection

            // Bullet entity
            const bullet = document.createElement('a-entity')
            bullet.setAttribute('geometry', {
                primitive: 'sphere',
                radius: 0.05,
            })
            bullet.setAttribute('material', {
                color: '#f00',
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

                this.bulletHit(uv)
            })
        }

        this.el.addEventListener('click', blast)
        this.el.addEventListener('triggerdown', blast)
    },

    bulletHit(uv) {
        const x = 960 * (1 - uv.x)
        const y = 540 * (1 - uv.y)

        con.fillStyle = '#f00'
        con.fillRect(x - 4, y - 4, 8, 8)
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
        this.running = false

        const targets = document.querySelectorAll('.target')
        targets.forEach(target => {
            target.setAttribute('visible', true)
        })

        const update = () => {
            if (this.running) scene.update()
        }

        const render = t => {
            scene.vertices.forEach(v => v.interpolate(t));

            // con.beginPath();
            scene.vertices.forEach((p, index) => {
                // con.moveTo(p.interpolated.x + p.radius, p.interpolated.y);
                // con.arc(p.interpolated.x, p.interpolated.y, p.radius, 0, 2 * Math.PI);
                const [x, y, z, theta] = unproject(p.interpolated.x, p.interpolated.y)
                targets[index].object3D.position.set(x, y, z)
                // Look at the player
                targets[index].object3D.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -theta - 0.5 * Math.PI)
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
