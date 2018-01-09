const WebSocket = require('ws')
const WebTorrent = require('webtorrent')

/**
 * Create server and torrent client
 */
const wss = new WebSocket.Server({ port: 6969 })
const client = new WebTorrent()

/**
 * Global vars.
 */
let streaming = false
let torrent = {}
let server = {}

/**
 * Function to stop torrent.
 */
function stopTorrent() {
  server.destroy()
  torrent.destroy()
  server = {}
  torrent = {}
}

/**
 * On connection event.
 */
wss.on('connection', function connection(ws) {

  /**
   * On message from client.
   */
  ws.on('message', function incoming(message) {
    const action = message.action

    /**
     * On add request.
     */
    if (action === 'add') {
      if (steaming === 'true') {
        ws.send(JSON.stringify({
          streaming: true,
          port: server.address().port,
          index: 0
        }))
      } else {
        streaming = true
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
    }

    /**
     * On remove request.
     */
    if (action === 'remove') {
      streaming = false
      stopTorrent()
      ws.send(JSON.stringify({
        streaming: false
      }))
    }

    /**
     * On info request.
     */
    if (action === 'info') {
      ws.send(JSON.stringify({
        
      }))
    }
  })

  /**
   * On connection close.
   */
  ws.on('close', function close() {
    streaming = false
    stopTorrent()
  })
})
