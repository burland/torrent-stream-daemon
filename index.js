const WebSocket = require('ws')
const WebTorrent = require('webtorrent')

/**
 * Create server and torrent client
 */
const wss = new WebSocket.Server({ port: 3000 })
const client = new WebTorrent()

let torrent = null
let server = null

/**
 * Function to stop torrent.
 */
function stopTorrent() {
  server.destroy()
  torrent.destroy()
  server = null
  torrent = null
}

wss.on('connection', function connection(ws) {

  /**
   * On message from client.
   */
  ws.on('message', function incoming(message) {
    let action = message.action

    /**
     * On start action.
     */
    if (action === 'start') {
      torrent = client.add(message.uri)
      torrent.once('ready', () => {
        server = torrent.localServer()
        server.listen(0, () => {
          ws.send(JSON.stringify({
            streaming: true,
            port: server.address().port,
            index: 0
          }))
        })
      })
    }

    /**
     * On stop action.
     */
    if (action === 'stop') {
      stopTorrent()
      ws.send(JSON.stringify({
        streaming: false
      }))
    }
  })

  /**
   * On connection close.
   */
  ws.on('close', function close() {
    stopTorrent()
  })
})
