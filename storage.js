const EventEmitter = require('events')

let brainLock = false
const emitter = new EventEmitter()
const fs = require('fs')

module.exports = {
  async read(key) {
    if (brainLock) {
      await new Promise(resolve => emitter.once('unlocked', resolve))
    }
    brainLock = true

    const data = await fs.promises.readFile("brain.json")
    const value = JSON.parse(data.toString())[key]

    brainLock = false
    emitter.emit('unlocked')
    return value
  },
  async write(key, val) {
    if (brainLock) {
      await new Promise(resolve => emitter.once('unlocked', resolve))
    }
    brainLock = true

    const data = await fs.promises.readFile("brain.json")
    let brain = JSON.parse(data.toString())
    brain[key] = val
    await fs.promises.writeFile("brain.json", JSON.stringify(brain, null, 2))

    brainLock = false
    emitter.emit('unlocked')
  }
}
