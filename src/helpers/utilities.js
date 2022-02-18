function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatSeconds(seconds) {

    var sec_num = parseInt(seconds, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) { hours = "0" + hours; }

    if (minutes < 10) { minutes = "0" + minutes; }

    if (seconds < 10) { seconds = "0" + seconds; }

    return hours + ":" + minutes + ":" + seconds;

}

module.exports = { sleep, randomInteger, formatSeconds };