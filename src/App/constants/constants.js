const constants = {
    admin : 'admin',
    api_url : 'http://127.0.0.1:51312',
    endpoints : {
        run : '/start_worker',
        stop : '/stop_worker',
        status : '/status_worker',
        restart : null,
    },
    workers : {},
    statuses : {
        running : 'running',
        stopped : 'stopped',
        error : 'error'
    },
    successTriggers : {
        server : ['INFO : Using cpu for inference.', 'INFO : SSH Client closed'],
        playback : ['INFO : Video Playback socket listening on port 9999...', 'INFO : Exit flag reset.'],
        client : ['INFO : Connected to video playback socket.', 'INFO : Client subprocess terminated.']
    }
}

if (location.pathname.includes(constants.admin)) {
    constants.workers = {
        server : 'server',
        playback : 'playback',
        client : 'client',
    }
}
else  {
    constants.workers = {
        playback : 'playback',
        client : 'client',
    }
}

module.exports = constants