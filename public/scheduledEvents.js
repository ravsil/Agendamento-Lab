function update() {
    $.getJSON("/get-file", function (data) {
        let agendamentos = data
        let hora = new Date().getHours()
        let minuto = new Date().getMinutes()
        for (let i = 0; i < 24; i++) {
            if (agendamentos[i].horarios.length == 0) continue;

            for (let j = 0; j < agendamentos[i].horarios.length; j++) {
                let horario_inicio = agendamentos[i].horarios[j].split("-")[0].split("h");
                let horario_final = agendamentos[i].horarios[j].split("-")[1].split("h");
                // nao começou
                if ((horario_inicio[0] > hora) || (horario_inicio[0] == hora && horario_inicio[1] > minuto)) {
                    continue;
                }
                // ja passou
                else if ((hora > horario_final[0]) || (horario_final[0] == hora && minuto > horario_final[1])) {
                    agendamentos[i].horarios.splice(agendamentos[i].horarios.indexOf(agendamentos[i].horarios[j]), 1);
                    agendamentos[i].users.splice(agendamentos[i].users.indexOf(agendamentos[i].users[j]), 1);
                    j--;
                }
                else {
                    document.getElementById(i).children[0].className += " red";
                    document.getElementById(i).children[1].className += " red";
                    document.getElementById(`btn_${i}`).disabled = true;
                    if (i < 10) {
                        document.getElementById(i).children[1].innerText = `Computador ${i}\nMemória RAM: 16GB\nProcessador: Ryzen 5600g\nAgendado: ${agendamentos[i].users[j].split('@')[0]}`;
                    } else {
                        document.getElementById(i).children[1].innerText = `Computador ${i}\nMemória RAM: 4GB\nProcessador: ???\nAgendado: ${agendamentos[i].users[j].split('@')[0]}`;
                    }
                }

            }
        }
    })
}

setInterval(update, 60000);