function getDate(year = false) {
    let currentDate = new Date();
    let day = currentDate.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    let month = currentDate.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    if (year) {
        let year = currentDate.getFullYear();
        let date = `${day}/${month}/${year}`;
        return date;
    } else {
        let date = `${day}/${month}`;
        return date;
    }
}

function getHourIndex(hour) {
    let index;
    h = hour.split(":")[0]
    h = (h[0] == "0" ? JSON.parse(h[1]) : JSON.parse(h))

    m = hour.split(":")[1]

    index = (h - 8) * 2 + (m == "30" ? 1 : 0) + 1
    return index
}

function getIndexHour(index) {
    index--;
    let hour;
    let h = Math.floor(index / 2) + 8;
    let m = (index % 2 == 0) ? "00" : "30";
    hour = `${h}:${m}`;
    return hour;
}

// formats the description of a class so that it gets displayed better
// mainly used in the disp page
function formatString(str) {
    if (typeof str !== 'string') {
        return;
    }

    let result = '';
    let count = 0;
    let words = str.split(' ');

    for (let i = 0; i < words.length; i++) {
        if (count + words[i].length <= 17) {
            result += words[i];
            count += words[i].length;
        } else {
            result += '\n' + words[i];
            count = words[i].length;
        }

        if (i < words.length - 1 && count + 1 <= 17) {
            result += ' ';
            count++;
        } else if (i < words.length - 1) {
            result += '\n';
            count = 0;
        }
    }

    return result;
}