function changePcsColor(computers) {
    $.getJSON("/get-class", function (classes) {
        $.ajax({
            url: '/get-schedule',
            type: 'POST',
            data: {
                pcId: computers[i * 6 + j].patrimonio,
                date: getDate(true)
            },
            success: function (response) {
                let h = new Date().getHours()
                let m = new Date().getMinutes()
                h = (h < 10) ? `0${h}` : `${h}`
                m = (m < 30) ? "00" : "30"
                let curTime = `${h}:${m}`
                let hours = {};
                for (let k = 1; k <= 21; k++) {
                    hours[k] = null;
                }
                for (let k = 0; k < response.length; k++) {
                    for (let l = response[k].id_inicio; l < response[k].id_fim; l++) {
                        hours[l] = response[k].email
                    }
                }
                for (let k = 0; k < classes.length; k++) {
                    for (let l = classes[k].id_inicio; l < classes[k].id_fim; l++) {
                        // minor hack to make it add display the class name
                        hours[l] = `${classes[k].descricao}@Em Aula`;
                    }
                }
                if (hours[getHourIndex(curTime)]) {
                    let id = computers[i * 6 + j].patrimonio
                    let name = hours[getHourIndex(curTime)].split('@')
                    if (name[1] == "Em Aula") {
                        document.getElementById(id).children[0].className = "img-fluid grower yellow"
                        document.getElementById(id).children[1].className += " yellow"
                    } else {
                        document.getElementById(id).children[0].className = "img-fluid grower red"
                        document.getElementById(id).children[1].className += " red"
                    }
                    document.getElementById(id).children[1].innerText = `Computador ${id}\nMemória RAM: 16GB\nProcessador: Ryzen 5600g\nAgendado: ${name[0]}`
                }
            },
            error: function (error) {
                alert(`[ERRO]!!! ${error.responseJSON.message}`);
            }
        });
    });
}

function generateComputers() {
    document.getElementById("txt-Principal").innerText += ` (${getDate()})`
    $.getJSON("/get-computers", function (computers) {
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
                changePcsColor(computers)
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
            alert(`[ERRO]!!! ${error.responseJSON.message}`);
        }
    });
}

function submit() {
    let value = document.getElementById("popup").children[0].value
    let hora1 = document.getElementById("hora1").value;
    let hora2 = document.getElementById("hora2").value;

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
            for (let i = 1; i <= 21; i++) {
                horarios[i] = true;
            }
            for (let i = 0; i < response.length; i++) {
                for (let k = response[i].id_inicio; k < response[i].id_fim; k++) {
                    horarios[k] = false
                }
            }
            let indisponivel = false;
            for (let i = getHourIndex(hora1); i < getHourIndex(hora2); i++) {
                if (!horarios[i]) {
                    indisponivel = true;
                    break;
                }
            }
            if (!horarios[getHourIndex(hora1)] || !horarios[getHourIndex(hora2)] || indisponivel) {
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
                        agendar(localStorage.getItem("email"), value, getHourIndex(hora1), getHourIndex(hora2))
                    } else {
                        alert("Usuário Inválido, não é possível agendar")
                    }
                });
            }
        },
        error: function (error) {
            alert(`[ERRO]!!! ${error.responseJSON.message}`);
        }
    });
}

function createHours() {
    let hora1 = document.getElementById("hora1")
    let curHour = new Date().getHours();
    let hourOffset = (curHour - 8 > 0) ? curHour - 8 : 0;
    let curMin = new Date().getMinutes();
    let minOffset = (curMin > 30) ? 30 : 0;
    for (let hour = 8 + hourOffset; hour <= 17; hour++) {
        for (let min = 0 + minOffset; min < 60; min += 30) {
            let formattedHour = ("0" + hour).slice(-2);
            let formattedMin = ("0" + min).slice(-2);
            let element = document.createElement("option");
            element.setAttribute("value", `${formattedHour}:${formattedMin}`);
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