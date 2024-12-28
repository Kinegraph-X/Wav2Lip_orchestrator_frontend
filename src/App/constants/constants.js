const constants = {
    api_url : 'http://127.0.0.1:3001',
    endpoints : {
        run : '/start_worker',
        stop : '/stop_worker',
        status : '/status_worker',
        restart : '/restart_worker',
    },
    workers : {
        server : 'server',
        playback : 'playback',
        client : 'client',
    },
    status : {
        running : 'Running',
        stopped : 'Stopped',
        error : 'Error'
    }
}

module.exports = constants