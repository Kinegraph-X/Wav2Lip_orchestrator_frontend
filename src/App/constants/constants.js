const constants = {
    api_url : 'http://127.0.0.1:3001',
    endpoints : {
        run : '/start_worker',
        stop : '/stop_worker',
        status : '/status_worker',
        restart : null,
    },
    workers : {
        server : 'server',
        playback : 'playback',
        client : 'client',
    },
    statuses : {
        running : 'running',
        stopped : 'stopped',
        error : 'error'
    },
    successTriggers : {
        server : ['INFO : Using cpu for inference.', 'INFO : SSH Client closed'],
        playback : ['INFO : Server listening on port 9999...', 'INFO : Exit flag reset.'],
        client : ['INFO : Connected to video playback socket.', 'INFO : Client subprocess terminated.']
    }
}

module.exports = constants