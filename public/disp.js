function createTimeBox(index) {
    let anchor = document.createElement("div");
    anchor.innerText = `Agendamentos do computador ${index}`
    let curHour = new Date().getHours();
    let curMin = new Date().getMinutes();
    let line;

    let i = 0;
    for (let hour = 8; hour <= 17; hour++) {
        if (hour % 2 == 0) {
            line = document.createElement("div");
            line.className = "row mb-5 mt-5 justify-content-around";
            anchor.appendChild(line);
        }
        for (let min = 0; min < 60; min += 30) {
            let formattedHour = ("0" + hour).slice(-2);
            let formattedMin = ("0" + min).slice(-2);
            let element = document.createElement("div");
            if ((curHour < hour) || (curHour == hour && curMin > 30 && min != 0)) {
                element.className = "green grower";
            } else {
                element.className = "red grower";
            }
            element.id = `${index}_${formattedHour}:${formattedMin}`
            element.innerText = `${formattedHour}:${formattedMin}`;
            line.appendChild(element);
        }
    }
    return anchor;
}

function createAll() {
    let root = document.getElementById("disp");
    for (let i = 0; i < 24; i++) {
        root.appendChild(createTimeBox(i));
    }
    let agendamentos;
    $.getJSON("/get-file", function (data) {
        agendamentos = data;
        console.log(agendamentos);
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < agendamentos[i]['horarios'].length; j++) {
                let hora = agendamentos[i]['horarios'][j].split("-")[0].replace("h", ":")
                let horaFinal = agendamentos[i]['horarios'][j].split("-")[1].replace("h", ":")
                horaFinal = `${i}_${horaFinal}`
                if (hora.split(":")[0] > 18) {
                    continue;
                } else {
                    let id = `${i}_${hora}`
                    let h = JSON.parse(hora.split(":")[0])
                    let m = hora.split(":")[1]
                    while (id != horaFinal) {
                        console.log(id)
                        document.getElementById(id).className = "red grower";
                        m = (m == "00") ? "30" : "00";
                        h = (m == "30") ? h : h + 1;
                        id = (h > 9) ? `${i}_${h}:${m}` : `${i}$0{h}:${m}`
                    }

                }
            }
        }
    });
}


window.addEventListener('load', createAll);