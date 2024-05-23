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



function setImage(index) {
    let img = document.createElement("img");
    img.setAttribute("src", "https://cdn.glitch.global/da38d8b0-49b0-446f-95c2-2967b36af762/pc.png?v=1714602850340");


    img.className = "img-fluid grower";
    img.onclick = function () {
        window.location.href = `/disponibilidade?pc=${index}`
    }
    return img;
}

function setInfo(pc) {
    let info = document.createElement("div");

    // jeito feio de arrumar os elementos no mobile
    if (pc.patrimonio % 3 == 0 && window.innerWidth < 500) {
        info.className = "info left";
    } else if (pc.patrimonio % 3 == 2 && window.innerWidth < 500) {
        info.className = "info right";
    } else {
        info.className = "info";
    }
    info.innerText = `Computador ${pc.patrimonio}\nMemória RAM: ${pc.qtd_memoria_ram}\nProcessador: ${pc.processador}`
    return info;
}

function addBtn(id) {
    let btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.innerText = "Agendar";
    btn.id = `btn_${id}`;
    if (localStorage.getItem("name") == null) {
        btn.disabled = true
    }
    btn.onclick = function () {
        document.getElementById("popup").style.display = "block";
        document.getElementById("title").innerText = `Agendamento para o Computador ${id}`
        document.getElementById("popup").children[0].value = id
    }
    return btn;
}

function setItem(img, info, btn, index) {
    let item = document.createElement("div");
    item.className = "col-4 col-md-2";
    item.id = index;
    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(btn);
    return item;
}

function generateComputers() {
    let horas = {
        '08:00': 1,
        '08:30': 2,
        '09:00': 3,
        '09:30': 4,
        '10:00': 5,
        '10:30': 6,
        '11:00': 7,
        '11:30': 8,
        '12:00': 9,
        '12:30': 10,
        '13:00': 11,
        '13:30': 12,
        '14:00': 13,
        '14:30': 14,
        '15:00': 15,
        '15:30': 16,
        '16:00': 17,
        '16:30': 18,
        '17:00': 19,
        '17:30': 20,
        '18:00': 21,
    }

    $.getJSON("/get-computers", function (data) {
        let computers = data;
        document.getElementById("txt-Principal").innerText += ` (${getDate()})`
        let index = 0
        for (let i = 0; i < 5; i++) {
            let row = document.createElement("div");
            row.className = "row mb-5 mt-5 justify-content-around";
            document.getElementById("container0").appendChild(row);
            for (let j = 0; j < 6; j++) {
                let img = setImage(computers[i * 6 + j].patrimonio);
                let info = setInfo(computers[i * 6 + j]);
                let btn = addBtn(computers[i * 6 + j].patrimonio);
                let item = setItem(img, info, btn, computers[i * 6 + j].patrimonio);
                row.appendChild(item);
                $.ajax({
                    url: '/get-schedule',
                    type: 'POST',
                    data: {
                        pcId: computers[i * 6 + j].patrimonio,
                        date: getDate(true)
                    },
                    success: function (response) {
                        let hora = new Date().getHours()
                        let minuto = new Date().getMinutes()
                        hora = (hora < 10) ? `0${hora}` : `${hora}`
                        minuto = (minuto < 30) ? "00" : "30"
                        let horaAtual = `${hora}:${minuto}`
                        let horarios = {};
                        for (let k = 1; k <= 21; k++) {
                            horarios[k] = null;
                        }
                        for (let k = 0; k < response.length; k++) {
                            for (let l = response[k].id_inicio; l < response[k].id_fim; l++) {
                                horarios[l] = response[k].email
                            }
                        }
                        if (horarios[horas[horaAtual]]) {
                            let id = computers[i * 6 + j].patrimonio
                            document.getElementById(id).children[0].className = "img-fluid grower red"
                            document.getElementById(id).children[1].innerText = `Computador ${id}\nMemória RAM: 16GB\nProcessador: Ryzen 5600g\nAgendado: ${horarios[horas[horaAtual]].split('@')[0]}`
                        }
                    },
                    error: function (error) {
                        alert(`[ERRO]!!! ${error}`);
                    }
                });
            }
        }
        document.getElementsByTagName("body")[0].style.display = "block";
    });
}

function agendar(email, pcId, start, end) {
    $.ajax({
        url: '/schedule',
        type: 'POST',
        data: {
            email: email,
            pcId: pcId,
            start: start,
            end: end,
            date: getDate(true)
        },
        success: function (response) {
            alert(`Computador ${pcId} agendado com sucesso!`)
            window.location.href = "/agendamento"
        },
        error: function (error) {
            alert(`[ERRO]!!! ${error}`);
        }
    });
}

function submit() {
    let value = document.getElementById("popup").children[0].value
    let hora1 = document.getElementById("hora1").value;
    let hora2 = document.getElementById("hora2").value;
    let horario = `${hora1}-${hora2}`
    let horas = {
        '08:00': 1,
        '08:30': 2,
        '09:00': 3,
        '09:30': 4,
        '10:00': 5,
        '10:30': 6,
        '11:00': 7,
        '11:30': 8,
        '12:00': 9,
        '12:30': 10,
        '13:00': 11,
        '13:30': 12,
        '14:00': 13,
        '14:30': 14,
        '15:00': 15,
        '15:30': 16,
        '16:00': 17,
        '16:30': 18,
        '17:00': 19,
        '17:30': 20,
        '18:00': 21,
    }
    document.getElementById("popup").style.display = "none";
    $.ajax({
        url: '/get-schedule',
        type: 'POST',
        data: {
            pcId: value,
            date: getDate(true)
        },
        success: function (response) {
            let horarios = {};
            console.log(response)
            for (let i = 1; i <= 21; i++) {
                horarios[i] = true;
            }
            for (let i = 0; i < response.length; i++) {
                for (let k = response[i].id_inicio; k < response[i].id_fim; k++) {
                    horarios[k] = false
                }
            }
            console.log(horarios)
            let indisponivel = false;
            for (let i = horas[hora1]; i < horas[hora2]; i++) {
                if (!horarios[i]) {
                    indisponivel = true;
                    break;
                }
            }
            if (!horarios[horas[hora1]] || !horarios[horas[hora2]] || indisponivel) {
                alert("Já existe um agendamento neste horário")
            } else {
                $.getJSON("/get-users", function (user) {
                    let users = user;
                    let isUserOk = false;
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].email == localStorage.getItem("email")) {
                            isUserOk = true;
                            break;
                        }
                    }
                    if (isUserOk) {
                        agendar(localStorage.getItem("email"), value, horas[hora1], horas[hora2])
                    } else {
                        alert("Usuário Inválido, não é possível agendar")
                    }
                });
            }

        },
        error: function (error) {
            alert(`[ERRO]!!! ${error}`);
        }
    });
}

function createHours() {
    let hora1 = document.getElementById("hora1")
    let curHour = new Date().getHours();
    let hourOffset = (curHour - 8 > 0) ? curHour - 8 : 0;
    let curMin = new Date().getMinutes();
    let minOffset = (curMin > 30) ? 30 : 0;
    //let index = 0;
    //let indexOffset = (hourOffset*2) + (minOffset != 0);
    for (let hour = 8 + hourOffset; hour <= 17; hour++) {
        for (let min = 0 + minOffset; min < 60; min += 30) {
            let formattedHour = ("0" + hour).slice(-2);
            let formattedMin = ("0" + min).slice(-2);
            let element = document.createElement("option");
            element.setAttribute("value", `${formattedHour}:${formattedMin}`);
            //element.setAttribute("value", index++ + indexOffset);
            element.innerText = `${formattedHour}:${formattedMin}`;
            hora1.appendChild(element);
        }
        minOffset = 0;
    }

}

function updateHoraFinal() {
    // remove a opção vazia
    let hora1 = document.getElementById("hora1")
    let empty = hora1.querySelector('option[value=""]');
    if (empty) {
        hora1.removeChild(empty);
    }

    let hora1Value = hora1.value;
    let hora2Select = document.getElementById("hora2");
    hora2Select.disabled = false;
    hora2Select.innerHTML = ''; // Limpar as opções atuais

    let hora1Hour = parseInt(hora1Value.split(':')[0]);
    let hora1Min = parseInt(hora1Value.split(':')[1]);

    // Adicionar opções para o segundo select começando após o horário selecionado no primeiro select
    for (let hour = hora1Hour; hour <= 17; hour++) {
        for (let min = (hour == hora1Hour ? hora1Min + 30 : 0); min < 60; min += 30) {
            let formattedHour = ("0" + hour).slice(-2);
            let formattedMin = ("0" + min).slice(-2);
            hora2Select.innerHTML += `<option value="${formattedHour}:${formattedMin}">${formattedHour}:${formattedMin}</option>`;
        }
    }
    // Último horário
    hora2Select.innerHTML += `<option value="18:00">18:00</option>`;
}

window.addEventListener('load', generateComputers);
window.addEventListener('load', createHours);

// fecha o popup quando clica fora dele
window.onclick = function (event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}